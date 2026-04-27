"use client";

import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import OrdersSectionTabs from "../../_components/OrdersSectionTabs";
import RazorpayRouteAccountForm from "../shared/RazorpayRouteAccountForm";

export default function RazorpayRouteAccountCreateView() {
  return (
    <div>
      <OrdersSectionTabs />
      <PageInfoBar
        title="Create Linked Account"
        description="Create a Razorpay Route linked account and store it in your database."
      />
      <div className="mt-5 max-w-3xl">
        <RazorpayRouteAccountForm mode="create" />
      </div>
    </div>
  );
}

