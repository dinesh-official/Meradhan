"use client";

import { getSessionId } from "@/analytics/analytics";
import useAppCookie from "@/hooks/useAppCookie.hook";
import { useEffect } from "react";

export default function LogoutRedirect() {
  const { removeCookie } = useAppCookie();

  useEffect(() => {
    const logoutUser = async () => {
      try {
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
        getSessionId();
        // Redirect to login after a brief delay
        setTimeout(() => window.location.replace("/login"), 1500);
      } catch (error) {
        console.error("Logout error:", error);
        window.location.replace("/login");
      }
    };

    const timer = setTimeout(() => {
      logoutUser();
    }, 500);

    return () => clearTimeout(timer);
  }, [removeCookie]);

  return <div></div>;
}
