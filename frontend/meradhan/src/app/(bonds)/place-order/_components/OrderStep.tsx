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
import ReviewOrder from "../_components/Stages/ReviewOrder";
import StepperOrder from "../_components/StepperOrder";
import {
  BondDetailsResponse,
  BondOrderPricingData,
  CustomerByIdPayload,
} from "@root/apiGateway";
import OrderReceipt from "./Stages/OrderReceipt";
import Payment from "./Stages/Payment";
import { useOrderState } from "../store/useOrderState";
import { useEffect, useMemo, useRef } from "react";
import { useOrderActivityTracking } from "../_hooks/useOrderActivityTracking";
import { useSearchParams } from "next/navigation";
import { useBondOrderPricing } from "../_hooks/useBondOrderPricing";

const stepNames = ["Place Order", "Order Receipt", "Confirmation"];

function OrderStep({
  bond,
  customer,
  orderId,
  orderPricing: initialOrderPricing,
}: {
  bond: BondDetailsResponse;
  customer: CustomerByIdPayload;
  orderId: string;
  orderPricing: BondOrderPricingData | null;
}) {
  const searchParams = useSearchParams();
  const quantityParam = searchParams.get("quantity");
  const quantityForPricing = useMemo(() => {
    const q = Number(quantityParam ?? 1);
    return Number.isFinite(q) && q >= 1 ? Math.floor(q) : 1;
  }, [quantityParam]);
  const { step, resetOrderFlow, setQuantity } = useOrderState();
  const { data: orderPricing, isFetching: isPricingFetching } =
    useBondOrderPricing({
      isin: bond.isin,
      quantity: quantityForPricing,
      bond,
      initialPricing: initialOrderPricing,
    });
  const { trackPageView, trackStepChange } = useOrderActivityTracking();
  const previousStep = useRef(step);
  const hasTrackedPageView = useRef(false);

  // Fresh flow when opening place-order (or returning after leaving the page).
  useEffect(() => {
    resetOrderFlow();
    const q = Number(quantityParam ?? 1);
    setQuantity(Number.isFinite(q) && q >= 1 ? Math.floor(q) : 1);
    previousStep.current = 1;
    hasTrackedPageView.current = false;
  }, [bond.isin, quantityParam, resetOrderFlow, setQuantity]);

  // Track page view on mount
  useEffect(() => {
    if (!hasTrackedPageView.current) {
      trackPageView(orderId, bond.isin);
      hasTrackedPageView.current = true;
    }
  }, [orderId, bond.isin, trackPageView]);

  // Track step changes
  useEffect(() => {
    if (previousStep.current !== step) {
      const fromStep = previousStep.current;
      const toStep = step;
      const stepName = stepNames[step - 1] || `Step ${step}`;
      trackStepChange(orderId, fromStep, toStep, stepName);
      previousStep.current = step;
    }
  }, [step, orderId, trackStepChange]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);
  return (
    <div>
      <div className="mb-4 container">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{stepNames?.[step - 1]}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <SectionWrapper>
        <StepperOrder />
        {
          [
            <ReviewOrder
              bond={bond}
              customer={customer}
              orderId={orderId}
              orderPricing={orderPricing ?? null}
              isPricingFetching={isPricingFetching}
              key={"Review-Order"}
            />,
            <OrderReceipt
              bond={bond}
              customer={customer}
              orderId={orderId}
              orderPricing={orderPricing ?? null}
              key={"Order-Receipt"}
            />,
            <Payment
              bond={bond}
              customer={customer}
              orderId={orderId}
              key={"Payment"}
              settlementDateValue={orderPricing?.settlementDate ?? ""}
            />,
          ]?.[step - 1]
        }
      </SectionWrapper>
    </div>
  );
}

export default OrderStep;
