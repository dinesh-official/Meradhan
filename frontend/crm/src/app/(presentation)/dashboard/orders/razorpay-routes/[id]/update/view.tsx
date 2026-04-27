"use client";

import { useParams } from "next/navigation";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import OrdersSectionTabs from "../../../_components/OrdersSectionTabs";
import RazorpayRouteAccountForm from "../../shared/RazorpayRouteAccountForm";

export default function RazorpayRouteAccountUpdateView() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  return (
    <div>
      <OrdersSectionTabs />
      <PageInfoBar
        title="Update linked account"
        description="Updates the linked account on Razorpay and stores the updated payload in DB."
      />
      <div className="mt-5 max-w-3xl">
        <RazorpayRouteAccountForm mode="update" razorpayAccountId={id} />
      </div>
    </div>
  );
}

