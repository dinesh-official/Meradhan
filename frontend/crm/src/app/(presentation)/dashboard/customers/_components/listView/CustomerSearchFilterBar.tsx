"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardAction, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { SelectOption } from "@/global/elements/inputs/SelectField";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";

interface CustomerSearchFilterBarProps {
  searchValue?: string;
  onSearchChange?: (e: string) => void;
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  kycValue?: string;
  onKycChange?: (value: string) => void;
  userTypeValue?: string;
  onUserTypeChange?: (value: string) => void;
  rmAssignmentValue?: string;
  onRmAssignmentChange?: (value: string) => void;
  showRmAssignmentFilter?: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  statusOptions?: typeof filterStatusOptions;
  kycOptions?: typeof filterKycStatus;
  userTypeOptions?: typeof filterUserTypeOptions;
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

const filterUserTypeOptions: SelectOption[] = [
  { label: "All Types", value: "ALL" },
  { label: "Individual", value: "INDIVIDUAL" },
  { label: "NRI / NRO", value: "INDIVIDUAL_NRI_NRO" },
  { label: "Corporate", value: "CORPORATE" },
  { label: "Trust", value: "TRUST" },
  { label: "HUF", value: "HUF" },
  { label: "LLP", value: "LLP" },
  { label: "Partnership Firm", value: "PARTNERSHIP_FIRM" },
];

const CustomerSearchFilterBar: React.FC<CustomerSearchFilterBarProps> = ({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  kycValue,
  onKycChange,
  userTypeValue,
  onUserTypeChange,
  rmAssignmentValue = "ALL",
  onRmAssignmentChange,
  showRmAssignmentFilter = false,
  hasActiveFilters = false,
  onClearFilters,
  statusOptions = filterStatusOptions,
  kycOptions = filterKycStatus,
  userTypeOptions = filterUserTypeOptions,
  placeholder = "Search...",
}) => {
  const userApi = new apiGateway.crm.user.CrmUsersApi(apiClientCaller);

  const relationshipManagersQuery = useQuery({
    queryKey: ["crmRelationshipManagersFilter"],
    queryFn: async () => {
      const response = await userApi.findUsers({
        page: "1",
        role: "RELATIONSHIP_MANAGER",
      });
      return response.data.responseData?.data ?? [];
    },
    enabled: showRmAssignmentFilter,
    staleTime: 5 * 60 * 1000,
  });

  const relationshipManagers = relationshipManagersQuery.data ?? [];

  return (
    <CardHeader>
      <div className="relative">
        <Input
          className="peer w-64 border-0 bg-secondary ps-9"
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
      <CardAction className="flex flex-row flex-wrap gap-3">
        {showRmAssignmentFilter && (
          <Select value={rmAssignmentValue} onValueChange={onRmAssignmentChange}>
            <SelectTrigger className="w-[220px] border-none bg-secondary">
              <SelectValue placeholder="Relationship manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All customers</SelectItem>
              <SelectItem value="MY_RM">My RM customers</SelectItem>
              {relationshipManagers.length > 0 && <SelectSeparator />}
              {relationshipManagers.map((rm) => (
                <SelectItem key={rm.id} value={String(rm.id)}>
                  {rm.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={userTypeValue} onValueChange={onUserTypeChange}>
          <SelectTrigger className="w-[160px] border-none bg-secondary">
            <SelectValue placeholder="Customer Type" />
          </SelectTrigger>
          <SelectContent>
            {userTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusValue} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[160px] border-none bg-secondary">
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
          <SelectTrigger className="w-[160px] border-none bg-secondary">
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
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 text-muted-foreground"
            onClick={onClearFilters}
          >
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        )}
      </CardAction>
    </CardHeader>
  );
};

export default CustomerSearchFilterBar;
