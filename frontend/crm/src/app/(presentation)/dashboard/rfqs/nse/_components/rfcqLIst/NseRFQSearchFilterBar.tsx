import React from "react";
import { CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectOption } from "@/global/elements/inputs/SelectField";

interface NseRFQSearchFilterBarProps {
  searchValue?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

  rfqDateValue?: string;
  onRfqDateChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

  statusValue?: string;
  onStatusChange?: (value: string) => void;

  regTypeValue?: string;
  onRegTypeChange?: (value: string) => void;

  statusOptions?: SelectOption[];
  regTypeOptions?: SelectOption[];
}

const filterKycStatus: SelectOption[] = [
  { label: "Institution - Regulated", value: "I" },
  { label: "Institution – Unregulated", value: "U" },
];

export const filterStatusOptions: SelectOption[] = [
  { label: "All Status", value: "ALL" },
  { label: "Pending", value: "P" },
  { label: "Withdrawn", value: "W" },
  { label: "Fully Traded", value: "T" },
];

const NseRFQSearchFilterBar: React.FC<NseRFQSearchFilterBarProps> = ({
  searchValue,
  onSearchChange,
  rfqDateValue,
  onRfqDateChange,
  statusValue,
  onStatusChange,
  onRegTypeChange,
  regTypeValue,
  statusOptions = filterStatusOptions,
  regTypeOptions = filterKycStatus,
}) => {
  return (
    <CardHeader className="flex justify-between gap-4">
      {/* Search and Date Inputs */}
      <div className="flex flex-wrap items-center gap-5">
        <Input
          className="peer bg-secondary border-0 w-64"
          placeholder="RFQ Number"
          type="search"
          value={searchValue}
          onChange={onSearchChange}
        />

        <Input
          className="peer bg-secondary border-0 w-48"
          placeholder="RFQ Date"
          type="date"
          value={rfqDateValue}
          onChange={onRfqDateChange}
        />
      </div>

      {/* Status and KYC Filters */}
      <CardContent className="flex flex-row flex-wrap gap-3 p-0">
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

        <Select value={regTypeValue} onValueChange={onRegTypeChange}>
          <SelectTrigger className="bg-secondary border-none w-[160px]">
            <SelectValue placeholder="Client RegType" />
          </SelectTrigger>
          <SelectContent>
            {regTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </CardHeader>
  );
};

export default NseRFQSearchFilterBar;
