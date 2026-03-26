"use client";
import { useEffect } from "react";
import { track } from "../analytics";

const PAGE_TRACKING_SESSION_KEY = "md_page_tracking_session";
const closeSessionEndpoint = (userId: string | number) =>
  `/api/server/auditlogs/crm/close-session/${userId}`;

function clearAllCookies() {
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0]?.trim();
    if (!name) return;

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
}

function endAllSessions() {
  try {
    localStorage.clear();
    sessionStorage.clear();
    clearAllCookies();
  } catch {
    // Fail silently — browser may block in some contexts
  }

  // Broadcast to other tabs to end their session too
  try {
    localStorage.setItem("md_force_logout", Date.now().toString());
  } catch {
    // Fail silently
  }
}

const closeSession = (userId?: string | number, sessionId?: string | null) => {
  if (!userId) return;
  try {
    const body = {
      sessionId:
        sessionId ??
        localStorage.getItem(PAGE_TRACKING_SESSION_KEY) ??
        undefined,
    };
    navigator.sendBeacon(closeSessionEndpoint(userId), JSON.stringify(body));
  } catch {
    // Best-effort; ignore failures
  }
};

export function useClearOnTabClose(
  enabled = true,
  options?: { userId?: string | number; sessionId?: string | null }
) {
  useEffect(() => {
    if (!enabled) return;
    const { userId, sessionId } = options || {};

    const getNavigationType = () => {
      const entries = performance.getEntriesByType(
        "navigation"
      ) as PerformanceNavigationTiming[];
      const entryType = entries[0]?.type;
      // Fallback for older browsers
      // 1 = TYPE_RELOAD, 2 = TYPE_BACK_FORWARD
      const legacyType =
        (performance.navigation &&
          performance.navigation.type === 1 &&
          "reload") ||
        (performance.navigation &&
          performance.navigation.type === 2 &&
          "back_forward") ||
        undefined;
      return entryType ?? legacyType ?? "navigate";
    };

    const initialNavigationType = getNavigationType();

    const isReloadOrHistoryNav = () => {
      const nav = getNavigationType();

      return nav === "reload" || nav === "back_forward";
    };

    // Skip setup entirely when we know it's a reload or history navigation
    if (
      initialNavigationType === "reload" ||
      initialNavigationType === "back_forward"
    )
      return;

    let hasLogged = false;

    const handleBeforeUnload = (event?: Event) => {
      // Ignore reload/back/forward navigations
      if (isReloadOrHistoryNav()) return;

      // Ignore BFCache restores
      if (
        event instanceof PageTransitionEvent &&
        (event as PageTransitionEvent).persisted
      )
        return;

      if (!hasLogged) {
        try {
          track("auto_logout", { reason: "tab_or_window_closed" });
        } catch {
          // Fail silently — analytics should not interrupt user flow
        }
        hasLogged = true;
      }

      closeSession(userId, sessionId);
      endAllSessions();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);
    };
  }, [enabled, options]);

  // Inactivity auto-logout after 15 minutes
  useEffect(() => {
    if (!enabled) return;
    const { userId, sessionId } = options || {};

    const INACTIVITY_MS = 15 * 60 * 1000;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const clearAndLogout = () => {
      try {
        track("auto_logout", { reason: "inactive_15m" });
      } catch {
        // Fail silently — analytics should not interrupt user flow
      }
      closeSession(userId, sessionId);
      endAllSessions();
      window.location.replace("/logout");
    };

    const resetIdleTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(clearAndLogout, INACTIVITY_MS);
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];
    events.forEach((event) =>
      window.addEventListener(event, resetIdleTimer, true)
    );
    resetIdleTimer();

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      events.forEach((event) =>
        window.removeEventListener(event, resetIdleTimer, true)
      );
    };
  }, [enabled, options]);

  // React to logout broadcasts from other tabs
  useEffect(() => {
    if (!enabled) return;
    const { userId, sessionId } = options || {};

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "md_force_logout") {
        closeSession(userId, sessionId);
        endAllSessions();
        window.location.replace("/logout");
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [enabled, options]);
}
