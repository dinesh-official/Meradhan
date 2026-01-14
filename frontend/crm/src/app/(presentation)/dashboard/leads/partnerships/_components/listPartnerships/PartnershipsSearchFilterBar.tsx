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

interface PartnershipsSearchFilterBarProps {
  searchValue?: string;
  onSearchChange?: (e: string) => void;
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  partnershipModelValue?: string;
  onPartnershipModelChange?: (value: string) => void;
  organizationTypeValue?: string;
  onOrganizationTypeChange?: (value: string) => void;
  placeholder?: string;
}

const filterStatus: SelectOption[] = [
  { label: "All Status", value: "ALL" },
  { label: "New", value: "NEW" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Qualified", value: "QUALIFIED" },
  { label: "Unqualified", value: "UNQUALIFIED" },
  { label: "Converted", value: "CONVERTED" },
  { label: "Rejected", value: "REJECTED" },
];

const filterPartnershipModel: SelectOption[] = [
  { label: "All Models", value: "ALL" },
  { label: "Distribution / Referral", value: "distribution" },
  { label: "API / Technology Integration", value: "api" },
  { label: "White-Label Solution", value: "white-label" },
  { label: "Institutional / Strategic", value: "institutional" },
];

const PartnershipsSearchFilterBar: React.FC<PartnershipsSearchFilterBarProps> =
  ({
    searchValue,
    onSearchChange,
    statusValue,
    onStatusChange,
    partnershipModelValue,
    onPartnershipModelChange,
    organizationTypeValue,
    onOrganizationTypeChange,
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
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {filterStatus.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={partnershipModelValue}
            onValueChange={onPartnershipModelChange}
          >
            <SelectTrigger className="w-[180px] bg-secondary border-none">
              <SelectValue placeholder="Partnership Model" />
            </SelectTrigger>
            <SelectContent>
              {filterPartnershipModel.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            className="w-[180px] bg-secondary border-none"
            placeholder="Organization Type"
            value={organizationTypeValue}
            onChange={(e) => {
              onOrganizationTypeChange?.(e.target.value);
            }}
          />
        </CardAction>
      </CardHeader>
    );
  };

export default PartnershipsSearchFilterBar;

