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
import { SelectOption } from "@/global/elements/inputs/SelectField";

interface LeadsSearchFilterBarProps {
  searchValue?: string;
  onSearchChange?: (e: string) => void;
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  sourceValue?: string;
  onSourceChange?: (value: string) => void;
  statusOptions?: SelectOption[];
  sourceOptions?: SelectOption[];
  placeholder?: string;
}

const filterStatus: SelectOption[] = [
  { label: "All Status", value: "ALL" },
  { label: "New", value: "NEW" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Qualified", value: "QUALIFIED" },
  { label: "Unqualified", value: "UNQUALIFIED" },
  { label: "Converted", value: "CONVERTED" },
];

const filterSourceOptions: SelectOption[] = [
  { label: "All Sources", value: "ALL" },
  { label: "Website", value: "WEBSITE" },
  { label: "Referral", value: "REFERRAL" },
  { label: "Social", value: "SOCIAL" },
  { label: "Advertisement", value: "ADVERTISEMENT" },
  { label: "Event", value: "EVENT" },
  { label: "Cold Call", value: "COLD_CALL" },
  { label: "Email", value: "EMAIL" },
  { label: "Other", value: "OTHER" },
];

const LeadsSearchFilterBar: React.FC<LeadsSearchFilterBarProps> = ({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  sourceValue,
  onSourceChange,
  statusOptions = filterStatus,
  sourceOptions = filterSourceOptions,
  placeholder = "Search...",
}) => {
  return (
    <CardHeader>
      <div className="relative">
        <Input
          className="peer ps-9 w-64 bg-secondary border-0"
          placeholder={placeholder}
          type="search"
          value={searchValue}
          onChange={(e) => {
            onSearchChange?.(e.target.value);
          }}
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          <Search size={16} aria-hidden="true" />
        </div>
      </div>
      <CardAction className="flex flex-row gap-3">
        <Select value={statusValue} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[160px] bg-secondary border-none">
            <SelectValue placeholder="Apply Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sourceValue} onValueChange={onSourceChange}>
          <SelectTrigger className="w-[160px] bg-secondary border-none">
            <SelectValue placeholder="Apply Source" />
          </SelectTrigger>
          <SelectContent>
            {sourceOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardAction>
    </CardHeader>
  );
};

export default LeadsSearchFilterBar;
