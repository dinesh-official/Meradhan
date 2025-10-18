"use client";

import useAppCookie from "@/hooks/useAppCookie.hook";
import { usePathname, useSearchParams } from "next/navigation";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import ActivityWindow from "./ActivityWindow";
import { track } from "./analytics";
import {
  Activity,
  ActivityDetails,
  ActivityType,
  CustomDetails,
} from "./types";

type GeoData = {
  ip?: string;
  city?: string;
  region?: string;
  region_code?: string;
  country?: string;
  country_name?: string;
  postal?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  utc_offset?: string;
  org?: string;
  asn?: string;
};

const LOCAL_STORAGE_KEY = "ipLocationData";
const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour

export async function getUserIpData(): Promise<GeoData | null> {
  try {
    // 1) Check localStorage
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as { timestamp: number; data: GeoData };
      const age = Date.now() - parsed.timestamp;
      if (age < ONE_HOUR_MS) {
        return parsed.data; // return cached data
      }
    }

    // 2) Fetch public IP
    const ipRes = await fetch("https://api.ipify.org?format=json");
    if (!ipRes.ok) throw new Error(`Failed to fetch IP: ${ipRes.status}`);
    const ipJson = await ipRes.json();
    const userIp = ipJson.ip as string;

    // 3) Fetch geo data
    const geoRes = await fetch(
      `https://ipapi.co/${encodeURIComponent(userIp)}/json/`
    );
    if (!geoRes.ok) throw new Error(`Failed to fetch geo: ${geoRes.status}`);
    const geoJson = (await geoRes.json()) as GeoData;

    // Normalize lat/long
    if (geoJson.latitude && typeof geoJson.latitude === "string") {
      geoJson.latitude = parseFloat(geoJson.latitude as unknown as string);
    }
    if (geoJson.longitude && typeof geoJson.longitude === "string") {
      geoJson.longitude = parseFloat(geoJson.longitude as unknown as string);
    }
    geoJson.ip = userIp;

    // Save to localStorage with timestamp
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ timestamp: Date.now(), data: geoJson })
    );

    return geoJson;
  } catch (err) {
    console.error("getUserIpData error:", err);
    return null;
  }
}

export interface TrackingContextValue {
  track: (type: ActivityType, details: ActivityDetails) => void;
  activities: Activity[];
  trackActivity: (type: ActivityType, details?: CustomDetails) => void;
}

export const TrackingContext = createContext<TrackingContextValue>({
  track: () => {},
  activities: [],
  trackActivity: () => {},
});

interface UserTrackingProviderProps {
  children: ReactNode;
}

export const UserTrackingProvider: React.FC<UserTrackingProviderProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cookies } = useAppCookie();

  const [activities, setActivities] = useState<Activity[]>([]);
  const pageStart = useRef<number>(Date.now());
  const lastPath = useRef<string>(pathname);
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);

  /** -------------------------------
   * Log activity to UI + server
   --------------------------------*/
  const logActivity = useCallback(
    (type: ActivityType, details: Record<string, unknown>) => {
      const entry: Activity = {
        type,
        details,
        time: new Date().toLocaleTimeString(),
      };
      console.log("[TRACK]", entry);
      setActivities((prev) => [entry, ...prev.slice(0, 19)]);
      track(type, details);
    },
    []
  );

  /** -------------------------------
   * Public API: trackActivity
   --------------------------------*/
  const trackActivity = useCallback(
    async (type: ActivityType, data: Record<string, unknown> = {}) => {
      if (!type) return;
      const payload = {
        url: pathname,
        query: searchParams?.toString() || "",
        title: document.title,
        referrer: document.referrer,
        screen: { width: window.innerWidth, height: window.innerHeight },
        browser: navigator.userAgent,
        os: navigator.platform,
        language: navigator.language,
        userId: cookies.userId,
        role: cookies.role,
        token: cookies.token,
        ipData: await getUserIpData(),
        ...data,
      };
      logActivity(type, payload);
    },
    [pathname, searchParams, cookies, logActivity]
  );

  /** -------------------------------
   * Track page view
   --------------------------------*/
  useEffect(() => {
    trackActivity("page_view");
    pageStart.current = Date.now();
    lastPath.current = pathname;
  }, [pathname, trackActivity]);

  /** -------------------------------
   * Track scroll depth (throttled)
   --------------------------------*/
  useEffect(() => {
    let maxScroll = 0;
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const percent = Math.round(
            ((window.scrollY + window.innerHeight) /
              document.body.scrollHeight) *
              100
          );
          if (percent > maxScroll) {
            maxScroll = percent;
            trackActivity("scroll_depth", { percent });
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [trackActivity]);

  /** -------------------------------
   * Track route change duration
   --------------------------------*/
  useEffect(() => {
    if (lastPath.current !== pathname) {
      const duration = Math.round((Date.now() - pageStart.current) / 1000);
      trackActivity("page_duration", {
        duration,
        from: lastPath.current,
        to: pathname,
      });
      pageStart.current = Date.now();
      lastPath.current = pathname;
    }
  }, [pathname, trackActivity]);

  /** -------------------------------
   * Track unload (page close / refresh)
   --------------------------------*/
  useEffect(() => {
    const handleUnload = () => {
      const duration = Math.round((Date.now() - pageStart.current) / 1000);
      trackActivity("page_duration", {
        duration,
        url: pathname,
        reason: "page_unload",
      });
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [pathname, trackActivity]);

  /** -------------------------------
   * Inactivity Auto-Logout (accurate)
   --------------------------------*/
  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "touchstart"];

    const resetIdleTimer = () => {
      if (idleTimeout.current) clearTimeout(idleTimeout.current);

      idleTimeout.current = setTimeout(() => {
        if (cookies.token && pathname.startsWith("/dashboard")) {
          trackActivity("auto_logout", {
            reason: "User inactive for 5 minutes",
          });
        }
      }, 5000 * 60 * 1000); // 5 minutes
    };

    events.forEach((event) => window.addEventListener(event, resetIdleTimer));
    resetIdleTimer();

    return () => {
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
      events.forEach((event) =>
        window.removeEventListener(event, resetIdleTimer)
      );
    };
  }, [trackActivity, cookies, pathname]);

  return (
    <TrackingContext.Provider value={{ track, activities, trackActivity }}>
      {children}
      <ActivityWindow activities={activities} />
    </TrackingContext.Provider>
  );
};

export const useUserTracking = (): TrackingContextValue =>
  useContext(TrackingContext);
