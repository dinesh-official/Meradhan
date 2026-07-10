"use client";

import useAppCookie from "@/hooks/useAppCookie.hook";
import { useEffect } from "react";

const PAGE_TRACKING_SESSION_KEY = "md_page_tracking_session";
const closeSessionEndpoint = (userId: string | number) =>
  `/api/server/auditlogs/crm/close-session/${userId}`;

export default function LogoutRedirect() {
  const { removeCookie, cookies } = useAppCookie();
  const userId = cookies?.userId;

  useEffect(() => {
    const logoutUser = async () => {
      try {
        // Notify backend to close tracking session if userId available
        if (userId) {
          try {
            await fetch(closeSessionEndpoint(userId), {
              method: "POST",
              keepalive: true,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId: localStorage.getItem(PAGE_TRACKING_SESSION_KEY),
              }),
            });
          } catch {
            // best-effort; ignore errors
          }
        }

        // Clear all cookies manually
        document.cookie.split(";").forEach((cookie) => {
          const name = cookie.split("=")[0].trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
        });

        removeCookie("token");
        removeCookie("role");
        removeCookie("userId");
        localStorage.clear();
        sessionStorage.clear();
        localStorage.removeItem(PAGE_TRACKING_SESSION_KEY);
        // Redirect to login after a brief delay
        setTimeout(() => window.location.replace("/login"), 1500);
      } catch {
        window.location.replace("/login");
      }
    };

    const timer = setTimeout(() => {
      logoutUser();
    }, 500);

    return () => clearTimeout(timer);
  }, [removeCookie, userId]);

  return <div></div>;
}
