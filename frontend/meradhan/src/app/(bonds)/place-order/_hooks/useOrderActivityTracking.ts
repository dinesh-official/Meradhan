import { useCallback, useRef } from "react";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";

interface TrackActivityParams {
  orderId: string;
  step: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  outputData?: Record<string, unknown>;
  details?: Record<string, unknown>;
}

/**
 * Hook to track user activities on the place-order page
 * All activities are logged to order logs and displayed on the order details page
 */
export function useOrderActivityTracking() {
  const apiCaller = new apiGateway.meradhan.customerOrderApi(
    apiClientCaller
  );

  // Debounce tracking to avoid too many API calls
  const trackingQueue = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const trackActivity = useCallback(
    async ({
      orderId,
      step,
      status,
      outputData,
      details,
    }: TrackActivityParams) => {
      // Create a unique key for this activity type
      const activityKey = `${orderId}-${step}`;

      // Clear existing timeout for this activity
      if (trackingQueue.current.has(activityKey)) {
        clearTimeout(trackingQueue.current.get(activityKey)!);
      }

      // Debounce: wait 500ms before sending (to batch rapid changes)
      const timeoutId = setTimeout(async () => {
        try {
          await apiCaller.addOrderLog(orderId, step, status, outputData, details);
          trackingQueue.current.delete(activityKey);
        } catch (error) {
          // Silently fail - don't interrupt user flow
          console.error("Failed to track order activity:", error);
          trackingQueue.current.delete(activityKey);
        }
      }, 500);

      trackingQueue.current.set(activityKey, timeoutId);
    },
    [apiCaller]
  );

  // Helper methods for common activities
  const trackPageView = useCallback(
    (orderId: string, isin: string) => {
      trackActivity({
        orderId,
        step: "PAGE_VIEW",
        status: "SUCCESS",
        details: {
          isin,
          timestamp: new Date().toISOString(),
          userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
        },
      });
    },
    [trackActivity]
  );

  const trackStepChange = useCallback(
    (orderId: string, fromStep: number, toStep: number, stepName: string) => {
      trackActivity({
        orderId,
        step: `STEP_CHANGED_${stepName.toUpperCase()}`,
        status: "SUCCESS",
        details: {
          fromStep,
          toStep,
          stepName,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [trackActivity]
  );

  const trackQuantityChange = useCallback(
    (orderId: string, oldQuantity: number, newQuantity: number) => {
      trackActivity({
        orderId,
        step: "QUANTITY_CHANGED",
        status: "SUCCESS",
        details: {
          oldQuantity,
          newQuantity,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [trackActivity]
  );

  const trackSettlementDateChange = useCallback(
    (orderId: string, settlementDate: string) => {
      trackActivity({
        orderId,
        step: "SETTLEMENT_DATE_CHANGED",
        status: "SUCCESS",
        details: {
          settlementDate,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [trackActivity]
  );

  const trackCheckboxInteraction = useCallback(
    (orderId: string, checkboxName: string, checked: boolean) => {
      trackActivity({
        orderId,
        step: `CHECKBOX_${checkboxName.toUpperCase()}`,
        status: checked ? "SUCCESS" : "PENDING",
        details: {
          checkboxName,
          checked,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [trackActivity]
  );

  const trackOrderCreation = useCallback(
    (orderId: string, orderData: Record<string, unknown>) => {
      trackActivity({
        orderId,
        step: "ORDER_CREATED",
        status: "SUCCESS",
        outputData: {
          orderNumber: orderId,
        },
        details: {
          ...orderData,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [trackActivity]
  );

  const trackPaymentAttempt = useCallback(
    (orderId: string, paymentData: Record<string, unknown>) => {
      trackActivity({
        orderId,
        step: "PAYMENT_ATTEMPTED",
        status: "PENDING",
        details: {
          ...paymentData,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [trackActivity]
  );

  const trackPaymentSuccess = useCallback(
    (orderId: string, paymentId: string, paymentData?: Record<string, unknown>) => {
      trackActivity({
        orderId,
        step: "PAYMENT_SUCCESS",
        status: "SUCCESS",
        outputData: {
          paymentId,
        },
        details: {
          ...paymentData,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [trackActivity]
  );

  const trackPaymentFailure = useCallback(
    (orderId: string, error: string, paymentData?: Record<string, unknown>) => {
      trackActivity({
        orderId,
        step: "PAYMENT_FAILED",
        status: "FAILED",
        details: {
          error,
          ...paymentData,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [trackActivity]
  );

  const trackError = useCallback(
    (orderId: string, step: string, error: string, context?: Record<string, unknown>) => {
      trackActivity({
        orderId,
        step: `ERROR_${step}`,
        status: "FAILED",
        details: {
          error,
          ...context,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [trackActivity]
  );

  const trackButtonClick = useCallback(
    (orderId: string, buttonName: string, context?: Record<string, unknown>) => {
      trackActivity({
        orderId,
        step: `BUTTON_CLICK_${buttonName.toUpperCase()}`,
        status: "SUCCESS",
        details: {
          buttonName,
          ...context,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [trackActivity]
  );

  return {
    trackActivity,
    trackPageView,
    trackStepChange,
    trackQuantityChange,
    trackSettlementDateChange,
    trackCheckboxInteraction,
    trackOrderCreation,
    trackPaymentAttempt,
    trackPaymentSuccess,
    trackPaymentFailure,
    trackError,
    trackButtonClick,
  };
}

