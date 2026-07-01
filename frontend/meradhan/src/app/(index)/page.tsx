import { apiServerCallerPublic } from "@/core/connection/apiServerCaller";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import ViewPort from "@/global/components/wrapper/ViewPort";
import { generatePagesMetaData } from "@/graphql/pagesMetaDataGql_Action";
import apiGateway, { type BondDetailsResponse } from "@root/apiGateway";
import BondsByCategories from "../../global/components/Bond/BondsByCategories";
import HomeHeroSection from "./_components/HomeHeroSection";
import LatestBondReleases from "./_components/LatestBondReleases";
import ToolsOfferedByMeraDhan from "./_components/ToolsOfferedbyMeraDhan";
import WhyMeraDhanSection from "./_components/WhyMeraDhanSection";

export const revalidate = 0;
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

async function loadHomepageBonds(): Promise<HomepageBondLists> {
  const apiCaller = new apiGateway.bondsApi.BondsApi(apiServerCallerPublic);
  try {
    const res = await apiCaller.getHomepageBonds(HOMEPAGE_BOND_LIMIT);
    return {
      latest: res.responseData?.latest ?? [],
      highYield: res.responseData?.highYield ?? [],
      zeroCoupon: res.responseData?.zeroCoupon ?? [],
    };
  } catch (err) {
    console.error("[HomePage] getHomepageBonds failed:", err);
    return emptyBondLists;
  }
}

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
