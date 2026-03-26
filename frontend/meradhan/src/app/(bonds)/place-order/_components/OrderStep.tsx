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
import { BondDetailsResponse, CustomerByIdPayload } from "@root/apiGateway";
import OrderReceipt from "./Stages/OrderReceipt";
import Payment from "./Stages/Payment";
import { useOrderState } from "../store/useOrderState";
import { useEffect, useRef } from "react";
import { useOrderActivityTracking } from "../_hooks/useOrderActivityTracking";

const stepNames = ["Place Order", "Order Receipt", "Make Payment"];

function OrderStep({
  bond,
  customer,
  orderId,
}: {
  bond: BondDetailsResponse;
  customer: CustomerByIdPayload;
  orderId: string;
}) {
  const { step } = useOrderState();
  const { trackPageView, trackStepChange } = useOrderActivityTracking();
  const previousStep = useRef(step);
  const hasTrackedPageView = useRef(false);

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
              key={"Review-Order"}
            />,
            <OrderReceipt
              bond={bond}
              customer={customer}
              orderId={orderId}
              key={"Order-Receipt"}
            />,
            <Payment
              bond={bond}
              customer={customer}
              orderId={orderId}
              key={"Payment"}
            />,
          ]?.[step - 1]
        }
      </SectionWrapper>
    </div>
  );
}

export default OrderStep;
