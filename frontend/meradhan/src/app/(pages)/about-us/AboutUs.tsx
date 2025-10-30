import Footer from "@/global/components/footer/Footer";
import NewsLetter from "@/global/components/footer/NewsLetter";
import NavBar from "@/global/components/navbar/NavBar";
import { quicksand } from "@/global/font/font";
import { cn } from "@/lib/utils";
import React from "react";
import AboutMeraDhanSection from "./_components/sections/AboutMeraDhanSection";
import MissionVisionSection from "./_components/sections/MissionVisionSection";
import CoreValuesSection from "./_components/sections/CoreValuesSection";
import OfferingsSection from "./_components/sections/OfferingsSection";
import WhyChooseUsSection from "./_components/sections/WhyChooseUsSection.tsx";


const AboutUs = () => {
  return (
    <div>

      <div className="relative flex justify-center items-center bg-[#02264A] w-full h-[224px]">
        <div className="flex flex-col justify-center items-center text-center">
          <h1
            className={cn(
              "font-medium text-white text-3xl md:text-4xl",
              quicksand.className
            )}
          >
            About <span className="font-semibold text-[#F25C4C]">US</span>
          </h1>
          <p className="mt-2 w-[80%] text-white text-sm md:text-base">
            MeraDhan - Empowering INdia with Fixed INcome INvestments a Product
            of Bondnext Capital India Securities Private Limited
          </p>
        </div>
      </div>

      <AboutMeraDhanSection />

      <MissionVisionSection />

      <CoreValuesSection />

      <OfferingsSection />
      <WhyChooseUsSection />
      <NewsLetter />
      <Footer />
    </div>
  );
};

export default AboutUs;
