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
      <NavBar />
      <div className="relative bg-[#02264A] h-[224px] w-full flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center">
          <h1
            className={cn(
              "text-3xl md:text-4xl font-medium text-white",
              quicksand.className
            )}
          >
            About <span className="text-[#F25C4C] font-semibold">US</span>
          </h1>
          <p className="text-white mt-2 text-sm md:text-base w-[80%]">
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
