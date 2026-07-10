"use client";

import { format, parse } from "date-fns";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FaCalendarDay } from "react-icons/fa";

type DatePickerProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toYear?: number;
};

export function DatePicker({
  value,
  onChange,
  toYear,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Date | undefined>(
    value ? parse(value, "dd/MM/yyyy", new Date()) : undefined
  );

  React.useEffect(() => {
    if (value) {
      const parsed = parse(value, "dd/MM/yyyy", new Date());
      if (!isNaN(parsed.getTime())) {
        setSelected(parsed);
      }
    }
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    setSelected(date);
    setOpen(false);
    if (onChange && date) {
      const formatted = format(date, "yyyy-MM-dd");
      const syntheticEvent = {
        target: {
          value: formatted,
          name: props.name,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  const handleInputClick = () => {
    setOpen(true);
  };

  return (
    <div className="relative flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Input
              id={props.id ?? "date"}
              placeholder="DD/MM/YYYY"
              readOnly
              value={
                selected
                  ? format(selected, "dd/MM/yyyy")
                  : typeof value === "string"
                    ? value
                    : ""
              }
              onChange={(e) => {
                const inputValue = e.target.value;
                const parsed = parse(inputValue, "dd/MM/yyyy", new Date());
                if (!isNaN(parsed.getTime())) {
                  setSelected(parsed);
                }
                onChange?.(e);
              }}
              onClick={handleInputClick}
              className="[&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:absolute bg-background [&::-webkit-calendar-picker-indicator]:opacity-0 pr-10 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              {...props}
            />

            <Button
              variant="ghost"
              className="top-1/2 right-2 absolute size-6 -translate-y-1/2 cursor-pointer"
              type="button"
            >
              <FaCalendarDay className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="bg-white shadow-sm p-0 border border-gray-100 w-auto overflow-hidden"
          align="end"
        >
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            captionLayout="dropdown"
            className="bg-white"
            toYear={toYear}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
