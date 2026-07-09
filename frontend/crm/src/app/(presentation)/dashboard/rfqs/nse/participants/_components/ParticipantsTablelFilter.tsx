import { CardAction, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CBRICS_APPROVAL_STATUS_OPTIONS } from "@/app/(presentation)/dashboard/rfqs/nse/_constants/cbricsApprovalStatus";
import { Search } from "lucide-react";
import React from "react";

interface ParticipantsTableFilterProps {
  searchValue?: string;
  onSearchChange?: (e: string) => void;
  workflowStatusValue?: string;
  workflowStatusChange?: (value: string) => void;
  actualStatusValue?: string;
  actualStatusChange?: (value: string) => void;
  placeholder?: string;
}

const ParticipantsTableFilter: React.FC<ParticipantsTableFilterProps> = ({
  searchValue,
  onSearchChange,
  workflowStatusValue,
  workflowStatusChange,
  actualStatusValue,
  actualStatusChange,
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
      <CardAction className="flex flex-row flex-wrap gap-3">
        <Select value={workflowStatusValue} onValueChange={workflowStatusChange}>
          <SelectTrigger className="w-[min(100%,240px)] bg-secondary border-none">
            <SelectValue placeholder="Workflow status" />
          </SelectTrigger>
          <SelectContent>
            {CBRICS_APPROVAL_STATUS_OPTIONS.map((option) => (
              <SelectItem key={`wf-${option.value}`} value={option.value}>
                Workflow: {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={actualStatusValue} onValueChange={actualStatusChange}>
          <SelectTrigger className="w-[min(100%,240px)] bg-secondary border-none">
            <SelectValue placeholder="Actual status" />
          </SelectTrigger>
          <SelectContent>
            {CBRICS_APPROVAL_STATUS_OPTIONS.map((option) => (
              <SelectItem key={`as-${option.value}`} value={option.value}>
                Actual: {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardAction>
    </CardHeader>
  );
};

export default ParticipantsTableFilter;
