"use client";
import { EconomicDataConnectionRoot } from "@/app/api/calender/data";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import StarRating from "@/global/elements/StarRating";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { CalendarRangeIcon, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import { BiTrash } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import EconomicCalendarTable from "./EconomicTable";
import { useEconomicState } from "./useEconomicState";

const tabs = [
  {
    label: "Yesterday",
    value: "YESTERDAY",
    range: () => [
      {
        startDate: new Date(new Date().setDate(new Date().getDate() - 1)),
        endDate: new Date(new Date().setDate(new Date().getDate() - 1)),
        key: "selection",
      },
    ],
  },
  {
    label: "Today",
    value: "TODAY",
    range: () => [
      {
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
      },
    ],
  },
  {
    label: "Tomorrow",
    value: "TOMORROW",
    range: () => [
      {
        startDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        key: "selection",
      },
    ],
  },
  {
    label: "This Week",
    value: "THIS_WEEK",
    range: () => {
      const now = new Date();
      const day = now.getDay(); // 0 (Sun) - 6 (Sat)
      const diffToMonday = (day === 0 ? -6 : 1) - day;
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() + diffToMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return [
        {
          startDate: startOfWeek,
          endDate: endOfWeek,
          key: "selection",
        },
      ];
    },
  },
  {
    label: "Next Week",
    value: "NEXT_WEEK",
    range: () => {
      const now = new Date();
      const day = now.getDay(); // 0 (Sun) - 6 (Sat)
      const diffToNextMonday = (day === 0 ? 1 : 8) - day;

      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + diffToNextMonday);
      nextMonday.setHours(0, 0, 0, 0);

      const nextSunday = new Date(nextMonday);
      nextSunday.setDate(nextMonday.getDate() + 6);
      nextSunday.setHours(23, 59, 59, 999);

      return [
        {
          startDate: nextMonday,
          endDate: nextSunday,
          key: "selection",
        },
      ];
    },
  },
  {
    label: "This Month",
    value: "THIS_MONTH",
    range: () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      return [
        {
          startDate: startOfMonth,
          endDate: endOfMonth,
          key: "selection",
        },
      ];
    },
  },
];

