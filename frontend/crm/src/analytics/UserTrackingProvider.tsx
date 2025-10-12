"use client";

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
import ActivityWindow from "./ActivityWindow";
import {
  Activity,
  ActivityDetails,
  ActivityType,
  CustomDetails,
} from "./types";
import useAppCookie from "@/hooks/useAppCookie.hook";

export interface TrackingContextValue {
  track: (type: ActivityType, details: ActivityDetails) => void;
  activities: Activity[];
  trackActivity: (type: ActivityType, details: CustomDetails) => void;
}

export const TrackingContext = createContext<TrackingContextValue>({
  track: () => {}, // default no-op
  activities: [],
  trackActivity() {},
});

interface UserTrackingProviderProps {
  children: ReactNode;
}

export const UserTrackingProvider: React.FC<UserTrackingProviderProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activities, setActivities] = useState<Activity[]>([]);
  const pageStart = useRef(Date.now());
  const { cookies } = useAppCookie();
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);
  // Log event locally + send to server
  const logActivity = (
    type: Activity["type"],
    details: Record<string, unknown>
  ) => {
    const entry: Activity = {
      type,
      details,
      time: new Date().toLocaleTimeString(),
    };
    console.log(entry);

    setActivities((prev) => [entry, ...prev.slice(0, 19)]);
    track(type, details);
  };

  const trackActivity = useCallback(
    (
      type: ActivityType,
      data: Record<string, unknown> | undefined = undefined
    ) => {
      const payload = {
        url: pathname,
        query: searchParams?.toString() || "",
        title: document.title,
        referrer: document.referrer,
        screen: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        browser: navigator.userAgent,
        os: navigator.platform,
        language: navigator.language,
        cookies,
        userId: cookies.userId,
        role: cookies.role,
        data,
      };
      if (type) logActivity(type, payload);
    },
    [pathname, searchParams, cookies]
  );

  // Track page view with detailed info
  useEffect(() => {
    trackActivity("page_view");
    pageStart.current = Date.now();
  }, [trackActivity]);

  // Track scroll depth
  useEffect(() => {
    let maxScroll = 0;
    const onScroll = () => {
      const percent = Math.round(
        ((window.scrollY + window.innerHeight) / document.body.scrollHeight) *
          100
      );
      if (percent > maxScroll) {
        maxScroll = percent;
        trackActivity("scroll_depth", { percent });
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [trackActivity]);

  // Heartbeat and tab visibility
  useEffect(() => {
    const id = setInterval(() => {
      if (pathname.startsWith("/dashboard")) {
        trackActivity("heartbeat", { visible: document.visibilityState });
      }
    }, 15000);
    return () => clearInterval(id);
  }, [trackActivity, pathname]);

  // Track page duration on unload
  useEffect(() => {
    const onUnload = () => {
      const duration = Math.round((Date.now() - pageStart.current) / 1000);
      trackActivity("page_duration", { duration, url: pathname });
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [pathname, trackActivity]);

  // ----- Inactivity auto-logout -----
  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "touchstart"];

    const resetIdleTimer = () => {
      if (idleTimeout.current) clearTimeout(idleTimeout.current);

      idleTimeout.current = setTimeout(() => {
        if (cookies.token && pathname.startsWith("/dashboard")) {
          trackActivity("auto_logout", {
            reason: "auto logout inactivity time expired",
          });
        }
      }, 1 * 60 * 10); // 5 minutes
    };

    events.forEach((event) => window.addEventListener(event, resetIdleTimer));
    resetIdleTimer(); // Start timer initially

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
