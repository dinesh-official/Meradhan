"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useIdleTimer } from "react-idle-timer";
import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";
import useAppCookie from "@/hooks/useAppCookie.hook";

const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
const PROMPT_BEFORE_IDLE_MS = 1 * 60 * 1000; // show indicator 2 min before logout
const PAGE_TRACKING_SESSION_KEY = "md_page_tracking_session";
const closeSessionEndpoint = (userId: string | number) =>
  `/api/server/auditlogs/crm/close-session/${userId}`;

function formatRemaining(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function IdleLogoutHandler() {
  const router = useRouter();
  const { cookies } = useAppCookie();
  const didLogout = useRef(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);

  const handleIdle = useCallback(async () => {
    if (didLogout.current) return;
    didLogout.current = true;

    // Close session in audit log with "Auto closed - inactivity" before redirecting
    const userId = cookies?.userId;
    if (userId) {
      try {
        await fetch(closeSessionEndpoint(userId), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId:
              typeof localStorage !== "undefined"
                ? localStorage.getItem(PAGE_TRACKING_SESSION_KEY)
                : null,
            reason: "inactivity",
          }),
        });
      } catch {
        // best-effort; proceed to logout
      }
    }

    router.replace("/logout");
  }, [router, cookies?.userId]);

  const idleTimer = useIdleTimer({
    onIdle: handleIdle,
    onPrompt: () => setShowIndicator(true),
    onActive: () => setShowIndicator(false),
    timeout: IDLE_TIMEOUT_MS,
    promptBeforeIdle: PROMPT_BEFORE_IDLE_MS,
    throttle: 1000,
    events: [
      "mousemove",
      "keydown",
      "wheel",
      "mousedown",
      "touchstart",
      "scroll",
      "visibilitychange",
      "click"
    ],
  });

  // Update remaining time every second when indicator is visible
  useEffect(() => {
    if (!showIndicator) return;
    const update = () => setRemainingMs(idleTimer.getRemainingTime());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [showIndicator, idleTimer]);

  const handleStayLoggedIn = useCallback(() => {
    idleTimer.activate();
    setShowIndicator(false);
  }, [idleTimer]);

  return (
    <>
      {showIndicator && (
        <div
          className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg dark:border-amber-800 dark:bg-amber-950/90"
          role="alert"
          aria-live="polite"
        >
          <Timer className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              You’re inactive
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-200">
              Logging out in {formatRemaining(remainingMs)}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 border-amber-300 bg-white hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/50 dark:hover:bg-amber-900"
            onClick={handleStayLoggedIn}
          >
            Stay logged in
          </Button>
        </div>
      )}
    </>
  );
}
