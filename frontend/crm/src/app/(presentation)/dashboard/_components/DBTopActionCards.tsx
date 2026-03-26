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

type Props = {
  value: string;
  onChange: (value: string) => void;
  onExport?: () => void;
  loading?: boolean;
};

const DbTopActionCards = ({ value, onChange, onExport, loading }: Props) => {
  const { trackActivity } = useUserTracking();
  return (
    <div className={`flex items-center md:w-auto w-full gap-3`}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-white w-full md:w-[150px]">
          <SelectValue placeholder="Last 30 Days" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">Last 7 Days</SelectItem>
          <SelectItem value="30">Last 30 Days</SelectItem>
          <SelectItem value="90">Last 90 Days</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant={`default`}
        disabled={loading}
        onClick={() => {
          onExport?.();
          trackActivity("click", {
            name: "sourav Bapari",
            type: "export data",
          });
        }}
      >
        <LucideDownload /> {loading ? "Exporting..." : "Export Data"}
      </Button>
    </div>
  );
};

export default DbTopActionCards;
