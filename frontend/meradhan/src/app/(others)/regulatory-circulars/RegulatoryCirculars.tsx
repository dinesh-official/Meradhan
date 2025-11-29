"use client";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { T_RegulatoryCirculars_GQL_RESPONSE } from "./_actions/reg-cir";
import GridViewCard from "./_components/GridViewCard";
import ListViewCard from "./_components/ListViewCard";
import SearchDateFilter from "./_components/SearchDateFilter";
import TabView from "./_components/TabView";

function RegulatoryCirculars({
  categories,
  category,
  from,
  search,
  to,
  page,
  data,
}: {
  categories?: {
    Slug: string;
    Title: string;
  }[];
  category?: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  data: T_RegulatoryCirculars_GQL_RESPONSE;
}) {
  const [viewMode, setViewMode] = useLocalStorage(
    "reg-circulars-view-mode",
    "list"
  );
  return (
    <div>
      <SearchDateFilter
        category={category || ""}
        pageNo={page || 1}
        qfrom={from || ""}
        qto={to || ""}
        qsearch={search || ""}
      />
      <TabView
        activeTab={category || "all"}
        categories={categories || []}
        category={category || ""}
        from={from || ""}
        pageNo={page || 1}
        search={search || ""}
        viewMode={viewMode}
        to={to || ""}
        setActiveTab={(e) => {}}
        setViewMode={setViewMode}
      />
      <div>
        {data.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No circulars found.</p>
        ) : viewMode === "grid" ? (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-2 mt-6 w-full">
            {data.map((item, index) => (
              <GridViewCard key={index} item={item} index={index} />
            ))}
          </div>
        ) : (
          <ul className="mt-6">
            {data.map((item, index) => (
              <ListViewCard key={index} item={item} index={index} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default RegulatoryCirculars;
