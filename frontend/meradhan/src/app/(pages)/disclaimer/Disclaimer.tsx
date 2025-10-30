import Footer from "@/global/components/footer/Footer";
import NewsLetter from "@/global/components/footer/NewsLetter";
import NavBar from "@/global/components/navbar/NavBar";
import { quicksand } from "@/global/font/font";
import { cn } from "@/lib/utils";
import React from "react";
import DisclaimerContent from "./_components/DisclaimerContent";

const Disclaimer = () => {
  return (
    <div className="bg-primary h-72">

      <div className="relative flex justify-center items-center bg-[#02264A] w-full h-[224px]">
        <div className="flex flex-col justify-center items-center text-center">
          <h1
            className={cn(
              "font-medium text-white text-3xl md:text-4xl",
              quicksand.className
            )}
          >
            Disclaimer &{" "}
            <span className="font-semibold text-[#F25C4C]">
              Disclosure Notice
            </span>
          </h1>
          <p className="mt-2 text-white text-sm md:text-base">
            Last updated: 19 March 2025
          </p>
        </div>
      </div>
<DisclaimerContent/>
      <div className="mt-[4rem]">
        <NewsLetter />
        <Footer />
      </div>
    </div>
  );
};

export default Disclaimer;
