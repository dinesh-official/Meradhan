"use client";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { useOrderState } from "../store/useOrderState";

const steps = [
  {
    step: 1,
    title: "Review Order",
  },
  {
    step: 2,
    title: "Order Receipt",
  },
  {
    step: 3,
    title: "Make Payment",
  },
];

export default function StepperOrder() {
  const { step } = useOrderState();
  return (
    <div className="space-y-8 text-center max-w-[800px] mx-auto mb-10">
      <Stepper defaultValue={step} value={step}>
        {steps.map(({ step, title }) => (
          <StepperItem
            className="relative flex-1 flex-col!"
            key={step}
            step={step}
          >
            <StepperTrigger className="flex-col gap-3 rounded text-center">
              <StepperIndicator />
              <div className="space-y-0.5 px-2 text-center">
                <StepperTitle className="text-xs font-normal max-w-10 text-center flex-col justify-center items-center">
                  {title}
                </StepperTitle>
              </div>
            </StepperTrigger>
            {step < steps.length && (
              <StepperSeparator className="-order-1 -translate-y-1/2 absolute inset-x-0 top-3 left-[calc(50%+0.75rem+0.125rem)] m-0 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none" />
            )}
          </StepperItem>
        ))}
      </Stepper>
    </div>
  );
}
