'use static'
import ViewPort from "@/global/components/wrapper/ViewPort";
import BondsByCategories from "../../global/components/Bond/BondsByCategories";
import CustomersTestimonials from "./_components/CustomersTestimonials";
import HomeHeroSection from "./_components/HomeHeroSection";
import LatestBondReleases from "./_components/LatestBondReleases";
import ReturnsCalculationSection from "./_components/ReturnsCalculationSection";
import ToolsOfferedByMeraDhan from "./_components/ToolsOfferedbyMeraDhan";
import WhyMeraDhanSection from "./_components/WhyMeraDhanSection";
import RecentBlogs from "./_components/RecentBlogs";

export default function HomePage() {
  return (
    <ViewPort>
      <HomeHeroSection />
      <WhyMeraDhanSection />
      <ToolsOfferedByMeraDhan />
      <BondsByCategories />
      <LatestBondReleases />
      <ReturnsCalculationSection />
      <CustomersTestimonials />
      <RecentBlogs />
    </ViewPort>
  );
}
