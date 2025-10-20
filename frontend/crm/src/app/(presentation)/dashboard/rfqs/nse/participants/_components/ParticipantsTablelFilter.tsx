import { CardAction, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectOption } from "@/global/elements/inputs/SelectField";
import { Search } from "lucide-react";
import React from "react";

interface ParticipantsTableFilterProps {
  searchValue?: string;
  onSearchChange?: (e: string) => void;
  statusValue?: string;
  statusChange?: (value: string) => void;
  statusOptions?: typeof filterStatusOptions;
  placeholder?: string;
}

const filterStatusOptions: SelectOption[] = [
  { label: "All Status", value: "ALL" },

  // --- Added workflow statuses ---
  { label: "Pending With Checker", value: "100" },
  { label: "Returned by Checker", value: "16" },
  { label: "Rejected by Checker", value: "15" },
  { label: "Pending With Exchange - code 0", value: "0" },
  { label: "Pending With Exchange - code 10", value: "10" },
  { label: "Approved", value: "1" },
  { label: "Rejected", value: "5" },
  { label: "Returned", value: "6" },
];
const ParticipantsTableFilter: React.FC<ParticipantsTableFilterProps> = ({
  searchValue,
  onSearchChange,
  statusValue,
  statusChange,
  statusOptions = filterStatusOptions,
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
        <Select value={statusValue} onValueChange={statusChange}>
          <SelectTrigger className="w-[250px] bg-secondary border-none">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
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

export default ParticipantsTableFilter;
