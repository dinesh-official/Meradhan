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

interface UsersSearchFilterBarProps {
  searchValue?: string;
  onSearchChange?: (e: string) => void;
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  roleValue?: string;
  onRoleChange?: (value: string) => void;
  statusOptions?: SelectOption[];
  roles?: SelectOption[];
  placeholder?: string;
}

const filterRoleStatus: SelectOption[] = [
  { label: "All Kyc Status", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Verified", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

const filterStatusOptions: SelectOption[] = [
  { label: "All Status", value: "ALL" },
  { label: "New", value: "New" },
  { label: "Suspended", value: "SUSPENDED" },
];

const UsersSearchFilterBar: React.FC<UsersSearchFilterBarProps> = ({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  roleValue,
  onRoleChange,
  statusOptions = filterStatusOptions,
  roles = filterRoleStatus,
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
          onChange={(e)=>{
            onSearchChange?.(e.target.value)
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
        <Select value={roleValue} onValueChange={onRoleChange}>
          <SelectTrigger className="w-[160px] bg-secondary border-none">
            <SelectValue placeholder="Apply Role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((option) => (
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

export default UsersSearchFilterBar;
