"use client";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import CrmOrdersTable from "./components/CrmOrdersTable";
import CrmOrdersList from "./components/CrmOrdersList";
import CardPagination from "@/global/elements/table/CardPagination";
import { useQuery } from "@tanstack/react-query";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { FaFilter, FaSearch } from "react-icons/fa";
import { statusOptions, bondTypeOptions } from "@/constants/order";
import type { DateRange } from "react-day-picker";

function CrmOrdersView() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [bondTypeFilter, setBondTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const limit = 10;

  const crmOrdersApi = new apiGateway.crm.crmOrdersApi(apiClientCaller);

  const { data, isLoading, error } = useQuery({
    queryKey: ["crmOrders", page, statusFilter, bondTypeFilter, searchQuery, dateRange],
    queryFn: async () => {
      return crmOrdersApi.getAllOrders({
        page: page.toString(),
        limit: limit.toString(),
        status: statusFilter === "ALL" ? undefined : statusFilter,
        bondType: bondTypeFilter === "ALL" ? undefined : bondTypeFilter,
        search: searchQuery || undefined,
        startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
      });
    },
  });

  const orders = data?.responseData?.data || [];
  const meta = data?.responseData?.meta || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, bondTypeFilter, searchQuery, dateRange]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const clearFilters = () => {
    setStatusFilter("ALL");
    setBondTypeFilter("ALL");
    setSearchQuery("");
    setDateRange(undefined);
  };

  const startItem = meta.total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, meta.total);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-1 font-medium text-xl">
          All <span className="font-semibold">Orders</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by customer name, email, bond name, ISIN..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Bond Type Filter */}
            <Select value={bondTypeFilter} onValueChange={setBondTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Bond Types" />
              </SelectTrigger>
              <SelectContent>
                {bondTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    "Pick a date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {/* Clear Filters Button */}
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Orders Display */}
      <CrmOrdersList
        orders={orders}
        isLoading={isLoading}
        error={error}
        onClearFilters={clearFilters}
      />

      {/* Desktop Table */}
      <CrmOrdersTable
        orders={orders}
        onClearFilters={clearFilters}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {!isLoading && meta.totalPages > 1 && (
        <div className="mt-6">
          <div className="flex justify-center">
            <CardPagination
              page={page}
              totalPages={meta.totalPages}
              onClick={handlePageChange}
              disabled={isLoading}
            />
          </div>
          <p className="text-sm text-gray-600 text-center mt-2">
            Displaying {startItem} to {endItem} of {meta.total} orders
          </p>
        </div>
      )}
    </div>
  );
}

export default CrmOrdersView;
