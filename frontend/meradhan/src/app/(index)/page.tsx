import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import ViewPort from "@/global/components/wrapper/ViewPort";
import BondsByCategories from "../../global/components/Bond/BondsByCategories";
import CustomersTestimonials from "./_components/CustomersTestimonials";
import HomeHeroSection from "./_components/HomeHeroSection";
import RecentBlogs from "./_components/RecentBlogs";
import ReturnsCalculationSection from "./_components/ReturnsCalculationSection";
import ToolsOfferedByMeraDhan from "./_components/ToolsOfferedbyMeraDhan";
import WhyMeraDhanSection from "./_components/WhyMeraDhanSection";
import { generatePagesMetaData } from "@/graphql/pagesMetaDataGql_Action";

export const revalidate = 0; // Revalidate the page every hour

export const generateMetadata = async () => {
  return await generatePagesMetaData("index");
};

export default function HomePage() {
  return (
    <ViewPort>
      <HomeHeroSection />
      <WhyMeraDhanSection />
      <ToolsOfferedByMeraDhan />
      <div className="container">
        <SectionWrapper>
          <BondsByCategories />
        </SectionWrapper>
      </div>
      {/* <LatestBondReleases /> */}
      <ReturnsCalculationSection />
      <CustomersTestimonials />
      <RecentBlogs />
    </ViewPort>
  );
}
