import TopTitleDesc from "@/global/components/basic/TopTitleDesc";
import { T_PAGE_DATA } from "@/graphql/pagesGQLAction";
import AboutMeraDhanSection from "./_components/sections/AboutMeraDhanSection";
import CoreValuesSection from "./_components/sections/CoreValuesSection";
import MissionVisionSection from "./_components/sections/MissionVisionSection";
import OfferingsSection from "./_components/sections/OfferingsSection";
import OurExports from "./_components/sections/OurExparts";
import WhyChooseUsSection from "./_components/sections/WhyChooseUsSection.tsx";

const AboutUs = ({ Description, Title, Content }: T_PAGE_DATA) => {
  return (
    <>
      <TopTitleDesc title={Title} description={Description} />

      <div>
        <AboutMeraDhanSection />
        <MissionVisionSection />
        <CoreValuesSection />
        <OfferingsSection />
        <OurExports />
        <WhyChooseUsSection />
        <div dangerouslySetInnerHTML={{ __html: Content }} />
      </div>
    </>
  );
};

export default AboutUs;
