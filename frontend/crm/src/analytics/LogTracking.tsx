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
  const { cookies } = useAppCookie();
  const pathname = usePathname();
  const [currentPageView, setCurrentPageView] = useState<PageView | null>(null);
  const pageViewIdRef = useRef<number | null>(null);
  const maxScrollRef = useRef(0);
  const interactionsRef = useRef(0);
  const visibilityTimeRef = useRef<number>(Date.now());
  const hasEndedRef = useRef<boolean>(false); // Track if current page view has been ended
  const isEndingRef = useRef<boolean>(false); // Prevent concurrent end calls
  const auditApi = useMemo(
    () => new apiGateway.auditlog.AuditLogsApiV2(apiClientCaller),
    []
  );

  // End page view function
  const endPageView = useCallback(async () => {
    if (
      !currentPageView ||
      !pageViewIdRef.current ||
      !cookies.userId ||
      !cookies.token ||
      hasEndedRef.current ||
      isEndingRef.current
    )
      return;

    isEndingRef.current = true;

    const exitTime = new Date();
    const duration = Math.floor(
      (exitTime.getTime() - currentPageView!.entryTime!.getTime()) / 1000
    );

    try {
      await auditApi.endPageTrackingCrm(pageViewIdRef.current, {
        exitTime: exitTime,
        duration,
        scrollDepth: maxScrollRef.current,
        interactions: interactionsRef.current,
        sessionId: cookies.token,
      });
      hasEndedRef.current = true;
    } catch {
      // Silently fail - page tracking should not interrupt user flow
    } finally {
      isEndingRef.current = false;
    }
  }, [currentPageView, cookies.userId, cookies.token, auditApi]);

  // Start page view tracking
  useEffect(() => {
    const startPageView = async () => {
      // End previous page view if exists
      await endPageView();

      if (!cookies.userId || !cookies.token) return;

      if (pathname.startsWith("/logout")) {
        return;
      }

      // Reset tracking state for new page view
      hasEndedRef.current = false;
      maxScrollRef.current = 0;
      interactionsRef.current = 0;
      visibilityTimeRef.current = Date.now();

      try {
        const pageData = {
          userId: cookies.userId,
          pagePath: pathname,
          entryTime: new Date(),
          sessionId: cookies.token,
          interactions: 0,
          scrollDepth: 0,
          pageTitle: document.title,
          duration: 0,
          referrer: document.referrer,
        };

        const response = await auditApi.startPageTrackingCrm(pageData);

        const pageViewData = response.data.responseData;
        pageViewIdRef.current = pageViewData.pageViewId;
        setCurrentPageView({
          ...pageData,
          userId: cookies.userId,
          sessionId: cookies.token,
        });
      } catch {
        // Silently fail - page tracking should not interrupt user flow
      }
    };
    console.log("runing");

    startPageView();
  }, [pathname, cookies.userId, cookies.token]);

  // Handle page unload (browser/tab close) - use sendBeacon for reliability
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (
        currentPageView &&
        pageViewIdRef.current &&
        cookies.userId &&
        !hasEndedRef.current
      ) {
        const exitTime = new Date();
        const duration = Math.floor(
          (exitTime.getTime() - currentPageView.entryTime!.getTime()) / 1000
        );

        // Use sendBeacon for reliable data sending on page unload
        navigator.sendBeacon(
          "/api/server/auditlogs/crm/page-tracking/end/" +
            pageViewIdRef.current,
          JSON.stringify({
            pageViewId: pageViewIdRef.current,
            exitTime,
            duration,
            scrollDepth: maxScrollRef.current,
            interactions: interactionsRef.current,
            sessionId: cookies.token,
          })
        );
        hasEndedRef.current = true;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentPageView, cookies.userId, cookies.token]);

  // Track scroll depth
  useEffect(() => {
    const element = document.getElementById("mainpage") as HTMLElement | null;
    if (!element) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const scrollPercent =
        scrollHeight > clientHeight
          ? Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)
          : 0;

      if (scrollPercent > maxScrollRef.current) {
        maxScrollRef.current = scrollPercent;
      }
    };

    element.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      element.removeEventListener("scroll", handleScroll);
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

  // Handle page visibility changes (only for backgrounding, not navigation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !hasEndedRef.current) {
        // Only end if page is being backgrounded, not if already ended
        endPageView();
      } else if (document.visibilityState === "visible") {
        visibilityTimeRef.current = Date.now();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [pathname]);

  const updateInteractions = () => {
    interactionsRef.current += 1;
  };

  return <>{children}</>;
};
