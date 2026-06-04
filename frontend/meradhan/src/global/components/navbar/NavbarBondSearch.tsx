"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { MIN_QUERY_LENGTH, useNavbarBondSearch } from "./useNavbarBondSearch";

export function NavbarBondSearch() {
  const {
    inputValue,
    setInputValue,
    open,
    setOpen,
    isLoading,
    suggestions,
    handleSelect,
    handleEnter,
    handleClose,
    containerRef,
    debouncedQuery,
  } = useNavbarBondSearch();

  return (
    <div ref={containerRef} className="hidden lg:block relative w-full max-w-sm">
      {/* Search input */}
      <div className="relative flex items-center">
        <Search className="left-3 absolute w-4 h-4 text-muted-foreground pointer-events-none shrink-0" />
        <Input
          placeholder="Search by ISIN or Issuer Name"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => {
            if (inputValue.trim().length >= 4) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleEnter();
            if (e.key === "Escape") handleClose();
          }}
          className="pl-9 pr-4 h-9 bg-gray-50 border-gray-200 focus:bg-white text-sm"
        />
      </div>

      {/* Suggestions dropdown */}
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-lg border bg-white shadow-lg overflow-hidden">
          <Command shouldFilter={false}>
            <CommandList className="bg-white">
              {isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Searching…
                </div>
              )}

              {!isLoading &&
                debouncedQuery.length >= MIN_QUERY_LENGTH &&
                suggestions.length === 0 && (
                  <CommandEmpty>No bonds found.</CommandEmpty>
                )}

              {!isLoading && suggestions.length > 0 && (
                <CommandGroup>
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={
                        suggestion.type === "isin"
                          ? suggestion.isin
                          : suggestion.bondName
                      }
                      onSelect={() => handleSelect(suggestion)}
                      className="cursor-pointer py-2.5 text-gray-800 data-[selected=true]:bg-gray-100 data-[selected=true]:text-gray-900"
                    >
                      {suggestion.type === "isin" ? (
                        <span className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-primary text-xs">
                            {suggestion.isin}
                          </span>
                          <span className="text-muted-foreground">:</span>
                          <span className="truncate text-sm">
                            {suggestion.bondName}
                          </span>
                        </span>
                      ) : (
                        <span className="text-sm truncate">
                          {suggestion.bondName}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}

export default NavbarBondSearch;
