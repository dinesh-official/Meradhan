"use client";

import { CalendarIcon } from "lucide-react";
import { Button, DatePicker, Group, Popover } from "react-aria-components";

import { Calendar } from "@/components/ui/calendar";
import { DateInput } from "@/components/ui/datefield-rac";
import { PopoverContent } from "../ui/popover";

export default function DatePickerWithEdit() {
  return (
    <DatePicker className="*:not-first:mt-2">
      <div className="flex">
        <Group className="w-full">
          <DateInput className="pe-9" />
        </Group>
        <Button className="z-10 flex justify-center items-center -ms-9 -me-px data-focus-visible:border-ring rounded-e-md outline-none data-focus-visible:ring-[3px] data-focus-visible:ring-ring/50 w-9 text-muted-foreground/80 hover:text-foreground transition-[color,box-shadow]">
          <CalendarIcon size={16} />
        </Button>
      </div>
      <Popover
        className="data-[placement=left]:slide-in-from-right-2 data-[placement=top]:slide-in-from-bottom-2 z-50 bg-background data-[placement=bottom]:slide-in-from-top-2 data-[placement=right]:slide-in-from-left-2 shadow-lg border rounded-lg outline-hidden text-popover-foreground data-entering:animate-in data-exiting:animate-out data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95"
        offset={4}
      >
        <PopoverContent
          className="bg-white shadow-sm p-0 border border-gray-100 w-auto overflow-hidden"
          align="end"
        >
          <Calendar
            mode="single"
            captionLayout="dropdown"
            className="bg-white"
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </DatePicker>
  );
}
