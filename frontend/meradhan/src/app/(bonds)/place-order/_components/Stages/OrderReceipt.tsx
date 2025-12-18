"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BondDetailsResponse, CustomerByIdPayload } from "@root/apiGateway";
import Link from "next/link";
import { useState } from "react";
import { IoMdArrowDropright } from "react-icons/io";
import { useRazorpay } from "../../_hooks/useRazorpay";
import { useOrderState } from "../../store/useOrderState";
import BondInfoData from "../BondInfoData";
import { RatingOrDelete } from "../RatingOrDelete";
import dynamic from "next/dynamic";
import { HOST_URL } from "@/global/constants/domains";
import Image from "next/image";
import { useOrderActivityTracking } from "../../_hooks/useOrderActivityTracking";
const RenderPdf = dynamic(() => import("@/components/custom/RenderPdf"), {
  ssr: false,
});
function OrderReceipt({
  bond,
  customer,
  orderId,
}: {
  bond: BondDetailsResponse;
  customer: CustomerByIdPayload;
  orderId: string;
}) {
  const { quantity } = useOrderState();
  const { makePayment, cancelPayment, isLoading } = useRazorpay();
  const [checkTaC, setCheckTaC] = useState(false);
  const [checkOrderCerTaC, setCheckOrderCerTaC] = useState(false);
  const {
    trackCheckboxInteraction,
    trackPaymentAttempt,
    trackButtonClick,
  } = useOrderActivityTracking();

  return (
    <div className="container">
      <h1 className="title">Order Receipt (Draft)</h1>
      <p className="mt-5">
        Order Number: <span className="text-primary">{orderId}</span>
      </p>
      <div className="flex mt-3">
        <div className="flex items-center md:justify-start justify-between w-full gap-4">
          <div className="border-2 items-center flex justify-center bg-white min-h-16 px-4 py-5.5  rounded-md border-gray-200">
            <img
              src="https://media.licdn.com/dms/image/v2/D5616AQHCSw6TFvHuWg/profile-displaybackgroundimage-shrink_200_800/profile-displaybackgroundimage-shrink_200_800/0/1712728211011?e=2147483647&v=beta&t=U-lbDGIHBKOPGjuB5Om5qHUUJc_RqyTypV4PW_dq6dM"
              alt="logo"
              className="w-24 rounded-md "
            />
          </div>
          <div className="md:block hidden">
            <BondInfoData bondData={bond} />
          </div>
          <RatingOrDelete rating={bond.creditRating} />
        </div>
      </div>
      <div className="md:hidden mt-5">
        <BondInfoData bondData={bond} />
      </div>

      <div className="text-sm  mt-6">
        <label className="mt-3 block">
          <Checkbox
            checked={checkTaC}
            onClick={() => {
              const newValue = !checkTaC;
              setCheckTaC(newValue);
              trackCheckboxInteraction(orderId, "TERMS_AND_CONDITIONS", newValue);
            }}
          />{" "}
          &nbsp; I have read, understood, and agree to all the{" "}
          <Link href="/terms-of-use" className="text-primary mx-1   ">
            Terms and Conditions
          </Link>
          .
        </label>
        <label className="mt-3 gap-2 block">
          <Checkbox
            checked={checkOrderCerTaC}
            onClick={() => {
              const newValue = !checkOrderCerTaC;
              setCheckOrderCerTaC(newValue);
              trackCheckboxInteraction(orderId, "ORDER_CONFIRMATION", newValue);
            }}
          />{" "}
          &nbsp; I confirm that I want to place the order as shown in the draft
          order receipt, and I have read the
          <Link href="#" className="text-primary mx-2">
            Exchange Circular
          </Link>
          on settlement failure and deal cancellation.
        </label>
      </div>

      <RenderPdf
        // orderId;
        // qun;
        // isin
        file={
          HOST_URL +
          `/api/server/customer/order/pdf?orderId=${orderId}&isin=${bond.isin}&isReleased=false&qun=${quantity}`
        }
        height={500}
        className="rounded-md overflow-hidden mt-8"
      />
      <div className="flex justify-center items-center gap-4 mt-10">
        <Button
          className="md:w-auto w-full"
          variant="default"
          disabled={!(checkTaC && checkOrderCerTaC)}
          onClick={() => {
            trackButtonClick(orderId, "PROCEED_TO_PAY", {
              step: 2,
              isin: bond.isin,
              quantity,
              bondName: bond.bondName,
            });
            trackPaymentAttempt(orderId, {
              isin: bond.isin,
              quantity,
              bondName: bond.bondName,
            });
            makePayment({
              isin: bond.isin,
              bondData: {
                bondName: bond.bondName,
              },
              quantity: quantity,

              session: {
                firstName: customer.firstName,
                lastName: customer.lastName,
                emailAddress: customer.emailAddress,
                contact: customer.phoneNo,
              },
              orderId: orderId,
            });
          }}
        >
          Proceed to Pay <IoMdArrowDropright />
        </Button>
        <Button
          className="md:w-auto w-full"
          variant="outline"
          onClick={() => {
            trackButtonClick(orderId, "CANCEL_ORDER", {
              step: 2,
            });
            cancelPayment(orderId);
          }}
        >
          Cancel Order <IoMdArrowDropright />
        </Button>
      </div>

      {isLoading && (
        <div className="fixed top-0 right-0 bg-black/20 backdrop-blur-xs z-50 flex justify-center items-center w-full h-full">
          <div className="bg-white rounded-md p-10 shadow-lg w-full max-w-md mx-4">
            <Image
              src={`/images/icons/loader.svg`}
              width={80}
              height={14}
              alt=""
              className="w-20 mx-auto mb-4"
            />
            <h2 className="text-md font-semibold mb-4 text-center">
              Do Not Refresh, Redirecting You to the Payment Gateway...
            </h2>
            <p className="mb-4">
              To complete the online payment successfully through the payment
              gateway, please make sure your daily online banking limit is
              higher than the settlement amount.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderReceipt;
