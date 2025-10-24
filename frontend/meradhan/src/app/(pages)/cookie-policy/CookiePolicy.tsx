import Footer from "@/global/components/footer/Footer";
import NewsLetter from "@/global/components/footer/NewsLetter";
import NavBar from "@/global/components/navbar/NavBar";
import { quicksand } from "@/global/font/font";
import { cn } from "@/lib/utils";
import React from "react";
import CookieContent from "./_components/CookieContent";

const CookiePolicy = () => {
  return (
    <div>
      <NavBar />
      <div className="relative bg-[#02264A] h-[224px] w-full flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center">
          <h1
            className={cn(
              "text-3xl md:text-4xl font-medium text-white",
              quicksand.className
            )}
          >
            Our Cookie{" "}
            <span className="text-[#F25C4C] font-semibold">Policy</span>
          </h1>
          <p className="text-white mt-2 text-sm md:text-base">
            Last updated: 19 March 2025
          </p>
        </div>
      </div>

      <CookieContent />

      <div className="mt-[4rem]">
        <NewsLetter />
        <Footer />
      </div>
    </div>
  );
};

export default CookiePolicy;
