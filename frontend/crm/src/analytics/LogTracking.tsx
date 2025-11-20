import { apiClientCaller } from "@/core/connection/apiClientCaller";
import useAppCookie from "@/hooks/useAppCookie.hook";
import apiGateway from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import z from "zod";

type PageView = Partial<
  z.infer<typeof appSchema.auditlogsSchema.PageViewSchema>
>;

export const PageTrackingProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { cookies } = useAppCookie();
  console.log(cookies);

  const pathname = usePathname();
  const [currentPageView, setCurrentPageView] = useState<PageView | null>(null);
  const pageViewIdRef = useRef<number | null>(null);
  const maxScrollRef = useRef(0);
  const interactionsRef = useRef(0);
  const visibilityTimeRef = useRef<number>(Date.now());
  const auditApi = new apiGateway.auditlog.AuditLogsApiV2(apiClientCaller);

  // Start page view tracking
  useEffect(() => {
    const startPageView = async () => {
      await endPageView();

      if (!cookies.userId || !cookies.token) return;

      if (pathname.startsWith("/logout")) {
        return;
      }

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
      } catch (error) {
        console.error("Failed to start page tracking:", error);
      }
    };

    startPageView();
  }, [pathname]);

  useEffect(() => {
    let isInternalNavigation = false;

    // Detect internal navigation (e.g., clicking links inside the SPA)
    const markInternalNavigation = () => {
      isInternalNavigation = true;
    };

    // Listen to clicks inside the app
    window.addEventListener("click", markInternalNavigation);

    const handleBeforeUnload = () => {
      // Run only when the tab/browser is closed — not internal navigation
      if (!isInternalNavigation) {
        if (currentPageView && pageViewIdRef.current && cookies.userId) {
          const exitTime = new Date();
          const duration = Math.floor(
            (exitTime.getTime() - currentPageView.entryTime.getTime()) / 1000
          );
          localStorage.clear();
          sessionStorage.clear();

          // Clear all cookies
          // document.cookie.split(";").forEach((cookie) => {
          //   const name = cookie.split("=")[0].trim();
          //   document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          // });
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
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("click", markInternalNavigation);
    };
  }, [currentPageView, cookies.userId, cookies.token, pathname]);

  // End page view function
  const endPageView = async () => {
    if (
      !currentPageView ||
      !pageViewIdRef.current ||
      !cookies.userId ||
      !cookies.token
    )
      return;

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
    } catch (error) {
      console.error("Failed to end page tracking:", error);
    }
  };

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
        updateScrollDepth(scrollPercent);
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

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        endPageView();
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

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentPageView && pageViewIdRef.current && cookies.userId) {
        const exitTime = new Date();
        const duration = Math.floor(
          (exitTime.getTime() - currentPageView.entryTime!.getTime()) / 1000
        );
        endPageView();
        // Use sendBeacon for reliable data sending on page unload
        navigator.sendBeacon(
          "/api/server/auditlogs/crm/page-tracking/end/" +
            pageViewIdRef.current,
          JSON.stringify({
            pageViewId: pageViewIdRef.current,
            exitTime: exitTime,
            duration,
            scrollDepth: maxScrollRef.current,
            interactions: interactionsRef.current,
            sessionId: cookies.token,
          })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentPageView, cookies.userId, cookies.token, pathname]);

  const updateInteractions = () => {
    interactionsRef.current += 1;
  };

  return <>{children}</>;
};
