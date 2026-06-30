"use client";

import SectionTitleDesc from "@/global/components/basic/section/SectionTitleDesc";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import { BondListCard } from "@/global/components/Bond/BondListCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BondDetailsResponse } from "@root/apiGateway";
import Link from "next/link";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { canShowBuyNow } from "@/global/utils/bondPurchaseEligibility";

type LatestBondReleasesProps = {
  latest: BondDetailsResponse[];
  highYield: BondDetailsResponse[];
  zeroCoupon: BondDetailsResponse[];
};

type TabValue =
  | "all"
  | "latest"
  | "high-yield"
  | "zero-coupon"
  | "aaa"
  | "secured"
  | "monthly-income"
  | "min-10000";

const TAB_DEFS: Array<{ value: TabValue; label: string }> = [
  { value: "high-yield", label: "HIGH YIELD BONDS" },
  { value: "secured", label: "SECURED" },
  { value: "monthly-income", label: "MONTHLY INTEREST BONDS" },
  { value: "min-10000", label: "BONDS WITH ₹10,000 MINIMUM INVESTMENT" },
  { value: "zero-coupon", label: "ZERO COUPON BONDS" },
];

function dedupe(bonds: BondDetailsResponse[]): BondDetailsResponse[] {
  return bonds.filter(
    (bond, index, self) =>
      self.findIndex((b) => b.isin === bond.isin) === index,
  );
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
  const allBonds = dedupe([...latest, ...highYield, ...zeroCoupon]);

  const bondsByTab: Record<TabValue, BondDetailsResponse[]> = {
    all: allBonds,
    latest: latest,
    "high-yield": highYield,
    "zero-coupon": zeroCoupon,
    aaa: allBonds.filter((b) => b.creditRating?.includes("AAA")),
    secured: allBonds.filter((b) =>
      b.natureOfInstrument?.toUpperCase() === "SECURED",
    ),
    "monthly-income": allBonds.filter(
      (b) => b.interestPaymentFrequency === "MONTHLY",
    ),
    "min-10000": allBonds.filter(
      (b) => b.faceValue == 10000
    ),
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
          <TabsList className="bg-muted mx-auto h-10 max-w-full justify-start overflow-x-auto p-1 scrollbar-hide">
            {visibleTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="shrink-0 px-4"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex justify-center">
            <Link
              href="/bonds"
              className="inline-flex items-center justify-center gap-1 rounded-md border bg-background px-6 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted active:scale-95"
            >
              View All Bonds <span aria-hidden>→</span>
            </Link>
          </div>
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