function EconomicCalender({
  categoryList,
  countryList,
}: {
  countryList?: string[];
  categoryList?: string[];
}) {
  const [showDate, setShowDate] = useState(false);
  const {
    dateRange,
    setDateRange,
    dateTab,
    setDateTab,
    country,
    category,
    importance,
    resetFilter,
    setCategory,
    setCountry,
    setImportance,
    setShowFilter,
    showFilter,
  } = useEconomicState();

  // Store refs for each tab
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleTabClick = (value: string) => {
    setDateTab(value);
    const selectedTab = tabs.find((tab) => tab.value === value);
    if (selectedTab) {
      setDateRange(selectedTab.range());
    }

    // Auto scroll selected tab into view
    const el = tabRefs.current[tabs.findIndex((tab) => tab.value === value)];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  const startDate = dateRange[0]!.startDate!.toISOString().split("T")[0];
  const endDate = dateRange[0]!.endDate!.toISOString().split("T")[0];

  const generateFilter = () => {
    const filter = [
      {
        category:
          category.length == 0
            ? undefined
            : {
                in: category,
              },
        country:
          country.length == 0
            ? undefined
            : {
                in: country,
              },
        importance_rating:
          importance.length == 0
            ? undefined
            : {
                in: importance,
              },
      },
    ];
    return filter;
  };

  const querydata = useMutation({
    mutationKey: ["economicDataSds", dateRange],
    mutationFn: async ({ from, to }: { from: string; to: string }) => {
      const res = await axios.post("/api/calender", {
        event_date: {
          between: [from, to],
        },
        and: generateFilter(),
      });
      return res.data as EconomicDataConnectionRoot;
    },
    onSuccess: (data) => {
      console.log("Economic Data:", data);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  useEffect(() => {
    querydata.mutate({ from: startDate, to: endDate });
  }, [dateRange, category, country, importance]);

  const renderData = () => {
    return (
      <DateRange
        editableDateInputs={false}
        showPreview={false}
        showDateDisplay={false}
        moveRangeOnFirstSelection={false}
        ranges={dateRange}
        onChange={(item) => {
          // add / +1 day
          const startDate = new Date(item.selection.startDate!);
          startDate.setHours(23, 59, 59, 999);

          const endDate = new Date(item.selection.endDate!);
          endDate.setHours(23, 59, 59, 999);

          setDateRange([
            {
              startDate,
              endDate,
              key: "selection",
            },
          ]);
        }}
      />
    );
  };

  return (
    <SectionWrapper className="relative">
      <h1 className="xl:text-[44px] lg:text-4xl text-2xl mb-2 quicksand-medium title">
        Economic <span className="font-semibold">Calendar</span>
      </h1>
      <p className="text-sm">
        Stay updated with key global economic events, interest rate decisions,
        and bond auctions.
      </p>

      <div className="w-full md:h-10 h-8 bg-muted mt-5 rounded-[10px] select-none flex items-center overflow-x-auto scrollbar-hide">
        <div className="w-full h-full flex items-center ">
          {tabs.map((tab, index) => (
            <div
              key={index}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ref={(el) => (tabRefs.current[index] = el) as any}
              className={`md:px-5 px-3 h-full flex justify-center items-center text-nowrap font-medium md:text-sm text-xs rounded-[10px] cursor-pointer select-none ${
                dateTab === tab.value
                  ? "bg-primary text-white"
                  : "text-muted-foreground"
              }`}
              onClick={() => handleTabClick(tab.value)}
            >
              {tab.label}
            </div>
          ))}
        </div>

        <div
          onClick={() => setShowFilter(!showFilter)}
          className={cn(
            "lg:flex hidden items-center gap-2 px-5 border-l border-muted h-full text-sm text-muted-foreground cursor-pointer font-medium",
            showFilter ? " text-red-500" : ""
          )}
        >
          {showFilter ? <X size={15} color="red" /> : <FaFilter />}
          <span>Filters</span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 lg:hidden">
        <div
          onClick={() => {
            setShowFilter(!showFilter);
            setShowDate(false);
          }}
          className="flex border items-center gap-2 px-3 py-1.5 rounded-md border-l border-muted h-full text-xs text-muted-foreground cursor-pointer font-medium"
        >
          <FaFilter />
          <span>Filters</span>
        </div>

        <div
          onClick={() => {
            setShowDate(!showDate);
            setShowFilter(false);
          }}
          className="flex border items-center gap-2 px-3 py-1.5 rounded-md border-l border-muted h-full text-xs text-muted-foreground cursor-pointer font-medium"
        >
          {!showDate ? (
            <CalendarRangeIcon size={17} />
          ) : (
            <X size={17} color="red" />
          )}
        </div>
      </div>

      {showFilter && (
        <div className="bg-muted p-5 rounded-md mt-5">
          <p className="text-sm text-black font-semibold">Categories:</p>
          <div className="flex flex-wrap gap-3 mt-3">
            {categoryList?.map((cat, index) => (
              <label
                key={index}
                className="text-sm gap-2 flex items-center cursor-pointer  bg-muted"
                onClick={() => {
                  setCategory(cat);
                }}
              >
                <Checkbox
                  className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary bg-white"
                  checked={category.includes(cat)}
                />{" "}
                <span
                  onClick={() => {
                    setCategory(cat);
                  }}
                >
                  {cat}
                </span>
              </label>
            ))}
          </div>
          <p className="text-sm text-black font-semibold mt-5">Country:</p>
          <div className="flex flex-wrap gap-3 mt-3">
            {countryList?.map((ct, index) => (
              <label
                key={index}
                className="text-sm gap-2 flex items-center cursor-pointer  bg-muted"
                onClick={() => {
                  setCountry(ct);
                }}
              >
                <Checkbox
                  className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary bg-white"
                  checked={country.includes(ct)}
                />{" "}
                <span
                  onClick={() => {
                    setCountry(ct);
                  }}
                >
                  {ct}
                </span>
              </label>
            ))}
          </div>
          <p className="text-sm text-black font-semibold mt-5">Importance:</p>
          <div className="flex flex-wrap gap-3 mt-3">
            {[2, 3].map((imp, index) => (
              <label
                key={index}
                className="text-sm gap-2 flex items-center cursor-pointer bg-muted"
                onClick={() => {
                  setImportance(imp.toString());
                }}
              >
                <Checkbox
                  className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary bg-white"
                  checked={importance?.includes(imp.toString())}
                />{" "}
                <StarRating
                  value={imp}
                  size={15}
                  max={3}
                  onClick={() => {
                    setImportance(imp.toString());
                  }}
                />
              </label>
            ))}
          </div>
          {category.length > 0 ||
          country.length > 0 ||
          importance.length > 0 ? (
            <Button className="mt-5" size={`sm`} onClick={() => resetFilter()}>
              <BiTrash /> Reset Filter
            </Button>
          ) : null}
        </div>
      )}
      {showDate && <div className="mt-3">{renderData()}</div>}
      <div className="flex items-start gap-5 mt-8 relative w-full ">
        <div className="lg:w-[calc(100%-370px)] w-full ">
          {querydata.isPending || !querydata.data ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="animated animate-spin text-primary" />
            </div>
          ) : (
            <EconomicCalendarTable
              data={querydata.data?.economicCalendars_connection?.nodes}
            />
          )}
        </div>
        <div className=" lg:block hidden shrink-0">{renderData()}</div>
      </div>
    </SectionWrapper>
  );
}

export default EconomicCalender;
