"use client";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import useAppCookie from "@/hooks/useAppCookie.hook";
import apiGateway from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import z from "zod";

// const clearAllCookies = () => {
//   document.cookie.split(";").forEach((cookie) => {
//     const name = cookie.split("=")[0]?.trim();
//     if (!name) return;
//     document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
//   });
// };

// const PAGE_TRACKING_SESSION_KEY = "md_page_tracking_session";
// const closeSessionEndpoint = (userId: string | number) =>
//   `/api/server/auditlogs/crm/close-session/${userId}`;

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
  const sessionIdRef = useRef<string | null>(null);
  const hasEndedRef = useRef<boolean>(false); // Track if current page view has been ended
  const isEndingRef = useRef<boolean>(false); // Prevent concurrent end calls
  const auditApi = useMemo(
    () => new apiGateway.auditlog.AuditLogsApiV2(apiClientCaller),
    []
  );

  // const checkSessionExists = useCallback(() => {
  //   return cookies.SESSION && cookies.token;
  // }, [cookies.SESSION, cookies.token]);

  // Maintain a stable tracking session id per login
  // useEffect(() => {
  //   if (cookies.token) {
  //     const existing =
  //       sessionIdRef.current || localStorage.getItem(PAGE_TRACKING_SESSION_KEY);
  //     if (existing) {
  //       sessionIdRef.current = existing;
  //     } else {
  //       const fresh = `session_${Date.now()}_${Math.random()
  //         .toString(36)
  //         .slice(2, 9)}`;
  //       sessionIdRef.current = fresh;
  //       localStorage.setItem(PAGE_TRACKING_SESSION_KEY, fresh);
  //     }
  //   } else {
  //     sessionIdRef.current = null;
  //     localStorage.removeItem(PAGE_TRACKING_SESSION_KEY);
  //   }
  // }, [cookies.token]);

  // useClearOnTabClose(pathname.startsWith("/dashboard"), {
  //   userId: cookies.userId,
  //   sessionId: sessionIdRef.current || cookies.token,
  // });

  // useEffect(() => {
  //   if (pathname.startsWith("/dashboard")) {
  //     if (!checkSessionExists()) {
  //       window.location.href = "/logout";
  //     }
  //   }
  // }, [pathname, checkSessionExists]);

  // End page view function
  const endPageView = useCallback(async () => {
    if (
      !currentPageView ||
      !pageViewIdRef.current ||
      !cookies.userId ||
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

      });
      hasEndedRef.current = true;
    } catch {
      // Silently fail - page tracking should not interrupt user flow
    } finally {
      isEndingRef.current = false;
    }
  }, [currentPageView, auditApi, cookies.userId]);

  // Ref to latest endPageView so pathname effect doesn't depend on it (avoids loop:
  // startPageView -> setState -> endPageView identity changes -> effect re-runs)
  const endPageViewRef = useRef(endPageView);
  endPageViewRef.current = endPageView;

  // Start page view tracking
  useEffect(() => {
    const startPageView = async () => {
      // End previous page view if exists (use ref to avoid effect re-running when endPageView identity changes)
      await endPageViewRef.current();

      if (!cookies.userId) return;

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
          userId: Number(cookies.userId),
          pagePath: pathname,
          entryTime: new Date(),
          sessionId: sessionIdRef.current || cookies.token,
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
          userId: Number(cookies.userId),
          sessionId: sessionIdRef.current || cookies.token,
        });
      } catch {
        // Silently fail - page tracking should not interrupt user flow
      }
    };

    startPageView();
  }, [pathname, auditApi, cookies.token, cookies.userId]);

  // Handle page unload (browser/tab close) - use sendBeacon for reliability
  // useEffect(() => {
  //   const handleBeforeUnload = () => {
  //     if (
  //       currentPageView &&
  //       pageViewIdRef.current &&
  //       cookies.userId &&
  //       !hasEndedRef.current
  //     ) {
  //       const exitTime = new Date();
  //       const duration = Math.floor(
  //         (exitTime.getTime() - currentPageView.entryTime!.getTime()) / 1000
  //       );
  //       sessionStorage.clear();
  //       localStorage.clear();
  //       // Use sendBeacon for reliable data sending on page unload
  //       navigator.sendBeacon(
  //         "/api/server/auditlogs/crm/page-tracking/end/" +
  //         pageViewIdRef.current,
  //         JSON.stringify({
  //           pageViewId: pageViewIdRef.current,
  //           exitTime,
  //           duration,
  //           scrollDepth: maxScrollRef.current,
  //           interactions: interactionsRef.current,
  //           sessionId: sessionIdRef.current || cookies.token,
  //         })
  //       );
  //       hasEndedRef.current = true;

  //       // Also close tracking session on the backend
  //       try {
  //         if (cookies.userId) {
  //           navigator.sendBeacon(
  //             closeSessionEndpoint(cookies.userId),
  //             JSON.stringify({
  //               sessionId: sessionIdRef.current || cookies.token,
  //             })
  //           );
  //         }
  //       } catch {
  //         // Silently fail - cleanup should not interrupt user flow
  //       }

  //       try {
  //         sessionStorage.clear();
  //         localStorage.clear();
  //         clearAllCookies();
  //       } catch {
  //         // Silently fail - cleanup should not interrupt user flow
  //       }
  //     }
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);
  //   return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  // }, [currentPageView]);

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
  }, [pathname, endPageView]);

  const updateInteractions = () => {
    interactionsRef.current += 1;
  };

  return <>{children}</>;
};
