"use client";

import { useParams } from "next/navigation";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import OrdersSectionTabs from "../../_components/OrdersSectionTabs";

export default function RazorpayRouteAccountUpdateView() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  return (
    <div>
      <OrdersSectionTabs />
      <PageInfoBar
        title="Linked Account"
        description="This page has moved. Please use Details / Update pages."
      />
      <div className="mt-5 max-w-3xl">
        <div className="flex gap-2">
          <a
            className="text-sm underline"
            href={`/dashboard/orders/razorpay-routes/${encodeURIComponent(id ?? "")}/details`}
          >
            Go to details
          </a>
          <a
            className="text-sm underline"
            href={`/dashboard/orders/razorpay-routes/${encodeURIComponent(id ?? "")}/update`}
          >
            Go to update
          </a>
        </div>
      </div>
    </div>
  );
}

