"use client";
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
import { File, Search } from "lucide-react";

function ActivityLogsCardHeaderFilters() {
  return (
    <CardHeader>
      <CardTitle>Activity History</CardTitle>
      <CardDescription>
        Complete log of all user actions and system events
      </CardDescription>
      <CardAction>
        <Button
          variant={`secondary`}
          className="lg:flex justify-center items-center hidden"
        >
          <File /> Export Logs
        </Button>
      </CardAction>
      <div className="flex gap-5 mt-2">
        <div className="relative">
          <Input className="peer ps-9 w-80" placeholder="Search Activity" />
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
            <Search size={16} aria-hidden="true" />
          </div>
        </div>
        <Select>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardHeader>
  );
}

export default ActivityLogsCardHeaderFilters;
