import TopTitleDesc from "@/global/components/basic/TopTitleDesc";
import NewsLetter from "@/global/components/footer/NewsLetter";
import ViewPort from "@/global/components/wrapper/ViewPort";
import AboutMeraDhanSection from "./_components/sections/AboutMeraDhanSection";
import CoreValuesSection from "./_components/sections/CoreValuesSection";
import MissionVisionSection from "./_components/sections/MissionVisionSection";
import OfferingsSection from "./_components/sections/OfferingsSection";
import WhyChooseUsSection from "./_components/sections/WhyChooseUsSection.tsx";

const AboutUs = () => {
  return (
   <>
      <TopTitleDesc
        title="About <span class='text-secondary'>Us</span>"
        description="MeraDhan - Empowering INdia with Fixed INcome INvestments a Product
            of Bondnext Capital India Securities Private Limited"
      />

      <AboutMeraDhanSection />

      <MissionVisionSection />

      <CoreValuesSection />

      <OfferingsSection />
      <WhyChooseUsSection />
   </>
  );
};

export default AboutUs;
