"use client";
import { Spinner } from "@/components/ui/spinner";
import useAppCookie from "@/hooks/useAppCookie.hook";
import React from "react";

function Logout() {
  const { removeCookie } = useAppCookie();

  React.useEffect(() => {
    // Clear all cookies
    document.cookie.split(";").forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });

    // Remove specific app cookies
    removeCookie("token");
    removeCookie("userId");

    // Clear local storage
    localStorage.clear();

    // Redirect to homepage
    window.location.href = "/";
  }, [removeCookie]);

  return (
    <div className="flex justify-center items-center w-full h-screen">
      <Spinner fontSize={30} className="text-secondary" />
    </div>
  );
}

export default Logout;
