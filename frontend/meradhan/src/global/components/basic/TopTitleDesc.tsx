import { quicksand } from "@/global/font/font";
import { cn } from "@/lib/utils";
import React from "react";

function TopTitleDesc({
  children,
  description,
}: {
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-3 text-center">
      <h1
        className={cn(
          "font-medium lg:text-[44px] text-2xl",
          quicksand.className
        )}
      >
        {children}
      </h1>
      {description && <p>{description}</p>}
    </div>
  );
}

export default TopTitleDesc;
