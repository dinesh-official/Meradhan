"use client";

import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { PiCalendarBlank } from "react-icons/pi";

type DatePickerProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
  popoverClassName?: string;
  headerClassName?: string;
  allowedDates?: Date[];
  inputClassName?: string;
  inputStyles?: React.CSSProperties;
  containerStyles?: React.CSSProperties;
};

type CalendarCell = {
  date: Date;
  inCurrentMonth: boolean;
};

type ViewMode = "day" | "month" | "year";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const formatDate = (date: Date | null) => {
  if (!date) return "";
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const parseDate = (value: string): Date | null => {
  if (!value) return null;

  const [dayStr, monthStr, yearStr] = value.split("/");
  if (
    [dayStr, monthStr, yearStr].some((part) => part === undefined) ||
    dayStr.length !== 2 ||
    monthStr.length !== 2 ||
    yearStr.length !== 4
  ) {
    return null;
  }

  const day = Number(dayStr);
  const month = Number(monthStr);
  const year = Number(yearStr);

  if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    !Number.isInteger(year)
  ) {
    return null;
  }

  const parsed = new Date(year, month - 1, day);
  const isValidDate =
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day;

  return isValidDate ? parsed : null;
};

const isSameDay = (first: Date | null, second: Date | null) => {
  if (!first || !second) return false;
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
};

const normalizeToMidnight = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const buildCalendar = (viewDate: Date): CalendarCell[] => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startWeekday = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: CalendarCell[] = [];

  // Previous month spillover
  for (let i = startWeekday - 1; i >= 0; i -= 1) {
    const date = new Date(year, month - 1, daysInPrevMonth - i);
    cells.push({ date, inCurrentMonth: false });
  }

  // Current month
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    cells.push({ date, inCurrentMonth: true });
  }

  // Next month spillover to complete 6 weeks (6 * 7 = 42)
  let nextMonthDay = 1;
  while (cells.length < 42) {
    const date = new Date(year, month + 1, nextMonthDay);
    cells.push({ date, inCurrentMonth: false });
    nextMonthDay += 1;
  }

  return cells;
};

