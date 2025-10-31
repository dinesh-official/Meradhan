import { cn } from "@/lib/utils";
import React from "react";

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
    <div className="  bg-primary py-18">
      <div className="container flex flex-col items-center justify-center text-center text-white gap-3">
        <h1
          className={cn(
            "quicksand-medium  text-[28px] md:text-[36px] lg:text-[44px]",
            
          )}
        dangerouslySetInnerHTML={{__html:title}} 
        />
        
        {description && <p className="md:max-w-[50%]"
        dangerouslySetInnerHTML={{__html:description}}
        />}
      </div>
      {children}
    </div>
  );
}

export default TopTitleDesc;
