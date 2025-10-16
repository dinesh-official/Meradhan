"use client";

import useAppCookie from "@/hooks/useAppCookie.hook";
import {
  usePathname,
  useSearchParams
} from "next/navigation";
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
    (type: ActivityType, data: Record<string, unknown> = {}) => {
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

export const useUserTracking = (): TrackingContextValue => useContext(TrackingContext);
