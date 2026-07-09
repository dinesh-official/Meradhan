import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardAction, CardHeader } from "@/components/ui/card";
import { Search } from "lucide-react";
import { statusOptions, bondTypeOptions } from "@/global/constants/order";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface OrderSearchFilterBarProps {
  searchValue?: string;
  onSearchChange?: (e: string) => void;
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  bondTypeValue?: string;
  onBondTypeChange?: (value: string) => void;
  date?: Date | undefined;
  onDateChange?: (date: Date | undefined) => void;
  onClearFilters?: () => void;
  placeholder?: string;
}

const OrderSearchFilterBar: React.FC<OrderSearchFilterBarProps> = ({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  bondTypeValue,
  onBondTypeChange,
  date,
  onDateChange,
  onClearFilters,
  placeholder = "Search orders...",
}) => {
  return (
    <CardHeader>
      <div className="relative">
        <Input
          className="peer bg-secondary ps-9 border-0 w-120"
          placeholder={placeholder}
          type="search"
          value={searchValue}
          onChange={(e) => {
            onSearchChange?.(e.target.value);
          }}
        />
        <div className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 ps-3 text-muted-foreground/80 pointer-events-none start-0">
          <Search size={16} aria-hidden="true" />
        </div>
      </div>
      <CardAction className="flex flex-row gap-3">
        <Select value={statusValue} onValueChange={onStatusChange}>
          <SelectTrigger className="bg-secondary border-none w-[160px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={bondTypeValue} onValueChange={onBondTypeChange}>
          <SelectTrigger className="bg-secondary border-none w-[160px]">
            <SelectValue placeholder="All Bond Types" />
          </SelectTrigger>
          <SelectContent>
            {bondTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal bg-secondary border-none w-[180px]",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "LLL dd, y") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0"
            align="end"
            side="bottom"
            style={{ width: "auto" }}
          >
            <Calendar
              initialFocus
              mode="single"
              defaultMonth={date}
              selected={date}
              onSelect={onDateChange}
            />
          </PopoverContent>
        </Popover>
        {onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            Clear Filters
          </Button>
        )}
      </CardAction>
    </CardHeader>
  );
};

export default OrderSearchFilterBar;
