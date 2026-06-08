"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUserData } from "@/global/stores/useCurrentUserData.store";
import useAppCookie from "@/hooks/useAppCookie.hook";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ImpersonationBanner() {
  const user = useCurrentUserData((s) => s.user);
  const { setCookie } = useAppCookie();
  const [loading, setLoading] = useState(false);

  if (!user?.impersonatedBy) {
    return null;
  }

  const exitImpersonation = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/impersonate/exit", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? "Failed to exit impersonation");
      }
      setCookie("token", data.token, { path: "/" });
      setCookie("userId", String(data.id), { path: "/" });
      setCookie("role", data.role, { path: "/" });
      window.location.replace("/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to exit impersonation",
      );
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 text-sm flex flex-wrap items-center justify-between gap-3">
      <p>
        Viewing as <strong>{user.name}</strong> ({user.email}) ·{" "}
        {user.role.replaceAll("_", " ")}
      </p>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="shrink-0"
        disabled={loading}
        onClick={() => void exitImpersonation()}
      >
        <LogOut className="size-4" />
        Exit impersonation
      </Button>
    </div>
  );
}
