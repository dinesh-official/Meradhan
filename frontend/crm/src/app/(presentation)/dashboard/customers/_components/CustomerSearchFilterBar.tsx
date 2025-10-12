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

export interface Option {
  label: string;
  value: string;
}

interface CustomerSearchFilterBarProps {
  searchValue?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  kycValue?: string;
  onKycChange?: (value: string) => void;
  statusOptions?: Option[];
  kycOptions?: Option[];
}

const CustomerSearchFilterBar: React.FC<CustomerSearchFilterBarProps> = ({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  kycValue,
  onKycChange,
  statusOptions = [
    { label: "All Status", value: "ALL" },
    { label: "Active", value: "ACTIVE" },
    { label: "Suspended", value: "SUSPENDED" },
  ],
  kycOptions = [
    { label: "All Kyc Status", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Verified", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
  ],
}) => {
  return (
    <CardHeader>
      <div className="relative">
        <Input
          className="peer ps-9 w-64 bg-secondary border-0"
          placeholder="Search customers..."
          type="search"
          value={searchValue}
          onChange={onSearchChange}
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
        <Select value={kycValue} onValueChange={onKycChange}>
          <SelectTrigger className="w-[160px] bg-secondary border-none">
            <SelectValue placeholder="Kyc Status" />
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
