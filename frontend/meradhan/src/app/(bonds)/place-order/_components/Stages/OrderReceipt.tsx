"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BondDetailsResponse,
  BondOrderPricingData,
  CustomerByIdPayload,
} from "@root/apiGateway";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useToast } from "@/hooks/use-toast";
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
  orderPricing,
}: {
  bond: BondDetailsResponse;
  customer: CustomerByIdPayload;
  orderId: string;
  orderPricing: BondOrderPricingData | null;
}) {
  const { quantity, setStep } = useOrderState();
  const { toast } = useToast();
  const [isPlacing, setIsPlacing] = useState(false);
  const { makePayment, cancelPayment, isLoading, meradhanOrderNumber } = useRazorpay();
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
        Order Number: <span className="text-primary">{`XXXXXXXX`}</span>
      </p>
      <div className="flex mt-3">
        <div className="flex items-center md:justify-start justify-between w-full gap-4">
          {/* <div className="border-2 items-center flex justify-center bg-white min-h-16 px-4 py-5.5  rounded-md border-gray-200">
            <img
              src="https://media.licdn.com/dms/image/v2/D5616AQHCSw6TFvHuWg/profile-displaybackgroundimage-shrink_200_800/profile-displaybackgroundimage-shrink_200_800/0/1712728211011?e=2147483647&v=beta&t=U-lbDGIHBKOPGjuB5Om5qHUUJc_RqyTypV4PW_dq6dM"
              alt="logo"
              className="w-24 rounded-md "
            />
          </div> */}
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
          <Link href="/terms-of-use" target="_blank" className="text-primary mx-1   ">
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
          disabled={
            !(checkTaC && checkOrderCerTaC) ||
            !orderPricing ||
            isPlacing
          }
          onClick={async () => {
            if (!orderPricing) {
              toast({
                title: "Pricing unavailable",
                description:
                  "Order pricing could not be loaded. Please go back and try again.",
                variant: "destructive",
              });
              return;
            }
            const yieldVal = Number(bond.buyYield ?? bond.yield);
            if (!Number.isFinite(yieldVal) || yieldVal < 1) {
              toast({
                title: "Invalid yield",
                description:
                  "Indicative yield must be available to place this order.",
                variant: "destructive",
              });
              return;
            }
            trackButtonClick(orderId, "PLACE_ORDER", {
              step: 2,
              isin: bond.isin,
              quantity,
              bondName: bond.bondName,
            });
            setIsPlacing(true);
            try {
              const bondsApi = new apiGateway.bondsApi.BondsApi(apiClientCaller);
              await bondsApi.placeOrder({
                customerProfileId: customer.id,
                bondName: bond.bondName,
                isin: bond.isin,
                couponRate: orderPricing.couponRate,
                yield: yieldVal,
                faceValue: orderPricing.faceValue,
                quantity,
                settlementAmount: orderPricing.settlementAmount,
                dealDate: orderPricing.dealDate,
                settlementType: orderPricing.settlementOrder,
                requestDate: new Date().toISOString(),
              });
              setStep(3);
            } catch (err: unknown) {
              const message =
                err &&
                  typeof err === "object" &&
                  "response" in err &&
                  (err as { response?: { data?: { message?: string } } })
                    .response?.data?.message
                  ? String(
                    (err as { response: { data: { message?: string } } })
                      .response.data.message
                  )
                  : err instanceof Error
                    ? err.message
                    : "Could not place order. Please try again.";
              toast({
                title: "Could not place order",
                description: message,
                variant: "destructive",
              });
            } finally {
              setIsPlacing(false);
            }
          }}
        >
          {isPlacing ? "Placing…" : "Place Order"}{" "}
          <IoMdArrowDropright />
        </Button>
        {/* <Button
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
        </Button> */}
        <Button
          className="md:w-auto w-full"
          variant="outline"
          onClick={() => {
            trackButtonClick(orderId, "CANCEL_ORDER", {
              step: 2,
            });
            cancelPayment(meradhanOrderNumber ?? orderId);
          }}
        >
          Cancel Order <IoMdArrowDropright />
        </Button>
      </div>

      {isPlacing && (
        <div
          className="fixed inset-0 z-60 flex h-full w-full items-center justify-center bg-black/40 backdrop-blur-sm"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="mx-4 w-full max-w-md rounded-md bg-white p-10 shadow-lg">
            <Image
              src="/images/icons/loader.svg"
              width={80}
              height={14}
              alt=""
              className="mx-auto mb-4 w-20"
            />
            <h2 className="text-md mb-2 text-center font-semibold">
              Submitting your order…
            </h2>
            <p className="text-center text-sm text-muted-foreground">
              Please wait — do not refresh this page.
            </p>
          </div>
        </div>
      )}
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
