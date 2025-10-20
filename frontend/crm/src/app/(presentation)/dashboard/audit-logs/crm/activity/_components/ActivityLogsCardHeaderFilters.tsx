"use client";

import { ActivityTypes } from "@/analytics/analytics";
import { Button } from "@/components/ui/button";
import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectRoleUser } from "@/global/elements/autocomplete/SelectRoleUser";
import { CrmUsersProfile } from "@root/apiGateway";
import { File, Search } from "lucide-react";
import React from "react";

interface ActivityLogsCardHeaderFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedActivityType?: string;
  onActivityTypeChange: (value: string) => void;
  onExport?: () => void;
  user?: CrmUsersProfile;
  setUser: (e: CrmUsersProfile) => void;
}

function ActivityLogsCardHeaderFilters({
  searchValue,
  onSearchChange,
  selectedActivityType,
  onActivityTypeChange,
  onExport,
  setUser,
  user,
}: ActivityLogsCardHeaderFiltersProps) {
  return (
    <CardHeader>
      <CardTitle>Activity History</CardTitle>
      <CardDescription>
        Complete log of all user actions and system events
      </CardDescription>

      <CardAction>
        <Button
          variant="secondary"
          className="lg:flex justify-center items-center hidden"
          onClick={onExport}
        >
          <File className="mr-2 h-4 w-4" /> Export Logs
        </Button>
      </CardAction>

      <div className="flex gap-5 mt-2 flex-wrap">
        {/* 🔍 Search Input */}
        <div className="relative">
          <Input
            className="peer ps-9 w-80"
            placeholder="Search Activity"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
            <Search size={16} aria-hidden="true" />
          </div>
        </div>
        <div className="w-72">
          <SelectRoleUser
            value={user}
            onSelect={(user) => {
              if (user) setUser(user);
            }}
          />
        </div>
        {/* ⚙️ Activity Type Selector */}
        <Select
          value={selectedActivityType}
          onValueChange={(value) => onActivityTypeChange(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activity</SelectItem>
            {ActivityTypes.map((type) => (
              <SelectItem value={type} key={type}>
                {type.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </CardHeader>
  );
}

export default ActivityLogsCardHeaderFilters;
