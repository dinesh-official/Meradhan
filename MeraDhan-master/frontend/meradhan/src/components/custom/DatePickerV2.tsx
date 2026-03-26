"use client";

import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

export function DatePickerV2({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (date: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [month, setMonth] = React.useState<Date | undefined>(date);
  const [dateValue, setDateValue] = React.useState(formatDate(date));

  React.useEffect(() => {
    onChange(date ? date.toISOString().split("T")[0] : "");
  }, [date, dateValue, month]);

  return (
    <div className="relative flex gap-2">
      <Input
        id="date"
        value={dateValue}
        placeholder="June 01, 2025"
        className="bg-background pr-10"
        onChange={(e) => {
          const date = new Date(e.target.value);
          setDateValue(e.target.value);
          if (isValidDate(date)) {
            setDate(date);
            setMonth(date);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date-picker"
            variant="ghost"
            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Select date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0 bg-white"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            className="bg-white"
            month={month}
            onMonthChange={setMonth}
            onSelect={(date) => {
              setDate(date);
              setDateValue(formatDate(date));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
