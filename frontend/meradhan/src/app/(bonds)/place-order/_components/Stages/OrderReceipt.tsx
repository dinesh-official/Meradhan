"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMaxOrderQuantityFromBond } from "../../_utils/quantity";
import { hasCrmInventoryAvailable } from "@/global/utils/bondPurchaseEligibility";
import { useQuery } from "@tanstack/react-query";
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
  const [isVerifyingStock, setIsVerifyingStock] = useState(false);
  const { makePayment, cancelPayment, isLoading, meradhanOrderNumber } = useRazorpay();
  const [checkTaC, setCheckTaC] = useState(false);
  const [checkOrderCerTaC, setCheckOrderCerTaC] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [termsHighlight, setTermsHighlight] = useState(false);
  const {
    trackCheckboxInteraction,
    trackPaymentAttempt,
    trackButtonClick,
  } = useOrderActivityTracking();

  const orderApi = new apiGateway.meradhan.customerOrderApi(apiClientCaller);
  const { data: pgModeResponse } = useQuery({
    queryKey: ["paymentGatewayMode"],
    queryFn: () => orderApi.getPaymentGatewayMode(),
  });
  const isPaymentMode =
    pgModeResponse?.responseData.paymentGatewayMode === "PAYMENT";

  const outOfStock = !hasCrmInventoryAvailable(bond);

  const validateBeforeSubmit = (): boolean => {
    if (!orderPricing) {
      toast({
        title: "Pricing unavailable",
        description:
          "Order pricing could not be loaded. Please go back and try again.",
        variant: "destructive",
      });
      return false;
    }
    const yieldVal = Number(orderPricing.yield);
    if (!Number.isFinite(yieldVal) || yieldVal < 1) {
      toast({
        title: "Invalid yield",
        description:
          "Indicative yield must be available to place this order.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const verifyFreshInventory = async (): Promise<boolean> => {
    try {
      const bondsApi = new apiGateway.bondsApi.BondsApi(apiClientCaller);
      const envelope = await bondsApi.getBondDetailsByIsin(bond.isin);
      const fresh = envelope.responseData;
      if (!fresh) {
        toast({
          title: "Could not verify stock",
          description: "Please refresh the page and try again.",
          variant: "destructive",
        });
        return false;
      }
      if (!hasCrmInventoryAvailable(fresh)) {
        toast({
          title: "Bond out of stock",
          description: "This bond is no longer available. Please go back to bonds.",
          variant: "destructive",
        });
        return false;
      }
      const max = getMaxOrderQuantityFromBond(fresh);
      if (quantity > max) {
        toast({
          title: "Not enough stock",
          description: `Only ${max} unit(s) available now. Go back to review and lower quantity.`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    } catch {
      toast({
        title: "Could not verify stock",
        description: "Check your connection and try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const allTermsAccepted = checkTaC && checkOrderCerTaC;

  const validateTermsAccepted = (): boolean => {
    if (allTermsAccepted) return true;
    setTermsHighlight(true);
    setTermsDialogOpen(true);
    return false;
  };

  const closeTermsDialog = () => {
    setTermsDialogOpen(false);
    setTermsHighlight(false);
  };

  const handleAcceptAllChange = (checked: boolean) => {
    setCheckTaC(checked);
    setCheckOrderCerTaC(checked);
    trackCheckboxInteraction(orderId, "AGREE_ALL_TERMS", checked);
    trackCheckboxInteraction(orderId, "TERMS_AND_CONDITIONS", checked);
    trackCheckboxInteraction(orderId, "ORDER_CONFIRMATION", checked);
  };

  const handleTermsChange = (checked: boolean) => {
    setCheckTaC(checked);
    trackCheckboxInteraction(orderId, "TERMS_AND_CONDITIONS", checked);
  };

  const handleOrderConfirmationChange = (checked: boolean) => {
    setCheckOrderCerTaC(checked);
    trackCheckboxInteraction(orderId, "ORDER_CONFIRMATION", checked);
  };

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

      <div
        id="order-terms-checkboxes"
        className={cn(
          "mt-6 space-y-4 rounded-lg text-sm transition-shadow",
          termsHighlight &&
            "bg-amber-50/40 p-4 ring-2 ring-amber-400 ring-offset-2",
        )}
      >
        <label className="flex cursor-pointer items-start gap-3 font-medium text-slate-900">
          <Checkbox
            checked={allTermsAccepted}
            onCheckedChange={(checked) =>
              handleAcceptAllChange(checked === true)
            }
            className="mt-0.5"
          />
          <span>Accept all Terms and Conditions</span>
        </label>

        <label className="flex cursor-pointer items-start gap-3">
          <Checkbox
            checked={checkTaC}
            onCheckedChange={(checked) =>
              handleTermsChange(checked === true)
            }
            className="mt-1"
          />
          <p>
            I have read, understood, and agree to all the{" "}
            <Link
              href="/terms-of-use"
              target="_blank"
              className="text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              Terms and Conditions
            </Link>
            .
          </p>
        </label>

        <label className="flex cursor-pointer items-start gap-3">
          <Checkbox
            checked={checkOrderCerTaC}
            onCheckedChange={(checked) =>
              handleOrderConfirmationChange(checked === true)
            }
            className="mt-1"
          />
          <p>
            I confirm that I want to place the order as shown in the draft
            order receipt, and I have read the{" "}
            <Link
              href="#"
              className="text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              Exchange Circular
            </Link>{" "}
            on settlement failure and deal cancellation.
          </p>
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
      {outOfStock && (
        <div
          className="mt-8 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-center text-sm text-destructive"
          role="alert"
        >
          <p className="font-semibold">Bond out of stock</p>
          <p className="mt-1 text-destructive/90">
            This bond is no longer available to purchase. Go back to bonds or refresh after
            inventory is updated.
          </p>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
        {!outOfStock && !isPaymentMode && (
          <Button
            className="md:w-auto w-full"
            variant="default"
            disabled={
              !orderPricing ||
              isPlacing ||
              isVerifyingStock
            }
            onClick={async () => {
              if (!validateBeforeSubmit()) return;
              if (!validateTermsAccepted()) return;
              setIsVerifyingStock(true);
              try {
                const okStock = await verifyFreshInventory();
                if (!okStock) return;
                const yieldVal = Number(orderPricing!.yield);
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
                    couponRate: orderPricing!.couponRate,
                    yield: yieldVal,
                    faceValue: orderPricing!.faceValue,
                    quantity,
                    settlementAmount: orderPricing!.settlementAmount,
                    dealDate: orderPricing!.dealDate,
                    settlementType: orderPricing!.settlementOrder,
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
              } finally {
                setIsVerifyingStock(false);
              }
            }}
          >
            {isVerifyingStock ? "Checking stock…" : isPlacing ? "Placing…" : "Place Order"}{" "}
            <IoMdArrowDropright />
          </Button>
        )}
        {!outOfStock && isPaymentMode && (
          <Button
            className="md:w-auto w-full"
            variant="default"
            disabled={
              !orderPricing ||
              isLoading ||
              isVerifyingStock
            }
            onClick={async () => {
              if (!validateBeforeSubmit()) return;
              if (!validateTermsAccepted()) return;
              setIsVerifyingStock(true);
              try {
                const okStock = await verifyFreshInventory();
                if (!okStock) return;
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
              } finally {
                setIsVerifyingStock(false);
              }
            }}
          >
            {isVerifyingStock ? "Checking stock…" : "Proceed to Pay"}{" "}
            <IoMdArrowDropright />
          </Button>
        )}
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

      <Dialog
        open={termsDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeTermsDialog();
          else setTermsDialogOpen(true);
        }}
      >
        <DialogContent className="max-w-md text-center sm:max-w-md">
          <div className="flex flex-col items-center gap-4 pt-2">
            <div
              className="flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-700"
              aria-hidden
            >
              <AlertCircle className="size-7" />
            </div>

            <DialogHeader className="items-center space-y-2 text-center">
              <DialogTitle className="text-center">
                Terms &amp; Conditions required
              </DialogTitle>
              <DialogDescription className="text-center text-slate-600">
                Accept T&amp;C to proceed further for Payment.
              </DialogDescription>
            </DialogHeader>

            <Button
              type="button"
              className="w-full bg-secondary hover:bg-secondary/90 sm:w-auto sm:min-w-[140px]"
              onClick={() => {
                closeTermsDialog();
                document
                  .getElementById("order-terms-checkboxes")
                  ?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OrderReceipt;
