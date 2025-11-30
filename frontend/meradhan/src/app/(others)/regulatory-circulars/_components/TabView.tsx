"use client";

import { useRef } from "react";
import { BiGridAlt, BiListUl } from "react-icons/bi";

function TabView({
  activeTab,
  setActiveTab,
  viewMode,
  setViewMode,
  categories,

  pageNo,
  search,
  from,
  to,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  viewMode: string;
  setViewMode: (viewMode: string) => void;
  categories: {
    Slug: string;
    Title: string;
  }[];
  category: string;
  pageNo: number;
  search: string;
  from: string;
  to: string;
}) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onSubmit(tab);

    const button = tabRefs.current[tab];
    if (button?.scrollIntoView) {
      button.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  const onSubmit = (tab: string) => {
    let slug: string = "/regulatory-circulars/";
    slug = tab === "all" ? "/regulatory-circulars" : slug + tab;
    window.location.href = slug;
  };

  return (
    <div className="flex flex-row justify-between items-center w-full mt-5 bg-muted rounded-md overflow-hidden gap-3">
      {/* Tabs */}
      <div
        className="
        flex items-center gap-2 overflow-x-auto scrollbar-hide
        py-0
        "
      >
        {[{ Slug: "all", Title: "ALL" }, ...categories].map((tab) => (
          <button
            key={tab.Slug}
            ref={(el) => {
              tabRefs.current[tab.Slug] = el;
            }}
            onClick={() => handleTabClick(tab.Slug)}
            className={`
                px-4 py-2 rounded-md whitespace-nowrap text-sm font-semibold cursor-pointer 
                transition-colors 
                ${
                  activeTab === tab.Slug
                    ? "bg-[#02264A] text-white border-[#02264A]"
                    : "border-gray-300 hover:text-[#02264A]"
                }
              `}
          >
            {tab.Title}
          </button>
        ))}
      </div>

      {/* View mode toggle (Desktop only) */}
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={() => setViewMode("list")}
          className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors cursor-pointer"
        >
          <BiListUl
            className={`text-lg ${
              viewMode === "list" ? "text-[#002c59]" : "text-gray-500"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              viewMode === "list" ? "text-[#002c59]" : "text-gray-500"
            }`}
          >
            LIST
          </span>
        </button>

        <button
          onClick={() => setViewMode("grid")}
          className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors cursor-pointer"
        >
          <BiGridAlt
            className={`text-lg ${
              viewMode === "grid" ? "text-[#002c59]" : "text-gray-500"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              viewMode === "grid" ? "text-[#002c59]" : "text-gray-500"
            }`}
          >
            GRID
          </span>
        </button>
      </div>
    </div>
  );
}

export default TabView;
