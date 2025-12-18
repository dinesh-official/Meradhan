import { cn } from "@/lib/utils";
import React from "react";
import { sanitizeStrapiHTML } from "@/global/utils/html-sanitizer";

function TopTitleDesc({
  children,
  description,
  title,
}: {
  title?: string;
  children?: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="bg-primary py-16">
      <div className="flex flex-col justify-center items-center gap-4 text-white text-center container">
        {title && (
          <h1
            className={cn(
              "text-[28px] md:text-[36px] lg:text-[44px] quicksand-medium"
            )}
            dangerouslySetInnerHTML={{ __html: sanitizeStrapiHTML(title) }}
          />
        )}

        {description && (
          <p
            className="md:max-w-[60%]"
            dangerouslySetInnerHTML={{ __html: sanitizeStrapiHTML(description) }}
          />
        )}
      </div>
      {children}
    </div>
  );
}

export default TopTitleDesc;
