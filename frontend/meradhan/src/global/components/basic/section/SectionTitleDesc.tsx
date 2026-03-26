import { cn } from "@/lib/utils";
import React from "react";

function SectionTitleDesc({
  title,
  description,
  className,
}: {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  className?: string;
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
          className={cn("font-medium text-2xl lg:text-3xl", "quicksand-medium")}
        >
          {title}
        </h3>
      )}
      {description && <p>{description}</p>}
    </div>
  );
}

export default SectionTitleDesc;
