"use client";

import SectionTitleDesc from "@/global/components/basic/section/SectionTitleDesc";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import { BondListCard } from "@/global/components/Bond/BondListCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BondDetailsResponse } from "@root/apiGateway";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { canShowBuyNow } from "@/global/utils/bondPurchaseEligibility";

type LatestBondReleasesProps = {
  latest: BondDetailsResponse[];
  highYield: BondDetailsResponse[];
  zeroCoupon: BondDetailsResponse[];
};

type TabValue =
  | "latest"
  | "high-yield"
  | "zero-coupon"
  | "aaa"
  | "secured"
  | "monthly-income"
  | "min-10000";

const TAB_DEFS: Array<{ value: TabValue; label: string }> = [
  { value: "latest", label: "Latest Release" },
  { value: "high-yield", label: "11+ Yield" },
  { value: "zero-coupon", label: "Zero Coupon" },
  { value: "aaa", label: "AAA Bonds" },
  { value: "secured", label: "Secured" },
  { value: "monthly-income", label: "Monthly Income" },
  { value: "min-10000", label: "Minimum ₹10,000" },
];

function sortBuyNowFirst(bonds: BondDetailsResponse[]): BondDetailsResponse[] {
  return bonds
    .slice()
    .sort((a, b) => (canShowBuyNow(b) ? 1 : 0) - (canShowBuyNow(a) ? 1 : 0));
}

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 3,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 1024, min: 768 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 768, min: 0 },
    items: 1,
  },
};

function BondsCarousel({ bonds }: { bonds: BondDetailsResponse[] }) {
  return (
    <Carousel
      responsive={responsive}
      autoPlay
      infinite
      partialVisible={false}
      autoPlaySpeed={3000}
      showDots={false}
      itemClass="px-2 pb-4"
    >
      {bonds.map((bond, i) => (
        <BondListCard
          gridMode
          data={bond}
          key={bond.isin}
          odd={i % 2 === 1}
          onlyShare
        />
      ))}
    </Carousel>
  );
}

function LatestBondReleases({
  latest,
  highYield,
  zeroCoupon,
}: LatestBondReleasesProps) {
  const allBonds = [...latest, ...highYield, ...zeroCoupon].filter(
    (bond, index, self) =>
      self.findIndex((b) => b.isin === bond.isin) === index,
  );

  const bondsByTab: Record<TabValue, BondDetailsResponse[]> = {
    latest: sortBuyNowFirst(latest),
    "high-yield": sortBuyNowFirst(highYield),
    "zero-coupon": sortBuyNowFirst(zeroCoupon),
    aaa: sortBuyNowFirst(
      allBonds.filter((b) => b.creditRating?.includes("AAA")),
    ),
    secured: sortBuyNowFirst(
      allBonds.filter((b) =>
        b.natureOfInstrument?.toLowerCase().includes("secured"),
      ),
    ),
    "monthly-income": sortBuyNowFirst(
      allBonds.filter((b) => b.interestPaymentFrequency === "MONTHLY"),
    ),
    "min-10000": sortBuyNowFirst(allBonds.filter((b) => b.faceValue >= 10000)),
  };

  const visibleTabs = TAB_DEFS.filter(
    (tab) => (bondsByTab[tab.value]?.length ?? 0) > 0,
  );

  if (visibleTabs.length === 0) return null;

  return (
    <SectionWrapper>
      <div className="flex flex-col gap-5 container">
        <SectionTitleDesc
          title={
            <>
              <span className="font-semibold text-secondary">Explore Bonds</span>{" "}
              <span className="text-black">Available on MeraDhan</span>
            </>
          }
          description="Browse curated bond opportunities and choose what suits your investment needs."
        />
        <Tabs defaultValue={visibleTabs[0].value} className="gap-5">
          <TabsList className="bg-muted mx-auto h-10 p-1">
            {visibleTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="px-4">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {visibleTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="-mx-2">
              <BondsCarousel bonds={bondsByTab[tab.value]} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </SectionWrapper>
  );
}

export default LatestBondReleases;