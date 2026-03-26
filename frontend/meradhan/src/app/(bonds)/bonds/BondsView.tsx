"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionViewWrapper } from "@/global/components/basic/section/SectionWrapper";
import { BondListCard } from "@/global/components/Bond/BondListCard";
import BondsByCategories from "@/global/components/Bond/BondsByCategories";
import { cn } from "@/lib/utils";
import {
  BondDetailsResponse,
  ListedBondsResponse,
  PaginationMeta,
} from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { LoaderCircle, LucideLayoutGrid } from "lucide-react";
import { ReactNode } from "react";
import { FaList } from "react-icons/fa";
import z from "zod";
import BondPagePagination from "../_components/BondPagePagination";
import ExploreBondsHeader from "../_components/ExploreBondsHeader";
import useBondsFilters from "../_hooks/useBondsFilters";
import { useViewModeStore } from "../_hooks/useViewModeStore";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import CompareView from "../_components/CompareView";
import UpcomingBonds from "../_components/UpcomingBonds";

function BondsView({
  bondsData,
  options,
  pathname,
  category,
}: {
  filter: z.infer<typeof appSchema.bonds.bondsFilterSchema>;
  bondsData: ListedBondsResponse["responseData"];
  pathname: string;
  category: string;
  options: {
    showBondsByCategory?: boolean;
    showUpcomingBonds?: boolean;

    header: {
      title: string | ReactNode;
      desc?: string | ReactNode;
    };
    page: {
      title: string | ReactNode;
      desc?: string | ReactNode;
    };
  };
}) {
  const bondFilterManager = useBondsFilters({ pathname, category });
  const { setViewMode, viewMode } = useViewModeStore();

  const bondsListData =
    bondFilterManager.applyFilterMutation.data?.responseData || bondsData;

  return (
    <>
      <ExploreBondsHeader
        manager={bondFilterManager}
        title={options.header.title}
        desc={options.header.desc}
        applyFilters={() => {
          bondFilterManager.applyFilters(bondFilterManager.filters);
        }}

        rootUrl={pathname}
      />
      <SectionViewWrapper>
        {options.showBondsByCategory && <BondsByCategories />}
        {options.showUpcomingBonds && <UpcomingBonds />}
        {bondFilterManager.applyFilterMutation.isPending ? (
          <div className="flex justify-center items-center h-96 container">
            <LoaderCircle
              className="text-primary animate-spin animate"
              size={50}
            />
          </div>
        ) : (
          <RenderBondView
            bondsListData={bondsListData}
            options={options}
            pathname={pathname}
            setViewMode={setViewMode}
            viewMode={viewMode}

            isFiltered={bondFilterManager.anyFilterApplied}
          />
        )}
      </SectionViewWrapper>
      <CompareView />
    </>
  );
}

export default BondsView;
function RenderBondView({
  bondsListData,
  options,
  pathname,
  setViewMode,
  viewMode,
  isFiltered,
}: {
  options: {
    showBondsByCategory?: boolean;
    header: {
      title: string | ReactNode;
      desc?: string | ReactNode;
    };
    page: {
      title: string | ReactNode;
      desc?: string | ReactNode;
    };
  };
  viewMode: string;
  setViewMode: (mode: "list" | "grid") => void;
  bondsListData: { data: BondDetailsResponse[]; meta: PaginationMeta };
  pathname: string;
  isFiltered?: boolean;
}) {
  if (bondsListData.data.length == 0)
    return (
      <NotBondsFound
        onReset={() => {
          window.location.href = pathname;
        }}
        hideBorder={!options.showBondsByCategory}
      />
    );

  return (
    <div className={cn("container", options.showBondsByCategory && "mt-14 ")}>
      <div className="flex justify-between items-center">
        {isFiltered ? (
          <h4 className="text-xl">
            Showing bonds based on selected filters or search
          </h4>
        ) : (
          options.page.title
        )}
        <Tabs
          defaultValue={viewMode}
          onValueChange={(e) => setViewMode(e == "list" ? "list" : "grid")}
          className="hidden lg:flex"
        >
          <TabsList>
            <TabsTrigger
              value={"list"}
              className="gap-2 px-3 py-3 text-md cursor-pointer"
            >
              <FaList /> List
            </TabsTrigger>
            <TabsTrigger
              value="grid"
              className="gap-2 px-3 py-3 text-md cursor-pointer"
            >
              <LucideLayoutGrid /> Grid
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {options.page.desc && !isFiltered && (
        <p className="mt-3">{options.page.desc}</p>
      )}

      <div
        className={`gap-5 grid grid-cols-1 mt-2 py-5 ${viewMode === "grid" ? "lg:grid-cols-3" : "grid-cols-1"
          }`}
      >
        {bondsListData.data.map((bond) => (
          <BondListCard
            key={bond.isin}
            gridMode={viewMode === "grid"}
            data={bond}
          />
        ))}
      </div>

      <div className="mt-5">
        <BondPagePagination
          pathname={pathname}
          activePage={bondsListData.meta.page}
          totalPages={bondsListData.meta.totalPages}
        />

      </div>
    </div>
  );
}

function NotBondsFound({ onReset, hideBorder }: { onReset: () => void, hideBorder: boolean }) {
  return (
    <div className="mt-14 container">
      <div className={cn("flex flex-col justify-center items-center gap-5 pt-14 border-gray-300 border-t text-center", hideBorder && "border-t-0 pt-0")}>
        <Image
          src="/static/sad-emoji.svg"
          alt="No Data"
          width={100}
          height={100}
          className="w-18 h-18"
        />
        <p className="text-2xl">No Bonds Found</p>
        <p>Try different filters</p>
        <Button variant="outline" onClick={onReset}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