export default function DatePicker({
  value,
  onChange,
  placeholder = "DD/MM/YYYY",

  label,
  minDate,
  maxDate,
  disabled = false,
  className,
  popoverClassName,
  headerClassName,
  allowedDates,
  inputClassName,
  inputStyles,
  containerStyles
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(formatDate(value));
  const [isDirty, setIsDirty] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(value ?? new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const containerRef = useRef<HTMLDivElement>(null);
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const days = useMemo(() => buildCalendar(viewDate), [viewDate]);
  const minTimestamp = useMemo(
    () => (minDate ? normalizeToMidnight(minDate) : null),
    [minDate]
  );
  const maxTimestamp = useMemo(
    () => (maxDate ? normalizeToMidnight(maxDate) : null),
    [maxDate]
  );
  const allowedDateSet = useMemo(() => {
    if (!allowedDates || allowedDates.length === 0) return null;
    const set = new Set<number>();
    allowedDates.forEach((date) => {
      set.add(normalizeToMidnight(date));
    });
    return set;
  }, [allowedDates]);
  const yearGridStart = useMemo(() => viewDate.getFullYear() - 6, [viewDate]);
  const yearGrid = useMemo(
    () => Array.from({ length: 12 }, (_, idx) => yearGridStart + idx),
    [yearGridStart]
  );

  const displayValue = isDirty ? inputValue : formatDate(value);
  const isAllowed = (timestamp: number) => {
    if (!allowedDateSet) return true;
    return allowedDateSet.has(timestamp);
  };
  const isWithinRange = (timestamp: number) => {
    if (minTimestamp !== null && timestamp < minTimestamp) return false;
    if (maxTimestamp !== null && timestamp > maxTimestamp) return false;
    return true;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const nextValue = event.target.value;
    setInputValue(nextValue);
    setIsDirty(true);

    if (nextValue.trim() === "") {
      onChange(null);
      setIsDirty(false);
      return;
    }

    const parsed = parseDate(nextValue);
    if (parsed) {
      const parsedTs = normalizeToMidnight(parsed);
      if (!isWithinRange(parsedTs) || !isAllowed(parsedTs)) {
        return;
      }
      onChange(parsed);
      setViewDate(parsed);
      setIsDirty(false);
    }
  };

  const handleInputBlur = () => {
    if (disabled) return;
    const parsed = parseDate(inputValue);
    if (
      (!parsed ||
        !isWithinRange(normalizeToMidnight(parsed)) ||
        !isAllowed(normalizeToMidnight(parsed))) &&
      inputValue.trim() !== ""
    ) {
      setInputValue(formatDate(value));
      setIsDirty(false);
      return;
    }
    const next = formatDate(parsed ?? value);
    setInputValue(next);
    setIsDirty(false);
  };

  const selectDate = (date: Date) => {
    if (disabled) return;
    const ts = normalizeToMidnight(date);
    if (!isWithinRange(ts) || !isAllowed(ts)) {
      return;
    }
    onChange(date);
    setInputValue(formatDate(date));
    setViewDate(date);
    setIsDirty(false);
    setIsOpen(false);
  };

  const toggleCalendar = () => {
    if (disabled) return;
    if (!isOpen) {
      setViewDate(value ?? new Date());
      setViewMode("day");
    }
    setIsOpen((current) => !current);
  };

  const changeMonth = (step: number) => {
    setViewDate((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + step, 1);
      return next;
    });
  };

  const changeYear = (step: number) => {
    setViewDate((current) => {
      const next = new Date(current);
      next.setFullYear(current.getFullYear() + step, current.getMonth(), 1);
      return next;
    });
  };

  const changeYearRange = (step: number) => {
    setViewDate((current) => {
      const next = new Date(current);
      next.setFullYear(
        current.getFullYear() + step * 12,
        current.getMonth(),
        1
      );
      return next;
    });
  };

  const handlePrevNavigation = () => {
    if (viewMode === "day") {
      changeMonth(-1);
    } else if (viewMode === "month") {
      changeYear(-1);
    } else {
      changeYearRange(-1);
    }
  };

  const handleNextNavigation = () => {
    if (viewMode === "day") {
      changeMonth(1);
    } else if (viewMode === "month") {
      changeYear(1);
    } else {
      changeYearRange(1);
    }
  };

  return (
    <div
      className={cn(`date-picker${disabled ? " date-picker--disabled" : ""}`, className)}
      ref={containerRef}
    >
      {label ? <label className="date-picker__label">{label}</label> : null}

      <div className="date-picker__control" style={containerStyles}>
        <input
          aria-label={label ?? "Date"}
          className={cn("date-picker__input", inputClassName)}
          inputMode="numeric"
          placeholder={placeholder}
          value={displayValue}
          disabled={disabled}
          onBlur={handleInputBlur}
          onChange={handleInputChange}
          style={inputStyles}
        />
        <button
          type="button"
          className="date-picker__icon-button"
          aria-label="Toggle calendar"
          disabled={disabled}
          onClick={toggleCalendar}
        >
          <PiCalendarBlank aria-hidden />
        </button>
      </div>

      {isOpen ? (
        <div
          className={`date-picker__popover${popoverClassName ? ` ${popoverClassName}` : ""
            }`}
          role="dialog"
        >
          <div
            className={`date-picker__header${headerClassName ? ` ${headerClassName}` : ""
              }`}
          >
            <button
              type="button"
              className="date-picker__nav"
              aria-label="Previous month"
              onClick={handlePrevNavigation}
            >
              ‹
            </button>

            <div className="date-picker__selectors">
              <button
                type="button"
                className="date-picker__select-trigger"
                aria-label="Switch to month selection"
                onClick={() => setViewMode("month")}
              >
                {MONTH_LABELS[viewDate.getMonth()]}
              </button>
              <button
                type="button"
                className="date-picker__select-trigger"
                aria-label="Switch to year selection"
                onClick={() => setViewMode("year")}
              >
                {viewDate.getFullYear()}
              </button>
            </div>

            <button
              type="button"
              className="date-picker__nav"
              aria-label="Next month"
              onClick={handleNextNavigation}
            >
              ›
            </button>
          </div>

          {viewMode === "day" ? (
            <>
              <div className="date-picker__weekdays">
                {WEEKDAY_LABELS.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="date-picker__grid">
                {days.map(({ date, inCurrentMonth }) => {
                  const ts = normalizeToMidnight(date);
                  const classNames = ["date-picker__day"];
                  if (!inCurrentMonth)
                    classNames.push("date-picker__day--muted");
                  if (isSameDay(date, today))
                    classNames.push("date-picker__day--today");
                  if (isSameDay(date, value))
                    classNames.push("date-picker__day--selected");
                  const selectable = isWithinRange(ts) && isAllowed(ts);
                  if (!selectable)
                    classNames.push("date-picker__day--disabled");

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      className={classNames.join(" ")}
                      disabled={!selectable}
                      onClick={() => selectDate(date)}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          {viewMode === "month" ? (
            <div className="date-picker__month-grid">
              {MONTH_LABELS.map((label, idx) => {
                const classNames = ["date-picker__month"];
                if (idx === viewDate.getMonth()) {
                  classNames.push("date-picker__month--selected");
                }
                return (
                  <button
                    key={label}
                    type="button"
                    className={classNames.join(" ")}
                    onClick={() => {
                      setViewDate(
                        new Date(viewDate.getFullYear(), idx, 1, 0, 0, 0, 0)
                      );
                      setViewMode("day");
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          ) : null}

          {viewMode === "year" ? (
            <div className="date-picker__year-grid">
              {yearGrid.map((year) => {
                const classNames = ["date-picker__year"];
                if (year === viewDate.getFullYear()) {
                  classNames.push("date-picker__year--selected");
                }
                return (
                  <button
                    key={year}
                    type="button"
                    className={classNames.join(" ")}
                    onClick={() => {
                      setViewDate(
                        new Date(year, viewDate.getMonth(), 1, 0, 0, 0, 0)
                      );
                      setViewMode("month");
                    }}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
