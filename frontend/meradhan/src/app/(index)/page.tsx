import apiServerCaller from "@/core/connection/apiServerCaller";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import ViewPort from "@/global/components/wrapper/ViewPort";
import { generatePagesMetaData } from "@/graphql/pagesMetaDataGql_Action";
import apiGateway, { type BondDetailsResponse } from "@root/apiGateway";
import BondsByCategories from "../../global/components/Bond/BondsByCategories";
import HomeHeroSection from "./_components/HomeHeroSection";
import LatestBondReleases from "./_components/LatestBondReleases";
import ToolsOfferedByMeraDhan from "./_components/ToolsOfferedbyMeraDhan";
import WhyMeraDhanSection from "./_components/WhyMeraDhanSection";
import { unstable_cache } from "next/cache";

// ISR: one render per hour per path — avoids hammering stage-be on every visit.
export const revalidate = 3600;
export const generateMetadata = async () => {
  return await generatePagesMetaData("index");
};

const HOMEPAGE_BOND_LIMIT = 40;

type HomepageBondLists = {
  latest: BondDetailsResponse[];
  highYield: BondDetailsResponse[];
  zeroCoupon: BondDetailsResponse[];
};

const emptyBondLists: HomepageBondLists = {
  latest: [],
  highYield: [],
  zeroCoupon: [],
};

const loadHomepageBonds = unstable_cache(
  async (): Promise<HomepageBondLists> => {
    const apiCaller = new apiGateway.bondsApi.BondsApi(apiServerCaller);
    try {
      const res = await apiCaller.getHomepageBonds(HOMEPAGE_BOND_LIMIT);
      return {
        latest: res.responseData?.latest ?? [],
        highYield: res.responseData?.highYield ?? [],
        zeroCoupon: res.responseData?.zeroCoupon ?? [],
      };
    } catch (err) {
      // One HTTP hop (not three) — transient ECONNRESET during ECS deploy still
      // renders the page with empty carousels instead of failing SSR.
      console.error("[HomePage] getHomepageBonds failed:", err);
      return emptyBondLists;
    }
  },
  ["meradhan-homepage-bonds"],
  { revalidate: 3600 },
);

export default async function HomePage() {
  const { latest, highYield, zeroCoupon } = await loadHomepageBonds();

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
    </ViewPort>
  );
}
