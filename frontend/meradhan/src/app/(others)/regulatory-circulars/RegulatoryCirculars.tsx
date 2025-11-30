"use client";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { fetchRegulatoryCircularsByCategoryGql } from "./_actions/reg-cir";
import GridViewCard from "./_components/GridViewCard";
import ListViewCard from "./_components/ListViewCard";
import Pagination from "./_components/Pagination";
import SearchDateFilter from "./_components/SearchDateFilter";
import TabView from "./_components/TabView";

function RegulatoryCirculars({
  categories,
  category,
  search,
}: {
  categories?: {
    Slug: string;
    Title: string;
  }[];
  category?: string;
  search?: string;
}) {
  const [viewMode, setViewMode] = useLocalStorage(
    "reg-circulars-view-mode",
    "grid"
  );
  const [fromDate, setFromDate] = useState<string | undefined>(undefined);
  const [toDate, setToDate] = useState<string | undefined>(undefined);
  const [page, setPage] = useState<number>(1);

  const { data, isLoading } = useQuery({
    queryKey: [
      "regulatory-circulars",
      category,
      search,
      viewMode,
      page,
      fromDate,
      toDate,
    ],
    queryFn: async () => {
      const data = await fetchRegulatoryCircularsByCategoryGql({
        slug: category || "all",
        page: page,
        from: fromDate,
        to: toDate,
        search: search,
      });
      return data;
    },
  });

  return (
    <div>
      <SearchDateFilter
        category={category || ""}
        pageNo={page}
        qfrom={fromDate || ""}
        qto={toDate || ""}
        qsearch={search || ""}
        onDateChenge={(from, to) => {
          if (from && to) {
            setFromDate(from || undefined);
            setToDate(to || undefined);
          }
        }}
      />
      <TabView
        activeTab={category || "all"}
        categories={categories || []}
        category={category || ""}
        from={fromDate || ""}
        pageNo={page || 1}
        search={search || ""}
        viewMode={viewMode}
        to={toDate || ""}
        setActiveTab={(e) => {}}
        setViewMode={setViewMode}
      />
      <div>
        {isLoading && (
          <p className="text-center text-gray-500 mt-10 h-96 flex items-center justify-center">
            <Loader2Icon className="animate-spin mx-auto" />
          </p>
        )}

        {data?.data?.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No circulars found.</p>
        ) : viewMode === "grid" ? (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-2 mt-6 w-full">
            {data?.data?.map((item, index) => (
              <GridViewCard key={index} item={item} index={index} />
            ))}
          </div>
        ) : (
          <ul className="mt-6">
            {data?.data?.map((item, index) => (
              <ListViewCard key={index} item={item} index={index} />
            ))}
          </ul>
        )}
      </div>
      <Pagination
        pageInfo={{
          page: data?.pageInfo?.page,
          pageCount: data?.pageInfo?.pageCount,
        }}
        onClick={setPage}
      />
    </div>
  );
}

export default RegulatoryCirculars;
