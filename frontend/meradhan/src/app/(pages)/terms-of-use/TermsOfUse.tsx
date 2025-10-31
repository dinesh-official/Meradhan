import React from "react";
import TermsContent from "./_components/TermsContent";
import ViewPort from "@/global/components/wrapper/ViewPort";
import TopTitleDesc from "@/global/components/basic/TopTitleDesc";

const TermsOfUse = () => {
  return (
    <ViewPort>
      <TopTitleDesc
        title="Terms & <span class='text-secondary'>Conditions</span>"
        description="Last updated: 19 March 2025"
      />

      <TermsContent />
    </ViewPort>
  );
};

export default TermsOfUse;
