import { cn } from "@/lib/utils";
import React from "react";
import CookieContent from "./_components/CookieContent";
import TopTitleDesc from "@/global/components/basic/TopTitleDesc";

const CookiePolicy = () => {
  return (
    <>

         <TopTitleDesc
        title="Our Cookie <span class='text-secondary'>Policy</span>"
        description="Last updated: 19 March 2025"
      />

      <CookieContent />
    </>
  );
};

export default CookiePolicy;
