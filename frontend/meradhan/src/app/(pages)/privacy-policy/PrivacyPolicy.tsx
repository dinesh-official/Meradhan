import React from "react";
import PrivacyPolicyContent from "./_components/PrivacyPolicyContent";
import TopTitleDesc from "@/global/components/basic/TopTitleDesc";

const PrivacyPolicy = () => {
  return (
    <>
      <TopTitleDesc
        title="Privacy <span class='text-secondary'>Policy</span>"
        description="Last updated: 19 March 2025"
      />
      <PrivacyPolicyContent />
    </>
  );
};

export default PrivacyPolicy;
