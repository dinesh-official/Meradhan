import { useEffect, useRef, useState } from "react";

interface UseTimerProps {
  /** Whether to count down (true) or up (false). */
  isCountdown?: boolean;
  /** Duration in seconds (default 30). */
  duration?: number;
  /** Reset trigger – change this value to restart (e.g. increment a number). */
  resetStart?: number;
  /** Callback when a countdown reaches zero. */
  onFinish?: () => void;
}

/**
 * Lightweight `mm:ss` timer (countdown / count-up).
 *
 * Mirrors `frontend/meradhan/src/hooks/useTimer.ts` so the CRM-side OTP
 * dialogs can reuse the exact UX (180-second resend window, "Resend OTP
 * (mm:ss)" label, automatic re-enable). Implemented with `setTimeout`
 * to avoid the overlap/skipping artefacts of `setInterval`.
 */
export const useTimer = ({
  isCountdown = true,
  duration = 30,
  resetStart,
  onFinish,
}: UseTimerProps) => {
  const [seconds, setSeconds] = useState<number>(duration);
  const [isActive, setIsActive] = useState<boolean>(false);
  const timeoutRef = useRef<number | null>(null);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const start = () => setIsActive(true);
  const pause = () => setIsActive(false);

  const reset = (newDuration = duration) => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsActive(true);
    setSeconds(newDuration);
  };

  useEffect(() => {
    if (!isActive) return;

    if (isCountdown && seconds <= 0) {
      setIsActive(false);
      onFinish?.();
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      setSeconds((prev) => {
        if (isCountdown) {
          const next = prev - 1;
          if (next <= 0) return 0;
          return next;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, seconds, isCountdown]);

  useEffect(() => {
    if (isCountdown && seconds === 0 && isActive) {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsActive(false);
      onFinish?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, isCountdown]);

  useEffect(() => {
    reset(duration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetStart]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const checkIsActive = () => {
    if (seconds === 0) return false;
    return isActive;
  };

  return {
    time: formatTime(seconds),
    seconds,
    isActive: checkIsActive(),
    start,
    pause,
    reset,
  };
};
