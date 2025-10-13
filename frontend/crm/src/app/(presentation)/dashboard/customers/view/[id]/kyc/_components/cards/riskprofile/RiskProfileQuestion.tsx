import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

function RiskProfileQuestion({
  children,
  question,
  className,
}: {
  question?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div>
      <p className="text-sm">{question}</p>
      <div className={cn("grid lg:grid-cols-4 md:grid-cols-2 lg:gap-5 gap-3 mt-2", className)}>
        {children}
      </div>
    </div>
  );
}

export default RiskProfileQuestion;

export function RiskProfileAnsOption({
  active,
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "px-4 py-2 bg-gray-100  rounded-xl",
        active && "bg-primary text-white",
        className
      )}
    >
      {children}
    </div>
  );
}
