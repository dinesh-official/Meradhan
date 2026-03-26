import * as React from "react";

import { cn } from "@/lib/utils";

function Card({
  className,
  ...props
}: React.ComponentProps<"div"> & { accountMode?: boolean }) {
  const { accountMode, ...rest } = props;

  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-3 bg-card py-2 md:py-4 border rounded-lg border-[#E1E6E8]",
        accountMode && "px-0 py-0 lg:py-6 border-0 border-gray-200 lg:border",
        className
      )}
      {...rest}
    />
  );
}

function CardHeader({
  className,
  ...props
}: React.ComponentProps<"div"> & { accountMode?: boolean }) {
  const { accountMode, ...rest } = props;
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header items-start gap-2 grid has-data-[slot=card-action]:grid-cols-[1fr_auto] grid-rows-[auto_auto] auto-rows-min md:px-6 px-3 [.border-b]:pb-6",
        accountMode && "px-0 lg:px-6",
        className
      )}
      {...rest}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("font-semibold leading-none", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "justify-self-end self-start col-start-2 row-span-2 row-start-1",
        className
      )}
      {...props}
    />
  );
}

function CardContent({
  className,
  ...props
}: React.ComponentProps<"div"> & { accountMode?: boolean }) {
  const { accountMode, ...rest } = props;

  return (
    <div
      data-slot="card-content chart-content-container"
      className={cn("md:px-6 px-6 py-2", accountMode && "px-0 lg:px-6", className)}
      {...rest}
    />
  );
}

function CardFooter({
  className,
  ...props
}: React.ComponentProps<"div"> & { accountMode?: boolean }) {
  const { accountMode, ...rest } = props;

  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center px-6 [.border-t]:pt-6",
        accountMode && "px-0 lg:px-6",
        className
      )}
      {...rest}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
