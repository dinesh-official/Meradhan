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

interface CustomerSearchFilterBarProps {
  searchValue?: string;
  onSearchChange?: (e: string) => void;
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  kycValue?: string;
  onKycChange?: (value: string) => void;
  statusOptions?: typeof filterStatusOptions;
  kycOptions?: typeof filterKycStatus;
  placeholder?: string;
}
const filterKycStatus: SelectOption[] = [
  { label: "All KYC Status", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Rejected", value: "REJECTED" },
];

const filterStatusOptions: SelectOption[] = [
  { label: "All Status", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
];
const CustomerSearchFilterBar: React.FC<CustomerSearchFilterBarProps> = ({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  kycValue,
  onKycChange,
  statusOptions =filterStatusOptions,
  kycOptions =filterKycStatus,
  placeholder = "Search...",
}) => {
  return (
    <CardHeader>
      <div className="relative">
        <Input
          className="peer bg-secondary ps-9 border-0 w-64"
          placeholder={placeholder}
          type="search"
          value={searchValue}
          onChange={(e)=>{
            onSearchChange?.(e.target.value)
          }}
        />
        <div className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 ps-3 text-muted-foreground/80 pointer-events-none start-0">
          <Search size={16} aria-hidden="true" />
        </div>
      </div>
      <CardAction className="flex flex-row gap-3">
        <Select value={statusValue} onValueChange={onStatusChange}>
          <SelectTrigger className="bg-secondary border-none w-[160px]">
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
        <Select value={kycValue} onValueChange={onKycChange}>
          <SelectTrigger className="bg-secondary border-none w-[160px]">
            <SelectValue placeholder="KYC Status" />
          </SelectTrigger>
          <SelectContent>
            {kycOptions.map((option) => (
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

export default CustomerSearchFilterBar;
