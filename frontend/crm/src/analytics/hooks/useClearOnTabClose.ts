"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

function clearAllCookies() {
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0]?.trim();
    if (!name) return;

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
}

export function useClearOnTabClose(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const navEntries = performance.getEntriesByType(
      "navigation"
    ) as PerformanceNavigationTiming[];

    const navigationType = navEntries[0]?.type;

    // Skip reloads
    if (navigationType === "navigation") return;

    const handleBeforeUnload = () => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        clearAllCookies();
      } catch {
        // Fail silently — browser may block in some contexts
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled]);
}
