/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useToast } from "@/hooks/use-toast";
import { useOrderState } from "../store/useOrderState";
import { useOrderActivityTracking } from "./useOrderActivityTracking";

/* -----------------------------------------------------
   Razorpay Type Definitions (kept inside single file)
----------------------------------------------------- */

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
  modal?: {
    ondismiss?: () => void;
  };
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  method?: {
    upi?: boolean;
    netbanking?: boolean;
    card?: boolean;
    wallet?: boolean;
    emi?: boolean;
    paylater?: boolean;
  };
}

/* -----------------------------------------------------
        Strongly Typed API Response & Input Params
----------------------------------------------------- */

interface PayApiResponse {
  responseData: {
    orderId: number;
    paymentOrderId: string;
    amount: number;
    currency: string;
    key: string;
  };
}

interface PaymentParams {
  isin: string;
  quantity: number;
  bondData: {
    bondName: string;
  };
  session?: {
    firstName?: string;
    lastName?: string;
    emailAddress?: string;
    contact?: string;
  } | null;
  orderId?: string;
}

/* -----------------------------------------------------
                 useRazorpay Hook
----------------------------------------------------- */

export function useRazorpay() {
  const { setStep } = useOrderState();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [orderReqData, setOrderReqData] = useState<PayApiResponse | undefined>(
    undefined
  );
  const { trackPaymentSuccess, trackPaymentFailure, trackOrderCreation } =
    useOrderActivityTracking();

  // load Razorpay SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const makePayment = async ({
    isin,
    quantity,
    bondData,
    session,
    orderId,
  }: PaymentParams): Promise<void> => {
    try {
      if (!orderReqData) {
        setIsLoading(true);
      }
      const response = orderReqData
        ? { data: orderReqData }
        : await apiClientCaller.post<PayApiResponse>(
            "/customer/order/pay",
            { isin, quantity, orderId },
            {
              params: { orderId },
            }
          );
      setOrderReqData(response.data);
      const {
        paymentOrderId,
        amount,
        currency,
        key,
        orderId: responseOrderId,
      } = response.data.responseData;

      // Use orderId from parameter or response, ensuring it's always a string
      const finalOrderId = orderId ?? String(responseOrderId);

      // Track order creation
      if (!orderReqData) {
        trackOrderCreation(finalOrderId, {
          isin,
          quantity,
          amount,
          currency,
          paymentOrderId,
        });
      }

      setIsLoading(false);
      // check Razorpay presence
      if (typeof window === "undefined" || !window.Razorpay) {
        toast({
          title: "Error",
          description: "Razorpay SDK not loaded",
          variant: "destructive",
        });
        return;
      }

      const options: RazorpayOptions = {
        key,
        amount: Math.round(amount * 100),
        currency,

        order_id: paymentOrderId,
        name: "MeraDhan",
        image: "https://www.meradhan.co/favicon/apple-icon-76x76.png",
        method: {
          upi: true, // ENABLE
          netbanking: true, // ENABLE
          card: false,
          wallet: false,
          emi: false,
          paylater: false,
        },
        description: `Buy ${quantity} ${bondData.bondName}`,
        handler: async (response: RazorpayPaymentResponse) => {
          toast({ title: "Payment Successful" });
          setIsLoading(true);
          try {
            // webhook will handle the rest of the logic
            trackPaymentSuccess(finalOrderId, response.razorpay_payment_id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            setIsLoading(false);
            setStep(3);
          } catch (error) {
            trackPaymentFailure(
              finalOrderId,
              error instanceof Error ? error.message : "Unknown error",
              {
                razorpay_payment_id: response.razorpay_payment_id,
              }
            );
            setIsLoading(false);
            throw error;
          }
        },
        modal: {
          ondismiss: () => {
            trackPaymentFailure(finalOrderId, "User cancelled payment");
            toast({
              title: "Payment Cancelled",
              variant: "destructive",
            });
          },
        },
        prefill: {
          name: `${session?.firstName ?? ""} ${session?.lastName ?? ""}`.trim(),
          email: session?.emailAddress ?? "",
          contact: session?.contact ?? "",
        },
        theme: { color: "#062c59" },
      };

      const rzp = new window.Razorpay(options as any);
      rzp.open();
    } catch (error) {
      // Use orderId from parameter or response if available
      const orderIdForError =
        orderId ??
        (orderReqData ? String(orderReqData.responseData.orderId) : "unknown");
      trackPaymentFailure(
        orderIdForError,
        error instanceof Error ? error.message : "Could not initiate payment",
        { isin, quantity }
      );
      toast({
        title: "Payment Failed",
        description: "Could not initiate payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelPayment = async (orderId: string): Promise<void> => {
    if (!orderReqData) {
      toast({ title: "Order Cancelled Successfully" });
      window.location.reload();
      return;
    }
    try {
      setIsLoading(true);
      await apiClientCaller.post(`/customer/order/cancel/${orderId}`);
      toast({ title: "Order Cancelled Successfully" });
      window.location.reload();
    } catch {
      toast({
        title: "Cancellation Failed",
        description: "Could not cancel the order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { makePayment, cancelPayment, isLoading };
}
