import { Input } from "@/components/ui/input";
import { Calendar, LayoutGrid, List, Search } from "lucide-react";
import React, { useState } from "react";

const segments = ["ALL", "SEBI", "BSE", "NSE"];

const ListFilter = () => {
  const [active, setActive] = useState<string>("NSE");
  const [view, setView] = useState<"list" | "grid">("grid");
  const handleSeg = (s: string) => {
    setActive(s);
    // onSegmentChange?.(s);
  };

  const handleView = (v: "list" | "grid") => {
    setView(v);
    // onViewChange?.(v);
  };

  return (
    <>
      <div className="max-w-[70%] mx-auto  flex flex-col md:flex-row  mt-6 mb-8 items-center justify-center gap-4 text-center">
        <div className="relative w-full">
          <Input
            placeholder="Search circular by title or number"
            className="border border-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-md pr-10 text-[16px] h-[48px]"
          />
          <Search
            size={20}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F25C4C] cursor-pointer"
          />
        </div>
        <p className="text-gray-600 font-medium">OR</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full ">
          <div className="relative w-[50%]">
            <Input
              type="text"
              placeholder="From Date"
              className="border border-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-md pr-10 text-[16px] h-[48px] appearance-none cursor-pointer"
            />
            <Calendar
              size={20}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F25C4C] cursor-pointer"
            />
          </div>

          <div className="relative w-[50%]">
            <Input
              type="text"
              placeholder="To Date"
              className="border border-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-md pr-10 text-[16px] h-[48px] appearance-none cursor-pointer"
            />
            <Calendar
              size={20}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F25C4C] cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="max-w-[70%] mx-auto">
        <div className="flex items-center justify-between rounded-xl bg-[#ebf6ff] px-3 py-2">
          {/* Left: segments */}
          <div className="flex items-center gap-2">
            {segments.map((s) => (
              <button
                key={s}
                onClick={() => handleSeg(s)}
                className={[
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                  active === s
                    ? "bg-[#02264A] text-white"
                    : "text-gray-700 hover:text-[#02264A]",
                ].join(" ")}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Right: view toggles */}
          <div className="flex items-center gap-4 text-sm">
            <button
                onClick={() => handleView("list")}
              className={[
                "flex items-center gap-2 transition-colors",
                view === "list"
                  ? "text-[#02264A]"
                  : "text-gray-500 hover:text-[#02264A]",
              ].join(" ")}
            >
              <List size={18} />
              <span>LIST</span>
            </button>

            <button
                onClick={() => handleView("grid")}
              className={[
                "flex items-center gap-2 transition-colors",
                view === "grid"
                  ? "text-[#02264A]"
                  : "text-gray-500 hover:text-[#02264A]",
              ].join(" ")}
            >
              <LayoutGrid size={18} />
              <span>GRID</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListFilter;
