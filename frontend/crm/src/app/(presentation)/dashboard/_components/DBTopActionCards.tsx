"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LucideDownload } from "lucide-react";
import { useUserTracking } from "@/analytics/UserTrackingProvider";

const DbTopActionCards = () => {
  const { trackActivity } = useUserTracking();
  return (
    <div className={`flex items-center md:w-auto w-full gap-3`}>
      <Select>
        <SelectTrigger className="bg-white w-full md:w-[150px]">
          <SelectValue placeholder="Last 30 Days" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Last 7 Days</SelectItem>
          <SelectItem value="dark">Last Month</SelectItem>
          <SelectItem value="system">Last 6 Month</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant={`default`}
        onClick={() =>
          trackActivity("click", {
            name: "sourav Bapari",
            type: "export data",
          })
        }
      >
        <LucideDownload /> Export Data
      </Button>
    </div>
  );
};

export default DbTopActionCards;
