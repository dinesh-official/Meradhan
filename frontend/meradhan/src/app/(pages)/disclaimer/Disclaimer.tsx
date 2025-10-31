import Footer from "@/global/components/footer/Footer";
import NewsLetter from "@/global/components/footer/NewsLetter";
import NavBar from "@/global/components/navbar/NavBar";
import { cn } from "@/lib/utils";
import React from "react";
import DisclaimerContent from "./_components/DisclaimerContent";
import TopTitleDesc from "@/global/components/basic/TopTitleDesc";

const Disclaimer = () => {
  return (
    <div className="">
      <TopTitleDesc
        title="Disclaimer &<span class='text-secondary'>Disclosure Notice</span>"
        description="Last updated: 19 March 2025"
      />
      <DisclaimerContent />
    </div>
  );
};

export default Disclaimer;
