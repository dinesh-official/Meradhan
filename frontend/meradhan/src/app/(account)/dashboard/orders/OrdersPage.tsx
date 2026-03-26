"use client";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OrdersTable from "./components/OrdersTable";
import OrdersList from "./components/OrdersList";
import CardPagination from "@/global/elements/CardPagination";
import { useQuery } from "@tanstack/react-query";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { FaFilter } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { statusOptions, bondTypeOptions } from "@/constants/order";

function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [bondTypeFilter, setBondTypeFilter] = useState<string>("ALL");
  const limit = 10;

  const orderApi = new apiGateway.meradhan.customerOrderApi(apiClientCaller);

  const { data, isLoading, error } = useQuery({
    queryKey: ["orderHistory", page, statusFilter, bondTypeFilter],
    queryFn: async () => {
      return orderApi.getOrderHistory({
        page: page.toString(),
        limit: limit.toString(),
        status: statusFilter === "ALL" ? undefined : statusFilter,
        bondType: bondTypeFilter === "ALL" ? undefined : bondTypeFilter,
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

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter, bondTypeFilter]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const startItem = meta.total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, meta.total);

  return (
    <div>
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-1 font-medium text-xl">
              My <span className="font-semibold">Orders</span>
            </div>
            <Button
              variant="outline"
              className="text-primary-600 flex items-center gap-2 "
            >
              <FaFilter className="text-primary-600" size={14} />
              <span className="text-sm font-medium">Filters</span>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="shadow-none w-full border border-gray-200 hover:border-gray-200 focus:border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={bondTypeFilter} onValueChange={setBondTypeFilter}>
                <SelectTrigger className="shadow-none w-full border border-gray-200 hover:border-gray-200 focus:border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bondTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex justify-between items-center mb-8">
        <div className="flex gap-1 font-medium text-xl sm:text-2xl">
          My <span className="font-semibold"> Orders</span>
        </div>
        <div className="w-full flex justify-end items-center gap-5">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="shadow-none w-44 border border-gray-200 hover:border-gray-200 focus:border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={bondTypeFilter} onValueChange={setBondTypeFilter}>
            <SelectTrigger className="shadow-none w-44 border border-gray-200 hover:border-gray-200 focus:border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bondTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile View - Cards */}
      <OrdersList orders={orders} isLoading={isLoading} error={error} />

      {/* Desktop View - Table */}
      <OrdersTable orders={orders} isLoading={isLoading} />

      {!isLoading && meta.totalPages > 1 && (
        <div className="mt-5">
          {/* Mobile Layout */}
          <div className="md:hidden flex flex-col gap-3 items-center">
            <CardPagination
              page={page}
              totalPages={meta.totalPages}
              onClick={handlePageChange}
              disabled={isLoading}
            />
            <p className="text-sm text-gray-600 text-center">
              Displaying {startItem} to {endItem} of {meta.total} orders
            </p>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex justify-between items-center">
            <div>
              <CardPagination
                page={page}
                totalPages={meta.totalPages}
                onClick={handlePageChange}
                disabled={isLoading}
              />
            </div>
            <p className="text-sm">
              Displaying {startItem} to {endItem} of {meta.total} orders
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
