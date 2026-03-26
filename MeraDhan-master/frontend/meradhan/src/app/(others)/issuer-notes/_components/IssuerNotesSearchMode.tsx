"use client";
import { Input } from "@/components/ui/input";
import { Grid, List, Search } from "lucide-react";
import { X } from "lucide-react";
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIssuerViewType } from "../_store/useIssuerViewType";
import { useRouter } from "next/navigation";
function IssuerNotesSearchMode() {
  const { gridMode, setGridMode } = useIssuerViewType();
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const searchParam = params.get("search") || "";
      setSearch(searchParam);
    }
  }, []);
  const router = useRouter();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const params = new URLSearchParams(window.location.search);
      if (search) {
        params.set("search", search);
      } else {
        params.delete("search");
      }
      window.location.href = `${window.location.pathname}?${params.toString()}`;
    }
  };

  return (
    <div className="flex justify-between items-center gap-3 mt-5">
      <div className="relative w-full">
        <Input
          className="peer pe-14 border border-gray-200 w-full py-5.5 px-5 placeholder:text-gray-500 "
          placeholder="Search issuer notes"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div
          className="absolute inset-y-0 end-0 flex items-center justify-center pe-4 text-xs text-muted-foreground tabular-nums"
          aria-live="polite"
          role="status"
        >
          {search ? (
            <button
              type="button"
              aria-label="Clear search"
              className="bg-transparent border-0 p-0 m-0 cursor-pointer"
              onClick={() => setSearch("")}
              tabIndex={0}
            >
              <X className="text-secondary" />
            </button>
          ) : (
            <Search className="text-secondary" />
          )}
        </div>
      </div>
      <Tabs
        defaultValue={gridMode ? "grid" : "list"}
        className="h-12 bg-white lg:flex hidden"
        onValueChange={(e) => {
          setGridMode(e === "grid" ? true : false);
        }}
      >
        <TabsList className="h-12 bg-white border border-gray-200">
          <TabsTrigger value="list" className="px-5">
            <List /> LIST
          </TabsTrigger>
          <TabsTrigger value="grid" className="px-5">
            <Grid /> GRID
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

export default IssuerNotesSearchMode;
