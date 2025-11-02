import { cn } from "@/lib/utils";
import React from "react";

function PageTitleDesc({
  title,
  description,
  className,
  descClassName,
  titleClassName,
}: {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  className?: string;
  descClassName?: string;
  titleClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-center items-center gap-3 text-center",
        className
      )}
    >
      {title && (
        <h3
          className={cn(
            "font-medium text-[28px] md:text-[36px] lg:text-[44px]",
            "quicksand-medium",
            titleClassName
          )}
        >
          {title}
        </h3>
      )}
      {description && <p className={descClassName}>{description}</p>}
    </div>
  );
}

export default PageTitleDesc;
