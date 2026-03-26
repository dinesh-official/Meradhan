import React from "react";
import { sanitizeStrapiHTML } from "@/global/utils/html-sanitizer";

const FdHeader = ({
  description,
  title,
  content,
}: {
  title: string;
  description: string;
  content?: string;
}) => {
  return (
    <div className="flex justify-center w-full">
      <div className="container">
        <div className="pb-16 space-y-4">
          <h1
            className="text-[36px] quicksand-medium title"
            dangerouslySetInnerHTML={{ __html: sanitizeStrapiHTML(title) }}
          />
          <p
            className="text-[24px]"
            dangerouslySetInnerHTML={{ __html: sanitizeStrapiHTML(description) }}
          />

          <p className="text-[16px] "></p>
          {content && (
            <p
              className="text-[16px]"
              dangerouslySetInnerHTML={{ __html: sanitizeStrapiHTML(content) }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FdHeader;
