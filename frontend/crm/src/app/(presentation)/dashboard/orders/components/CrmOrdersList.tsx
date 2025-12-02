"use client";
import type { CrmOrder } from "@root/apiGateway";
import CrmOrderCard from "./CrmOrderCard";
import { Spinner } from "@/components/ui/spinner";
import { OrdersEmptyState } from "@/components/ui/empty";

interface CrmOrdersListProps {
  orders: CrmOrder[];
  isLoading?: boolean;
  error?: Error | null;
  onClearFilters?: () => void;
}

function CrmOrdersList({ orders, isLoading, error, onClearFilters }: CrmOrdersListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-10">
        <p className="text-red-500">Error loading orders. Please try again.</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <OrdersEmptyState
        message="No orders found"
        ctaText="Clear Filters"
        onCtaClick={onClearFilters}
        className="md:hidden"
      />
    );
  }

  return (
    <div className="md:hidden space-y-4">
      {orders.map((order, index) => (
        <CrmOrderCard
          key={order.id}
          order={order}
          showSeparator={index < orders.length - 1}
        />
      ))}
    </div>
  );
}

export default CrmOrdersList;
