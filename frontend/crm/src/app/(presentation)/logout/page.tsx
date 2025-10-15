"use client";

import { Button } from "@/components/ui/button";
import useAppCookie from "@/hooks/useAppCookie.hook";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function LogoutRedirect() {
  const { removeCookie } = useAppCookie();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        if (typeof window !== "undefined") {
          localStorage.clear();
          sessionStorage.clear();
        }

        // Clear all cookies manually
        document.cookie.split(";").forEach((cookie) => {
          const name = cookie.split("=")[0].trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
        });

        removeCookie("token");
        removeCookie("role");
        removeCookie("userId");

        // Redirect to login after a brief delay
        setTimeout(() => window.location.replace("/login"), 1500);
      } catch (error) {
        console.error("Logout error:", error);
        window.location.replace("/login");
      }
    };

    logoutUser();
  }, [removeCookie]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950">
      <div className="flex flex-col items-center gap-5 p-8 bg-white dark:bg-gray-900 max-w-sm text-center transition-all duration-300 ease-in-out">
        <Loader2 className="animate-spin text-primary dark:text-blue-400 w-10 h-10" />

        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Logging you out
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Please wait a moment while we close your session securely.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => window.location.replace("/login")}
          className="mt-2"
        >
          Go to Login
        </Button>
      </div>
    </div>
  );
}
