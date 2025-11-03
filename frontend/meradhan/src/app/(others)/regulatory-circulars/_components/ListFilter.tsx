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
      <div className="flex md:flex-row flex-col justify-center items-center gap-4 mt-6 mb-8 text-center">
        <div className="relative w-full">
          <Input
            placeholder="Search circular by title or number"
            className="pr-10 border border-gray-300 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 h-[48px] text-[16px]"
          />
          <Search
            size={20}
            className="top-1/2 right-3 absolute text-[#F25C4C] -translate-y-1/2 cursor-pointer"
          />
        </div>
        <p className="font-medium text-gray-600">OR</p>
        <div className="flex sm:flex-row flex-col justify-center items-center gap-6 w-full">
          <div className="relative w-[50%]">
            <Input
              type="text"
              placeholder="From Date"
              className="pr-10 border border-gray-300 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 h-[48px] text-[16px] appearance-none cursor-pointer"
            />
            <Calendar
              size={20}
              className="top-1/2 right-3 absolute text-[#F25C4C] -translate-y-1/2 cursor-pointer"
            />
          </div>

          <div className="relative w-[50%]">
            <Input
              type="text"
              placeholder="To Date"
              className="pr-10 border border-gray-300 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 h-[48px] text-[16px] appearance-none cursor-pointer"
            />
            <Calendar
              size={20}
              className="top-1/2 right-3 absolute text-[#F25C4C] -translate-y-1/2 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[70%]">
        <div className="flex justify-between items-center bg-[#ebf6ff] px-3 py-2 rounded-xl">
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
                    : " hover:text-[#02264A]",
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
