import { Input } from "@/components/ui/input";
import { Grid, List, Search } from "lucide-react";
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
function IssuerNotesSearchMode() {
  return (
    <div className="flex justify-between items-center gap-3 mt-5">
      <div className="relative w-full">
        <Input
          className="peer pe-14 border border-gray-200 w-full py-5.5 px-5 placeholder:text-gray-500 "
          placeholder="Search issuer notes"
          type="text"
        />
        <div
          className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-4 text-xs text-muted-foreground tabular-nums peer-disabled:opacity-50"
          aria-live="polite"
          role="status"
        >
          <Search className="text-secondary" />
        </div>
      </div>
      <Tabs defaultValue="account" className="h-12 bg-white lg:flex hidden">
        <TabsList className="h-12 bg-white border border-gray-200">
          <TabsTrigger value="account" className="px-5">
            <List /> LIST
          </TabsTrigger>
          <TabsTrigger value="password" className="px-5">
            <Grid /> GRID
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

export default IssuerNotesSearchMode;
