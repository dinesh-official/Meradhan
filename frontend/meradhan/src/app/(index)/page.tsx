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

// Helper: extract responseData from a settled promise; on rejection log the
// reason and return an empty list so a single backend hiccup (ECONNRESET,
// timeout, slow query…) doesn't take down the whole homepage render. Node 22's
// undici has a known TransformStream cleanup bug that fires when an RSC stream
// is aborted because a Server Component throws — eating the error here keeps
// the render path complete and avoids triggering that secondary symptom.
function pickResponseData<T>(
  result: PromiseSettledResult<{ responseData?: T[] | null }>,
  label: string,
): T[] {
  if (result.status === "fulfilled") {
    return result.value?.responseData ?? [];
  }
  console.error(`[HomePage] ${label} failed:`, result.reason);
  return [];
}

export default async function HomePage() {
  const apiCaller = new apiGateway.bondsApi.BondsApi(apiServerCaller);

  const [latestRes, highYieldRes, zeroCouponRes] = await Promise.allSettled([
    apiCaller.getLatestBonds(100),
    apiCaller.getHighYieldBonds(100),
    apiCaller.getZeroCouponBonds(100),
  ]);

  const latest = pickResponseData(latestRes, "getLatestBonds");
  const highYield = pickResponseData(highYieldRes, "getHighYieldBonds");
  const zeroCoupon = pickResponseData(zeroCouponRes, "getZeroCouponBonds");

  return (
    <ViewPort>
      <HomeHeroSection />
      <LatestBondReleases
        latest={latest}
        highYield={highYield}
        zeroCoupon={zeroCoupon}
      />
      <WhyMeraDhanSection />
      <ToolsOfferedByMeraDhan />
      <div className="container">
        <SectionWrapper>
          <BondsByCategories />
        </SectionWrapper>
      </div>
      {/* <ReturnsCalculationSection /> */}
      {/* <XirrCalculator
        showTitle={true}
        showFlowChart={false}
        showChart={false}
      /> */}
      {/* <CustomersTestimonials /> */}
      {/* <RecentBlogs /> */}
    </ViewPort>
  );
}
