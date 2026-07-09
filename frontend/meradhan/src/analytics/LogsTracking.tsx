import { apiClientCaller } from "@/core/connection/apiClientCaller";
import useAppCookie from "@/hooks/useAppCookie.hook";
import apiGateway from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import z from "zod";

type PageView = Partial<
  z.infer<typeof appSchema.auditlogsSchema.PageViewSchema>
>;

export const PageTrackingProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const trackingId = useRef<string | null>(null);
  const { cookies } = useAppCookie();

  const pathname = usePathname();
  const [currentPageView, setCurrentPageView] = useState<PageView | null>(null);
  const pageViewIdRef = useRef<number | null>(null);
  const maxScrollRef = useRef(0);
  const interactionsRef = useRef(0);
  const visibilityTimeRef = useRef<number>(Date.now());
  const endPageViewRef = useRef<(() => Promise<void>) | null>(null);

  const auditApi = useMemo(
    () => new apiGateway.auditlog.AuditLogsApiV2(apiClientCaller),
    [],
  );

  const clearAllClientStorage = useCallback(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();

      const hostname = window.location.hostname;
      const domainVariants = ["", hostname, `.${hostname}`];

      document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name =
          eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        if (name) {
          domainVariants.forEach((domain) => {
            const domainPart = domain ? `;domain=${domain}` : "";
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${domainPart}`;
          });
        }
      });
    } catch (error) {
      console.error("Failed to clear client storage:", error);
    }
  }, []);

  useEffect(() => {
    // Initialize tracking session on mount
    const initTracking = async () => {
      if (!cookies.userId) {
        return;
      }
      trackingId.current = localStorage.getItem("analytics_session");
    }

    if (cookies.userId && localStorage.getItem("analytics_session")) {
      initTracking();
    }

  }, [cookies.userId]);

  // End page view function
  const endPageView = useCallback(async () => {
    if (!cookies.userId) {
      return;
    }
    if (!currentPageView || !pageViewIdRef.current || !trackingId.current)
      return;

    const exitTime = new Date();
    const duration = Math.floor(
      (exitTime.getTime() - currentPageView!.entryTime!.getTime()) / 1000,
    );

    try {
      await auditApi.endPageTrackingMeradhan(pageViewIdRef.current, {
        exitTime: exitTime,
        duration,
        scrollDepth: maxScrollRef.current,
        interactions: interactionsRef.current,
        sessionId: trackingId.current,
        userId: Number(cookies.userId) || undefined,
      });
    } catch (error) {
      console.error("Failed to end page tracking:", error);
    }
  }, [currentPageView, auditApi, cookies.userId]);

  // Update ref when endPageView changes
  useEffect(() => {
    endPageViewRef.current = endPageView;
  }, [endPageView]);

  // Start page view tracking
  useEffect(() => {
    const startPageView = async () => {
      // End the previous page view before starting a new one
      if (endPageViewRef.current) {
        await endPageViewRef.current();
      }

      // Session token is required, userId is optional
      if (!trackingId.current) return;

      if (pathname.startsWith("/logout")) {
        return;
      }

      try {
        // Reset per-page metrics
        maxScrollRef.current = 0;
        interactionsRef.current = 0;

        const pageData = {
          userId: Number(cookies.userId) || undefined, // Optional
          pagePath: pathname,
          entryTime: new Date(),
          sessionId: trackingId.current,
          interactions: 0,
          scrollDepth: 0,
          pageTitle: document.title,
          duration: 0,
          referrer: document.referrer,
        };

        const response = await auditApi.startPageTrackingMeradhan(pageData);

        const pageViewData = response.data.responseData;
        pageViewIdRef.current = pageViewData.pageViewId;
        setCurrentPageView({
          ...pageData,
          userId: Number(cookies.userId),
          sessionId: trackingId.current,
        });
      } catch (error) {
        console.error("Failed to start page tracking:", error);
      }
    };
    if (!cookies.userId) {
      return;
    }
    startPageView();
  }, [pathname, auditApi, cookies.userId]);

  useEffect(() => {
    const handlePageHide = () => {
      // Always clear client storage when leaving or closing the page
      // clearAllClientStorage();

      if (currentPageView && pageViewIdRef.current && trackingId.current) {
        const exitTime = new Date();
        const duration = Math.floor(
          (exitTime.getTime() - currentPageView.entryTime.getTime()) / 1000,
        );

        navigator.sendBeacon(
          "/api/server/auditlogs/meradhan/page-tracking/end/" +
          pageViewIdRef.current,
          JSON.stringify({
            pageViewId: pageViewIdRef.current,
            exitTime,
            duration,
            scrollDepth: maxScrollRef.current,
            interactions: interactionsRef.current,
            sessionId: trackingId.current,
            userId: cookies.userId || undefined,
          }),
        );
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
    };
  }, [clearAllClientStorage, currentPageView, cookies.userId]);

  // Track scroll depth
  useEffect(() => {
    let ticking = false;

    const getScrollPercent = () => {
      const el = document.scrollingElement || document.documentElement;
      const scrollTop = window.scrollY || el.scrollTop || 0;
      const scrollHeight = el.scrollHeight || 0;
      const clientHeight = el.clientHeight || 0;
      const maxScrollable = Math.max(scrollHeight - clientHeight, 1);
      const percent = Math.round((scrollTop / maxScrollable) * 100);
      return Math.min(Math.max(percent, 0), 100);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollPercent = getScrollPercent();
        if (scrollPercent > maxScrollRef.current) {
          maxScrollRef.current = scrollPercent;
          updateScrollDepth(scrollPercent);
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // Initial check
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  // Track interactions
  useEffect(() => {
    const handleInteraction = () => {
      if (document.visibilityState === "visible") {
        updateInteractions();
      }
    };

    const events = ["click", "keydown", "submit"];
    events.forEach((event) => {
      document.addEventListener(event, handleInteraction, true);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleInteraction, true);
      });
    };
  }, [pathname]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (endPageViewRef.current) {
          endPageViewRef.current();
        }
      } else {
        visibilityTimeRef.current = Date.now();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const updateScrollDepth = (depth: number) => {
    if (depth > maxScrollRef.current) {
      maxScrollRef.current = depth;
    }
  };

  const updateInteractions = () => {
    interactionsRef.current += 1;
  };

  return <>{children}</>;
};
