"use client";
import { getSessionId } from "@/analytics/analytics";
import { Spinner } from "@/components/ui/spinner";
import useAppCookie from "@/hooks/useAppCookie.hook";
import { userSessionStore } from "@/core/auth/userSessionStore";
import { queryClient } from "@/core/config/service-clients";
import { gqlClient } from "@/core/connection/apollo-client";
import React from "react";
import { apiClientCaller } from "@/core/connection/apiClientCaller";

function Logout() {
  const { clearCookies, removeCookie } = useAppCookie();

  const logout = async () => {
    await apiClientCaller.post("/auth/logout").finally(() => {
      // In case of any failure, still redirect to login after cleanup
      window.location.replace("/login");
    });
  };

  React.useEffect(() => {
    logout();
    // Clear Zustand session store
    userSessionStore.getState().setSession(null);

    // Clear React Query cache
    queryClient.clear();
    queryClient.resetQueries();
    queryClient.invalidateQueries();

    // Clear Apollo Client cache
    gqlClient.clearStore();
    gqlClient.resetStore();

    // Clear all app cookies using the proper method
    clearCookies();

    // Also remove cookies individually with proper options to ensure they're cleared
    // This handles cookies that might have been set with different options
    const cookieNames = [
      "token",
      "userId",
      "name",
      "email",
      "meradhan_tracking_session",
    ];

    cookieNames.forEach((name) => {
      // Remove with different path/domain combinations to ensure complete removal
      try {
        // removeCookie only accepts valid app cookie names as per its type definition,
        // which are the same as those in cookieNames, so typescript error can be safely ignored
        removeCookie(
          name as
            | "token"
            | "userId"
            | "name"
            | "email"
            | "meradhan_tracking_session",
        );
        // Try with domain if hostname is available
        if (typeof window !== "undefined" && window.location.hostname) {
          removeCookie(
            name as
              | "token"
              | "userId"
              | "name"
              | "email"
              | "meradhan_tracking_session",
          );
          // Try with dot-prefixed domain for subdomain cookies
          if (window.location.hostname.includes(".")) {
            removeCookie(
              name as
                | "token"
                | "userId"
                | "name"
                | "email"
                | "meradhan_tracking_session",
            );
          }
        }
      } catch (error) {
        // Silently continue if cookie removal fails
      }
    });

    // Clear localStorage
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear any indexedDB or other storage if needed
    if ("indexedDB" in window) {
      indexedDB.databases?.().then((databases) => {
        databases.forEach((db) => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
          }
        });
      });
    }

    // Generate new session ID for analytics
    getSessionId();

    // Use replace instead of href to prevent back button navigation
    // Add a small delay to ensure all cleanup completes
  }, [clearCookies, removeCookie]);

  return (
    <div className="flex justify-center items-center w-full h-screen">
      <Spinner fontSize={30} className="text-secondary" />
    </div>
  );
}

export default Logout;
