"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { useServiceRequestsApiHook } from "../_hooks/useServiceRequestsApiHook";

export default function ServiceRequestsFilterBar({
  filters,
  setFilters,
}: Pick<ReturnType<typeof useServiceRequestsApiHook>, "filters" | "setFilters">) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4">
      <Input
        placeholder="Search name, phone, email…"
        className="max-w-xs"
        value={filters.q}
        onChange={(e) => setFilters({ q: e.target.value, page: 1 })}
      />
      <Select
        value={filters.type}
        onValueChange={(type) => setFilters({ type, page: 1 })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Request type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="CLOSURE">Account Closure</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.status}
        onValueChange={(status) => setFilters({ status, page: 1 })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="DONE">Done</SelectItem>
          <SelectItem value="REJECTED">Rejected</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        onClick={() =>
          setFilters({ q: "", status: "ALL", type: "CLOSURE", page: 1 })
        }
      >
        Reset
      </Button>
    </div>
  );
}
