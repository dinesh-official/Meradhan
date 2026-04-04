"use client";
import { Button } from "@/components/ui/button";
import { BondDetailsResponse, CustomerByIdPayload } from "@root/apiGateway";
import { IoMdArrowDropright } from "react-icons/io";
import Link from "next/link";
import { useOrderActivityTracking } from "../../_hooks/useOrderActivityTracking";

function Payment({
  orderId,
}: {
  bond: BondDetailsResponse;
  customer: CustomerByIdPayload;
  orderId: string;
  settlementDate: string;
}) {
  const { trackButtonClick } = useOrderActivityTracking();

  return (
    <div className="container max-w-2xl mx-auto">
      <h1 className="title text-center">Order Request Received</h1>

      <div className="mt-8 text-center text-muted-foreground space-y-5 text-base leading-relaxed">
        <p className="text-foreground">
          Thank you for submitting your order request on MeraDhan.
        </p>
        <p>
          Our team will connect with you shortly to guide you through the
          payment process and complete your transaction.
        </p>
        <p>
          Please note that the deal will be processed only after successful
          receipt of funds.
        </p>
        <p>
          Please also note that the final order number will be generated upon
          successful completion of your payment.
        </p>
      </div>

      <div className="flex justify-center items-center gap-4 mt-12 flex-wrap">
        <Link href="/bonds">
          <Button
            className="md:w-auto w-full"
            variant="default"
            onClick={() => {
              trackButtonClick(orderId, "EXPLORE_BONDS", {
                step: 3,
              });
            }}
          >
            Explore Bonds <IoMdArrowDropright />
          </Button>
        </Link>
        <Link href="/dashboard/orders">
          <Button
            className="md:w-auto w-full"
            variant="outline"
            onClick={() => {
              trackButtonClick(orderId, "VIEW_ORDERS", {
                step: 3,
              });
            }}
          >
            View Orders <IoMdArrowDropright />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default Payment;
