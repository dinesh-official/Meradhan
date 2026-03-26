import apiServerCaller from "@/core/connection/apiServerCaller";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import ViewPort from "@/global/components/wrapper/ViewPort";
import { generatePagesMetaData } from "@/graphql/pagesMetaDataGql_Action";
import apiGateway from "@root/apiGateway";
import BondsByCategories from "../../global/components/Bond/BondsByCategories";
import HomeHeroSection from "./_components/HomeHeroSection";
import LatestBondReleases from "./_components/LatestBondReleases";
import ToolsOfferedByMeraDhan from "./_components/ToolsOfferedbyMeraDhan";
import WhyMeraDhanSection from "./_components/WhyMeraDhanSection";
import XirrCalculator from "../(tools)/ytm-calculator/_components/XirrCalculator";

export const revalidate = 0; // Revalidate the page every hour
export const generateMetadata = async () => {
  return await generatePagesMetaData("index");
};

export default async function HomePage() {
  const apiCaller = new apiGateway.bondsApi.BondsApi(apiServerCaller);

  const { responseData } = await apiCaller.getLatestBonds(3);

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
      <LatestBondReleases bonds={responseData || []} />
      {/* <ReturnsCalculationSection /> */}
      <XirrCalculator
        showTitle={true}
        showFlowChart={false}
        showChart={false}
      />
      {/* <CustomersTestimonials /> */}
      {/* <RecentBlogs /> */}
    </ViewPort>
  );
}
