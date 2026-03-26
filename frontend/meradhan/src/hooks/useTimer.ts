import { useEffect, useRef, useState } from "react";

interface UseTimerProps {
  /** Whether to count down (true) or up (false) */
  isCountdown?: boolean;
  /** Duration in seconds (default 30) */
  duration?: number;
  /** Reset trigger – change this value to restart (e.g. increment a number) */
  resetStart?: number;
  /** Optional callback when finished (only used for countdown) */
  onFinish?: () => void;
}

export const useTimer = ({
  isCountdown = true,
  duration = 30,
  resetStart,
  onFinish,
}: UseTimerProps) => {
  const [seconds, setSeconds] = useState<number>(duration);
  const [isActive, setIsActive] = useState<boolean>(false);
  const timeoutRef = useRef<number | null>(null);

  // Format mm:ss
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
    // clear any existing timeout
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsActive(true);
    setSeconds(newDuration);
  };

  // Tick effect: uses setTimeout to avoid interval overlap and to be deterministic.
  useEffect(() => {
    // If not active, do nothing.
    if (!isActive) return;

    // If countdown and already at 0, stop immediately.
    if (isCountdown && seconds <= 0) {
      setIsActive(false);
      // call finish callback once
      onFinish?.();
      return;
    }

    // schedule next tick
    timeoutRef.current = window.setTimeout(() => {
      setSeconds((prev) => {
        if (isCountdown) {
          const next = prev - 1;
          if (next <= 0) {
            // ensure we clamp to 0
            return 0;
          }
          return next;
        } else {
          return prev + 1;
        }
      });
    }, 1000);

    // cleanup for this effect run
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, seconds, isCountdown]);

  // Stop and call onFinish when seconds becomes 0 (extra safety).
  useEffect(() => {
    if (isCountdown && seconds === 0 && isActive) {
      // clear any pending tick
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsActive(false);
      onFinish?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, isCountdown]);

  // Reset when resetStart changes
  useEffect(() => {
    reset(duration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetStart]);

  // clear when unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);


  const checkIsActive = () => {
    if (seconds == 0) {
      return false
    };
    return isActive
  }

  return {
    time: formatTime(seconds),
    seconds,
    isActive: checkIsActive(),
    start,
    pause,
    reset,
  };
};
