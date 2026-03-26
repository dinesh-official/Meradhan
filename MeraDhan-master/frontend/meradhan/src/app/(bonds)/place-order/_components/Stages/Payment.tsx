"use client";
import { Button } from "@/components/ui/button";
import { BondDetailsResponse, CustomerByIdPayload } from "@root/apiGateway";
import Image from "next/image";
import { IoMdArrowDropright } from "react-icons/io";
import { useOrderState } from "../../store/useOrderState";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { maskEmail } from "@/global/utils/formate";
import Link from "next/link";
import { useOrderActivityTracking } from "../../_hooks/useOrderActivityTracking";

function Payment({
  bond,
  customer,
  orderId,
}: {
  bond: BondDetailsResponse;
  customer: CustomerByIdPayload;
  orderId: string;
}) {
  const { settlementDate } = useOrderState();
  const { trackButtonClick } = useOrderActivityTracking();
  return (
    <div className="container">
      <h1 className="title text-center">Payment Completed</h1>
      <p className="mt-4 text-center">
        Order Number: <span className="text-primary">{orderId}</span>
      </p>

      <div className="flex justify-center items-center flex-col gap-4 mt-10">
        <Image
          src={`/images/icons/payment.svg`}
          width={100}
          height={100}
          className="w-40 h-auto"
          alt="payment"
        />
        <div className="lg:w-[600px] mx-auto text-center flex flex-col gap-4 mt-5">
          <p>
            Your deal will be settled on{" "}
            {dateTimeUtils.formatDateTime(
              dateTimeUtils.addDays(new Date(), Number(settlementDate)),
              "DD MMMM YYYY"
            )}{" "}
            ({settlementDate == "1" ? "T+1" : "T+0"}) after ICCL receives your
            payment through the payment gateway.
          </p>
          <p>
            We have emailed the order receipt to{" "}
            {maskEmail(customer.emailAddress)}. Please check your inbox or spam
            folder (mark it as safe).
          </p>
        </div>
      </div>

      <div className="flex justify-center items-center gap-4 mt-10">
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
