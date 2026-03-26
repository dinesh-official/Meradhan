"use client";
import React, { useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";

function SearchDateFilter({
  category,
  pageNo,
  qfrom,
  qto,
  qsearch,
  onChenge,
  onDateChenge,
}: {
  category: string;
  pageNo: number;
  qfrom?: string;
  qto?: string;
  qsearch?: string;
  onChenge?: (val: string) => void;
  onDateChenge?: (from: string, to: string) => void;
}) {
  const [search, setSearch] = React.useState(qsearch || "");
  const [fromDate, setFromDate] = React.useState<Date | null>(
    qfrom ? new Date(qfrom) : null
  );
  const [toDate, setToDate] = React.useState<Date | null>(
    qto ? new Date(qto) : null
  );

  useEffect(() => {
    onDateChenge &&
      onDateChenge(
        fromDate?.toISOString().split("T")[0] || "",
        toDate?.toISOString().split("T")[0] || ""
      );
  }, [fromDate, toDate]);

  const onSubmit = () => {
    const params = new URLSearchParams();

    if (search.trim()) params.set("search", search.trim());
    if (fromDate) params.set("from", fromDate.toISOString().split("T")[0]);
    if (toDate) params.set("to", toDate.toISOString().split("T")[0]);

    const queryString = params.toString();
    const finalQuery = queryString ? `?${queryString}` : "";

    let slug: string = "/regulatory-circulars/";
    slug = category === "all" ? "/regulatory-circulars" : slug + category;

    if (pageNo > 1) slug = slug + "/" + 1;
    if (finalQuery) slug = slug + finalQuery;

    window.location.href = slug;
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onChenge && onChenge(search);
  };

  const fromDateRef = React.useRef<DatePicker>(null);
  const toDateRef = React.useRef<DatePicker>(null);

  return (
    <div className="my-4 relative">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-3 w-full">
        {/* Search Input */}
        <div className="w-full">
          <form id="search_form" className="w-full" onSubmit={handleSearch}>
            <input
              type="text"
              name="search"
              placeholder="Search circular by title or number"
              className="form-input w-full rounded-md pr-12 px-4 h-10 border border-gray-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSubmit();
                }
              }}
              autoComplete="off"
            />

            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 flex items-center justify-center text-gray-600"
              onClick={(e) => {
                e.preventDefault();
                if (qsearch?.length != 0 || search.length != 0) {
                  window.location.href = "/regulatory-circulars";
                }
              }}
            >
              {search.length == 0 ? (
                <i className="fas fa-search text-lg" />
              ) : (
                <i className="fas fa-xmark text-lg" />
              )}
            </button>
          </form>
        </div>

        {/* OR Divider */}
        <div className="flex items-center justify-center  text-center">
          <span className="text-gray-600 font-medium ">OR</span>
        </div>

        {/* Date Range */}
        <div className="flex flex-row items-end justify-end gap-2 w-full">
          {/* From Date */}
          <div className="relative w-full">
            <DatePicker
              ref={fromDateRef}
              selected={fromDate ? new Date(fromDate) : null}
              onChange={(date) => {
                setFromDate(date ? new Date(date.setHours(12, 0, 0, 0)) : null);
                // search if fromDate is after toDate, reset
              }}
              dateFormat="yyyy-MM-dd"
              placeholderText="From Date"
              className="form-input w-full rounded-md border border-gray-300 h-10 pr-10 "
              icon={
                <FaCalendarAlt
                  onClick={() => fromDateRef.current?.toggleCalendar()}
                  size={16}
                  className="text-secondary absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                />
              }
              showIcon={true}
            />
          </div>

          {/* To Date */}
          <div className="relative w-full">
            <DatePicker
              ref={toDateRef}
              selected={toDate ? new Date(toDate) : null}
              onChange={(date) =>
                setToDate(
                  date ? new Date(date.setHours(12, 59, 59, 999)) : null
                )
              }
              dateFormat="yyyy-MM-dd"
              placeholderText="To Date"
              className="form-input w-full rounded-md border border-gray-300 h-10 pr-10 "
              icon={
                <FaCalendarAlt
                  onClick={() => toDateRef.current?.toggleCalendar()}
                  size={16}
                  className="text-secondary absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                />
              }
              showIcon={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchDateFilter;
