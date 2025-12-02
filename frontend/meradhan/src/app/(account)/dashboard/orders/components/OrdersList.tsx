"use client";
import type { Order } from "@root/apiGateway";
import OrderCard from "./OrderCard";
import { Spinner } from "@/components/ui/spinner";
import { OrdersEmptyState } from "@/components/ui/empty";

interface OrdersListProps {
  orders: Order[];
  isLoading?: boolean;
  error?: Error | null;
}

function OrdersList({ orders, isLoading, error }: OrdersListProps) {
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
        message="No Orders found"
        ctaText="Explore All Bonds"
        onCtaClick={() => {
          // Navigate to bonds page or marketplace
          window.location.href = "/bonds";
        }}
        className="md:hidden"
      />
    );
  }

  return (
    <div className="md:hidden">
      {orders.map((order, index) => (
        <OrderCard
          key={order.id}
          order={order}
          showSeparator={index < orders.length - 1}
        />
      ))}
    </div>
  );
}

export default OrdersList;
