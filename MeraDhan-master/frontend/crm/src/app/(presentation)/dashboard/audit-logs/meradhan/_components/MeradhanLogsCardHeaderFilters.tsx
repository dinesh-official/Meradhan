"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectCustomerUser } from "@/global/elements/autocomplete/SelectCustomerUser";
import { useDebounce } from "@/global/hooks/use-debounce";
import { CustomerProfile } from "@root/apiGateway";
import { Filter, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export interface GroupQuery {
  page?: number;
  limit?: number;
  userId?: string;
  search?: string;
}

interface MeradhanLogsCardHeaderFiltersProps {
  filters: GroupQuery;
  onFilterChange: (filters: Partial<GroupQuery>) => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

function MeradhanLogsCardHeaderFilters({
  filters,
  onFilterChange,
  isLoading = false,
  description,
  title,
}: MeradhanLogsCardHeaderFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [selectedUser, setSelectedUser] = useState<CustomerProfile | null>(
    null
  );

  const debouncedSearch = useDebounce(searchInput, 500);

  // Update search filter when debounced value changes
  useEffect(() => {
    onFilterChange({ search: debouncedSearch || undefined });
  }, [debouncedSearch, onFilterChange]);

  // Sync selectedUser with filters.userId on mount or when filters change externally
  useEffect(() => {
    if (!filters.userId && selectedUser) {
      setSelectedUser(null);
    }
  }, [filters.userId, selectedUser]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.userId) count++;
    return count;
  }, [filters]);

  const handleUserSelect = (user: CustomerProfile | null) => {
    setSelectedUser(user);
    onFilterChange({ userId: user?.id?.toString() || undefined });
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setSelectedUser(null);
    onFilterChange({
      search: undefined,
      userId: undefined,
      page: 1,
    });
  };

  const clearSearchFilter = () => {
    setSearchInput("");
    onFilterChange({ search: undefined });
  };

  const clearUserFilter = () => {
    setSelectedUser(null);
    onFilterChange({ userId: undefined });
  };

  return (
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="flex items-center gap-2">
            {title || "Meradhan Audit Logs"}
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Filter className="mr-1 w-3 h-3" />
                {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""}
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="mt-1">
            {description ||
              "Complete log of all user actions and system events on Meradhan platform"}
          </CardDescription>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3 mt-4">
        <div className="relative">
          <Input
            className="peer ps-9 w-80"
            placeholder="Search by user, activity, or session details..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 ps-3 text-muted-foreground/80 pointer-events-none start-0">
            <Search size={16} aria-hidden="true" />
          </div>
          {searchInput && !isLoading && (
            <Button
              variant="ghost"
              size="sm"
              className="top-1/2 right-2 absolute hover:bg-gray-100 p-0 w-6 h-6 -translate-y-1/2 transform"
              onClick={clearSearchFilter}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        <div className="w-72">
          <SelectCustomerUser
            onSelect={handleUserSelect}
            value={selectedUser || undefined}
            placeholder="Filter by user..."
          />
        </div>

        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            disabled={isLoading}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="mr-1 w-4 h-4" />
            Clear all filters
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-gray-200 p-0 w-4 h-4"
                onClick={clearSearchFilter}
                disabled={isLoading}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.userId && selectedUser && (
            <Badge variant="secondary" className="gap-1">
              User:{" "}
              {selectedUser.firstName + " " + selectedUser.lastName ||
                selectedUser.emailAddress}
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-gray-200 p-0 w-4 h-4"
                onClick={clearUserFilter}
                disabled={isLoading}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </CardHeader>
  );
}

export default MeradhanLogsCardHeaderFilters;
