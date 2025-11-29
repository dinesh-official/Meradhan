import { cn } from "@/lib/utils";
import React from "react";

type SectionWrapperProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

function SectionWrapper({
  children,
  className = "",
  ...props
}: SectionWrapperProps) {
  return (
    <section className={cn(`py-14`, className)} {...props}>
      {children}
    </section>
  );
}

export default SectionWrapper;

export function SectionViewWrapper({
  children,
  className = "",
  ...props
}: SectionWrapperProps) {
  return (
    <section className={cn(`py-[70px] `, className)} {...props}>
      {children}
    </section>
  );
}
