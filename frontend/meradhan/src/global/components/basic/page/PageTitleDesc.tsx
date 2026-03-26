import { cn } from "@/lib/utils";
import React from "react";
import { sanitizeStrapiHTML } from "@/global/utils/html-sanitizer";

interface PageTitleDescProps {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  className?: string;
  descClassName?: string;
  titleClassName?: string;
}

function PageTitleDesc({
  title,
  description,
  className,
  descClassName,
  titleClassName,
}: PageTitleDescProps) {
  const renderContent = (content: string | React.ReactNode) => {
    if (typeof content === "string") {
      return <span dangerouslySetInnerHTML={{ __html: sanitizeStrapiHTML(content) }} />;
    }
    return content;
  };

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
            "font-medium text-[28px] md:text-[36px] lg:text-[44px]  ",
            "quicksand-medium",
            titleClassName
          )}
        >
          {renderContent(title)}
        </h3>
      )}

      {description && (
        <p className={cn("text-gray-600", descClassName)}>
          {renderContent(description)}
        </p>
      )}
    </div>
  );
}

export default PageTitleDesc;
