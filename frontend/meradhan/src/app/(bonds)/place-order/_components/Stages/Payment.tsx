"use client";
import { Button } from "@/components/ui/button";
import apiGateway, { BondDetailsResponse, CustomerByIdPayload } from "@root/apiGateway";
import { IoMdArrowDropright } from "react-icons/io";
import Link from "next/link";
import { useOrderActivityTracking } from "../../_hooks/useOrderActivityTracking";
import { useQuery } from "@tanstack/react-query";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useOrderState } from "../../store/useOrderState";
import Image from "next/image";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { maskEmail } from "@/global/utils/formate";

function Payment({
  orderId,
  customer,
  bond,
  settlementDateValue
}: {
  bond: BondDetailsResponse;
  customer: CustomerByIdPayload;
  orderId: string;
  settlementDateValue: string;
}) {
  const { settlementDate } = useOrderState();
  const orderApi = new apiGateway.meradhan.customerOrderApi(apiClientCaller);
  const { data: pgModeResponse } = useQuery({
    queryKey: ["paymentGatewayMode"],
    queryFn: () => orderApi.getPaymentGatewayMode(),
  });
  const isPaymentMode = pgModeResponse?.responseData.paymentGatewayMode === "PAYMENT";
  const { trackButtonClick } = useOrderActivityTracking();

  if (isPaymentMode) {
    return <div className="container">
      <h1 className="title text-center">Payment Completed</h1>
      {/* <p className="mt-4 text-center">
        Order Number: <span className="text-primary">{orderId}</span>
      </p> */}

      <div className="flex justify-center items-center flex-col gap-4 mt-10">
        <Image
          src={`/images/icons/payment.svg`}
          width={100}
          height={100}
          className="w-40 h-auto"
          alt="payment"
          title="payment"
          aria-label="payment"
        />
        <div className="lg:w-[600px] mx-auto text-center flex flex-col gap-4 mt-5">
          <p>
            Your deal will be settled on{" "}
            {dateTimeUtils.formatDateTime(
              new Date(settlementDateValue),
              "DD MMMM YYYY"
            )}{" "}
            ({settlementDate == "1" ? "T+1" : "T+0"}), subject to receipt of your
            payment by the clearing corporation through the payment gateway.
          </p>
          <p>
            The order receipt has been sent to your registered email address (
            {maskEmail(customer.emailAddress)}). Please check your inbox; if you
            do not find it, kindly check your spam folder and mark it as safe.
          </p>
        </div>
      </div>

      <div className="flex justify-center items-center gap-4 mt-10">
        <Link href="/bonds" title="Explore Bonds" aria-label="Explore Bonds">
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
        <Link href="/dashboard/orders" title="View Orders" aria-label="View Orders">
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
  }

  return (
    <div className="container max-w-2xl mx-auto">
      <h1 className="title text-center">Order Request Received</h1>

      <div className="mt-8 space-y-5 text-center text-base leading-relaxed text-black">
        <p>
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
        <Link href="/bonds" title="Explore Bonds" aria-label="Explore Bonds">
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
        <Link href="/dashboard/orders" title="View Orders" aria-label="View Orders">
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
