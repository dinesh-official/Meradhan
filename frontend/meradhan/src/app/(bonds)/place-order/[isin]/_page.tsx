"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import React, { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userSessionStore } from "@/core/auth/userSessionStore";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { BondInfoLabel } from "@/global/components/Bond/BondInfoLabel";
import { makeFullname } from "@/global/utils/formate";
import { useToast } from "@/hooks/use-toast";
import apiGateway, { BondDetailResponse } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { IoMdArrowDropright } from "react-icons/io";
import { PiCurrencyInrBold } from "react-icons/pi";
import { z } from "zod";
import BondInfoData from "../_components/BondInfoData";
import ViewPort from "@/global/components/wrapper/ViewPort";
import { RatingOrDelete } from "../_components/RatingOrDelete";

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayPaymentResponse) => void;
  modal: {
    ondismiss: () => void;
  };
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

type BondData = BondDetailResponse["responseData"] | { error: true };

function isBondDataValid(
  bondData: BondData | null
): bondData is BondDetailResponse["responseData"] {
  return bondData !== null && !("error" in bondData);
}

function PlaceOrderPage() {
  const params = useParams();
  const { session } = userSessionStore();
  const isin = params.isin as string;
  const isMountedRef = useRef(true);

  const [bondData, setBondData] = useState<BondData | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [orderPreview, setOrderPreview] = useState<z.infer<
    typeof appSchema.order.OrderPreviewResponseSchema
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { toast } = useToast();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

  // Fetch bond details on component mount
  useEffect(() => {
    const fetchBondData = async () => {
      console.log("🔍 Fetching bond data for ISIN:", isin);
      try {
        const apiCaller = new apiGateway.bondsApi.BondsApi(apiClientCaller);
        console.log("📡 Making API call...");
        const response = await apiCaller.getBondDetailsByIsin(isin);
        console.log("✅ API response:", response);

        if (isMountedRef.current) {
          setBondData(response.responseData);
          console.log("✅ Bond data set:", response.responseData);
        }
      } catch (error: unknown) {
        console.error("❌ API call failed:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        if (isMountedRef.current) {
          toast({
            title: "Error",
            description: `Failed to load bond details: ${errorMessage}`,
            variant: "destructive",
          });
          // Set a flag to indicate error instead of empty object
          setBondData(null);
        }
      }
    };

    if (isin && bondData === null) {
      fetchBondData();
    } else if (!isin) {
      console.log("❌ No ISIN provided");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isin]); // Only depend on isin, not bondData to avoid infinite loops

  // Fetch order preview when quantity changes or bond data is loaded
  useEffect(() => {
    const fetchOrderPreview = async () => {
      if (
        !isin ||
        quantity < 1 ||
        !isBondDataValid(bondData) ||
        !isMountedRef.current
      )
        return;

      console.log("🔍 Fetching order preview for:", { isin, quantity });
      setIsPreviewLoading(true);
      try {
        // Call the order preview API
        const response = await apiClientCaller.post("/customer/order/preview", {
          isin,
          quantity,
        });
        console.log("✅ Order preview response:", response.data);

        if (isMountedRef.current) {
          const responseData = response.data as {
            responseData: typeof orderPreview;
          };
          setOrderPreview(responseData.responseData);
        }
      } catch (error) {
        console.error("❌ Failed to fetch order preview:", error);

        if (isMountedRef.current) {
          toast({
            title: "Preview Error",
            description: "Failed to calculate order preview",
            variant: "destructive",
          });
        }
      } finally {
        if (isMountedRef.current) {
          setIsPreviewLoading(false);
        }
      }
    };

    // Only fetch if bond data is loaded and valid
    if (isBondDataValid(bondData)) {
      fetchOrderPreview();
    }
  }, [quantity, isin, bondData]); // Include bondData to trigger when bond loads

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handlePayment = async () => {
    if (!isMountedRef.current) return;

    if (!acceptedTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    if (!isBondDataValid(bondData)) {
      toast({
        title: "Bond Data Missing",
        description: "Bond information is not loaded properly",
        variant: "destructive",
      });
      return;
    }

    if (!orderPreview) {
      toast({
        title: "Order Preview Missing",
        description: "Please wait for order preview to load",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create order and get Razorpay payment details
      const orderResponse = await apiClientCaller.post("/customer/order/pay", {
        isin,
        quantity,
      });

      const responseData = orderResponse.data as {
        responseData: {
          orderId: number;
          paymentOrderId: string;
          amount: number;
          currency: string;
          key: string;
        };
      };
      const { paymentOrderId, amount, currency, key } =
        responseData.responseData;

      // Initialize Razorpay
      const options = {
        key: key,
        amount: Math.round(amount * 100), // Razorpay expects amount in paisa, ensure it's an integer
        currency: currency,
        order_id: paymentOrderId,
        name: "MeraDhan",
        description: `Purchase ${quantity} ${
          isBondDataValid(bondData) ? bondData.bondName : "Bonds"
        }`,
        handler: async (response: RazorpayPaymentResponse) => {
          // Payment successful - webhook will handle the rest
          console.log("Payment response:", response);
          toast({
            title: "Payment Successful",
            description:
              "Your order has been placed successfully! Processing...",
          });

          // Redirect to order history - webhook will update status
          setTimeout(() => {
            window.location.href = "/dashboard/orders";
          }, 2000);
        },
        modal: {
          ondismiss: () => {
            if (isMountedRef.current) {
              setIsLoading(false);
              toast({
                title: "Payment Cancelled",
                description: "You cancelled the payment process",
                variant: "destructive",
              });
            }
          },
        },
        prefill: {
          name: session
            ? makeFullname({
                firstName: session.firstName,
                middleName: session.middleName,
                lastName: session.lastName,
              })
            : "Customer",
          email: session?.emailAddress || "",
          contact: "", // Phone number not available in session
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: unknown) {
      if (isMountedRef.current) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        toast({
          title: "Order Creation Failed",
          description: `Please try again or contact support: ${errorMessage}`,
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }
  };

  // Show loading while fetching data
  if (bondData === null) {
    return (
      <ViewPort>
        <div className="container py-8">
          <div className="flex justify-center items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-gray-600">Loading bond details...</p>
            <p className="text-sm text-gray-500">ISIN: {isin}</p>
          </div>
        </div>
      </ViewPort>
    );
  }

  // Show error if API failed
  if (bondData && "error" in bondData) {
    return (
      <ViewPort>
        <div className="container py-8">
          <div className="flex justify-center items-center space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                Bond Not Found
              </h2>
              <p className="text-gray-600 mb-4">
                Unable to load details for bond with ISIN: {isin}
              </p>
              <Button onClick={() => (window.location.href = "/bonds")}>
                Back to Bonds
              </Button>
            </div>
          </div>
        </div>
      </ViewPort>
    );
  }

  // Check if bond data is valid
  if (!isBondDataValid(bondData)) {
    return (
      <ViewPort>
        <div className="container py-8">
          <div className="flex justify-center items-center space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-orange-600 mb-2">
                Invalid Bond Data
              </h2>
              <p className="text-gray-600 mb-4">
                Bond data is incomplete. ISIN: {isin}
              </p>
              <Button onClick={() => (window.location.href = "/bonds")}>
                Back to Bonds
              </Button>
            </div>
          </div>
        </div>
      </ViewPort>
    );
  }

  // At this point, TypeScript knows bondData is valid
  const validBondData = bondData;

  return (
    <ViewPort>
      <div className="mb-4 container">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/bonds">Bonds</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Place Order</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <SectionWrapper>
        <div className="container">
          <h1 className="title">Review & Confirm Order</h1>

          {/* Bond Info Header */}
          <div className="flex mt-5">
            <div className="flex items-center md:justify-start justify-between w-full gap-4">
              <div className="border-2 items-center flex justify-center bg-white min-h-16 px-4 py-5.5 rounded-md border-gray-200">
                <img
                  src="https://media.licdn.com/dms/image/v2/D5616AQHCSw6TFvHuWg/profile-displaybackgroundimage-shrink_200_800/profile-displaybackgroundimage-shrink_200_800/0/1712728211011?e=2147483647&v=beta&t=U-lbDGIHBKOPGjuB5Om5qHUUJc_RqyTypV4PW_dq6dM"
                  alt="logo"
                  className="w-24 rounded-md"
                />
              </div>
              <div className="md:block hidden">
                <BondInfoData bondData={validBondData} />
              </div>
              <RatingOrDelete rating={validBondData.creditRating} />
            </div>
          </div>
          <div className="block md:hidden mt-5">
            <BondInfoData bondData={validBondData} />
          </div>
          {/* Bond Details */}
          <div className="mt-5 border-t md:border md:p-8 pt-5 border-gray-200 md:rounded-[10px]">
            <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 md:gap-y-10 gap-y-5 gap-x-6">
              <BondInfoLabel title="Coupon Rate">
                <p className="text-black">{validBondData.couponRate}%</p>
              </BondInfoLabel>

              <BondInfoLabel title="Face Value">
                <p className="text-black flex items-center gap-1">
                  <PiCurrencyInrBold />{" "}
                  {validBondData.faceValue?.toLocaleString()}
                </p>
              </BondInfoLabel>

              <BondInfoLabel title="Maturity Date">
                <p className="text-black">
                  {new Date(validBondData.maturityDate).toLocaleDateString()}
                </p>
              </BondInfoLabel>

              <BondInfoLabel title="Credit Rating">
                <p className="text-black">{validBondData.creditRating}</p>
              </BondInfoLabel>

              <BondInfoLabel title="Issue Price">
                <p className="text-black flex items-center gap-1">
                  <PiCurrencyInrBold />{" "}
                  {validBondData.issuePrice?.toLocaleString()}
                </p>
              </BondInfoLabel>

              <BondInfoLabel title="Interest Payment">
                <p className="text-black">
                  {validBondData.interestPaymentFrequency}
                </p>
              </BondInfoLabel>

              <BondInfoLabel title="Settlement Date">
                <Select defaultValue="t+1">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="t+1">T+1 (Next Business Day)</SelectItem>
                    <SelectItem value="t+0">T+0 (Same Day)</SelectItem>
                  </SelectContent>
                </Select>
              </BondInfoLabel>

              <BondInfoLabel title="Quantity of Bonds">
                <div className="flex items-center w-full border border-[#E1E6E8] rounded-md">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-r-none border-0 bg-gray-300 text-black font-bold"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <input
                    type="number"
                    className="w-full text-center border-0 focus:outline-none"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-l-none border-0 bg-gray-300 text-black font-bold"
                    onClick={() => handleQuantityChange(1)}
                  >
                    +
                  </Button>
                </div>
              </BondInfoLabel>
            </div>

            {/* Order Summary */}
            {isPreviewLoading ? (
              <div className="flex justify-center mt-6">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : orderPreview ? (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{orderPreview.subTotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stamp Duty:</span>
                    <span>₹{orderPreview.stampDuty?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total Amount:</span>
                    <span>₹{orderPreview.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Terms and Conditions */}
            <label className="flex justify-start mt-5 gap-3">
              <Checkbox
                checked={acceptedTerms}
                onCheckedChange={(checked) =>
                  setAcceptedTerms(checked === true)
                }
                className="mt-[2px]"
              />
              <p className="text-sm">
                I hereby give MeraDhan permission to act as my broker and to
                send or respond to fixed (non-negotiable) quotes for this
                security on the RFQ platform (One to One Mode) of any stock
                exchange, and to take any steps needed to complete the
                transaction.
              </p>
            </label>

            {/* Payment Button */}
            <div className="mt-8">
              <Button
                className="md:w-auto w-full"
                onClick={handlePayment}
                disabled={
                  isLoading ||
                  !acceptedTerms ||
                  isPreviewLoading ||
                  !orderPreview
                }
                title={
                  !acceptedTerms
                    ? "Please accept the terms and conditions"
                    : isPreviewLoading
                    ? "Loading order preview..."
                    : !orderPreview
                    ? "Waiting for order preview"
                    : isLoading
                    ? "Processing payment..."
                    : ""
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay with Razorpay <IoMdArrowDropright />
                  </>
                )}
              </Button>
              {(!acceptedTerms || isPreviewLoading || !orderPreview) &&
                !isLoading && (
                  <p className="text-sm text-gray-500 mt-2">
                    {!acceptedTerms
                      ? "Please accept the terms and conditions to proceed"
                      : isPreviewLoading
                      ? "Calculating order preview..."
                      : !orderPreview
                      ? "Please wait for order preview to load"
                      : ""}
                  </p>
                )}
            </div>
          </div>

          {/* Footer Note */}
          <div className="flex gap-2 flex-col">
            <p className="font-semibold mt-10">Note:</p>
            <p>
              The securities listed above are not an advertisement,
              recommendation, or invitation to buy or sell. Orders can be placed
              on the Stock Exchange RFQ platform only during market hours. The
              transaction will go through only if the counterparty accepts the
              deal and both the buyer and seller complete their payment
              obligations on time.
            </p>
          </div>
        </div>
      </SectionWrapper>
    </ViewPort>
  );
}

export default PlaceOrderPage;
