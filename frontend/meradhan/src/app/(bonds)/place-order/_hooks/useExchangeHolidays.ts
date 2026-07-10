import { useEffect, useMemo, useState } from "react";
import { type ExchangeHolidaySet } from "@/global/utils/datetime.utils";

type ApiResponse = { holidays?: unknown };

function toHolidaySet(holidays: unknown): ExchangeHolidaySet {
  if (!Array.isArray(holidays)) return new Set();
  const list = holidays
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter((v) => /^\d{4}-\d{2}-\d{2}$/.test(v));
  return new Set(list);
}

export function useExchangeHolidays(): {
  holidays: ExchangeHolidaySet;
  isLoading: boolean;
} {
  const [holidaySet, setHolidaySet] = useState<ExchangeHolidaySet>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/exchange-holidays", { cache: "no-store" });
        const json: ApiResponse = await res.json();
        if (!cancelled) setHolidaySet(toHolidaySet(json?.holidays));
      } catch {
        if (!cancelled) setHolidaySet(new Set());
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const holidays = useMemo(() => holidaySet, [holidaySet]);
  return { holidays, isLoading };
}

