"use client";

import { userSessionStore } from "@/core/auth/userSessionStore";
import { makeFullname } from "@/global/utils/formate";
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
import { track } from "./analytics";
import { useMaxScrollPercent } from "./hooks/useMaxScrollPercent";
import {
  Activity,
  ActivityDetails,
  ActivityType,
  CustomDetails,
} from "./types";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";

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
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as { timestamp: number; data: GeoData };
      const age = Date.now() - parsed.timestamp;
      if (age < ONE_HOUR_MS) {
        return parsed.data;
      }
    }

    const ipRes = await fetch("https://api.ipify.org?format=json");
    if (!ipRes.ok) throw new Error(`Failed to fetch IP: ${ipRes.status}`);
    const ipJson = await ipRes.json();
    const userIp = ipJson.ip as string;

    const geoRes = await fetch(
      `https://ipapi.co/${encodeURIComponent(userIp)}/json/`
    );
    if (!geoRes.ok) throw new Error(`Failed to fetch geo: ${geoRes.status}`);
    const geoJson = (await geoRes.json()) as GeoData;

    if (geoJson.latitude && typeof geoJson.latitude === "string") {
      geoJson.latitude = parseFloat(geoJson.latitude as unknown as string);
    }
    if (geoJson.longitude && typeof geoJson.longitude === "string") {
      geoJson.longitude = parseFloat(geoJson.longitude as unknown as string);
    }
    geoJson.ip = userIp;

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data: {
          ip: geoJson.ip,
          city: geoJson.city,
          latitude: geoJson.latitude,
          longitude: geoJson.longitude,
          country: geoJson.country,
          org: geoJson.org,
        },
      })
    );

    return {
      ip: geoJson.ip,
      city: geoJson.city,
      latitude: geoJson.latitude,
      longitude: geoJson.longitude,
      country: geoJson.country,
      org: geoJson.org,
    };
  } catch (err) {
    console.error("getUserIpData error:", err);
    return null;
  }
}

export interface TrackingContextValue {
  track: (type: ActivityType, details: ActivityDetails) => void;
  activities: Activity[];
  trackActivity: (type: ActivityType, details?: CustomDetails) => void;
  addActivity: (activity: {
    action: string;
    details: object;
    entityType: string;
    entityId?: number;
  }) => void;
}

export const TrackingContext = createContext<TrackingContextValue>({
  track: () => { },
  activities: [],
  trackActivity: () => { },
  addActivity: async () => { },
});

interface UserTrackingProviderProps {
  children: ReactNode;
}

export const UserTrackingProvider: React.FC<UserTrackingProviderProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const maxScrollPercent = useMaxScrollPercent("mainpage");
  const searchParams = useSearchParams();
  const { cookies } = useAppCookie();

  const [activities, setActivities] = useState<Activity[]>([]);
  const pageStart = useRef<number>(Date.now());
  const lastPath = useRef<string>(pathname);
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);

  // New: track clicks and max scroll per page
  const clickCount = useRef<number>(0);

  const logActivity = useCallback(
    (type: ActivityType, details: Record<string, unknown>) => {
      const entry: Activity = {
        type,
        details,
        time: new Date().toLocaleTimeString(),
      };
      setActivities((prev) => [entry, ...prev.slice(0, 19)]);
      track(type, details);
    },
    []
  );

  const { session } = userSessionStore();

  const trackActivity = useCallback(
    async (type: ActivityType, data: Record<string, unknown> = {}) => {
      if (session) {
        localStorage.setItem(
          "name",
          makeFullname({
            firstName: session.firstName,
            lastName: session.lastName,
            middleName: session.middleName,
          })
        );
        localStorage.setItem("email", session.emailAddress);
      }

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

        maxScrollPercent: maxScrollPercent,
        ipData: await getUserIpData(),
        user: {
          name: session
            ? makeFullname({
              firstName: session.firstName,
              lastName: session.lastName,
              middleName: session.middleName,
            })
            : localStorage.getItem("name"),
          email: session?.emailAddress || localStorage.getItem("email"),
        },
        ...data,
      };
      logActivity(type, payload);
    },
    [pathname, searchParams, cookies, logActivity, maxScrollPercent, session]
  );

  /** -------------------------------
   * Track page view
   --------------------------------*/
  useEffect(() => {
    const timer = setTimeout(() => {
      trackActivity("page_view");
      pageStart.current = Date.now();
      lastPath.current = pathname;
    }, 300); // small delay ensures title & DOM are ready

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  /** -------------------------------
   * Track clicks
   --------------------------------*/
  useEffect(() => {
    const onClick = () => {
      clickCount.current += 1;
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  /** -------------------------------
   * Track route change duration + send page metrics
   --------------------------------*/
  useEffect(() => {
    if (lastPath.current && lastPath.current !== pathname) {
      const duration = Math.round((Date.now() - pageStart.current) / 1000);
      trackActivity("page_duration", {
        duration,
        from: lastPath.current,
        to: pathname,
        clicks: clickCount.current,
      });
    }

    // Reset after tracking
    clickCount.current = 0;
    pageStart.current = Date.now();
    lastPath.current = pathname;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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
        clicks: clickCount.current,
      });
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** -------------------------------
   * Inactivity Auto-Logout
   --------------------------------*/
  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "touchstart"];

    const resetIdleTimer = () => {
      if (idleTimeout.current) clearTimeout(idleTimeout.current);

      idleTimeout.current = setTimeout(() => {
        if (cookies.userId && pathname.startsWith("/dashboard")) {
          trackActivity("auto_logout", {
            reason: "User inactive for 5 minutes",
          });
        }
      }, 500 * 60 * 1000); // 5 minutes
    };

    events.forEach((event) => window.addEventListener(event, resetIdleTimer));
    resetIdleTimer();

    return () => {
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
      events.forEach((event) =>
        window.removeEventListener(event, resetIdleTimer)
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apiCate = new apiGateway.auditlog.AuditLogsApiV2(apiClientCaller);
  const addActivity = async (data: {
    action: string;
    details: object;
    entityType: string;
    entityId?: number;
  }) => {
    return await apiCate.createActivityLogMeradhan({
      action: data.action,
      details: data.details,
      entityType: data.entityType,
      entityId: data.entityId,
    });
  };

  return (
    <TrackingContext.Provider
      value={{
        track,
        activities,
        trackActivity,
        addActivity: (data: {
          action: string;
          details: object;
          entityType: string;
          entityId?: number;
        }) => {
          console.log("Adding activity:", data);

          addActivity(data)
            .then((e) => {
              console.log(e);
            })
            .catch((e) => {
              console.log(e);
            });
        },
      }}
    >
      {children}
      {/* <ActivityWindow activities={activities} /> */}
    </TrackingContext.Provider>
  );
};

export const useUserTracking = (): TrackingContextValue =>
  useContext(TrackingContext);

export const addActivityLog = async (data: {
  action: string;
  details: object;
  entityType: string;
  entityId?: number;
}) => {
  const apiCate = new apiGateway.auditlog.AuditLogsApiV2(apiClientCaller);
  return await apiCate.createActivityLogMeradhan({
    action: data.action,
    details: data.details,
    entityType: data.entityType,
    entityId: data.entityId,
  });
};
