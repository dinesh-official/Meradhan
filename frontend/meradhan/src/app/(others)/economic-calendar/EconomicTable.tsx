"use client";
import { EconomicData } from "@/app/api/calender/data";
import StarRating from "@/global/elements/StarRating";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import Image from "next/image";
import { useCallback } from "react";

export default function EconomicCalendarTable({
  data,
}: {
  data?: EconomicData[];
  dates?: string;
}) {
  const daysData = useCallback(() => {
    const dayObj: { [key: string]: EconomicData[] } = {};

    data?.forEach((item) => {
      const date = item.event_date;

      if (!dayObj[date]) {
        dayObj[date] = [];
      }

      dayObj[date].push(item);
    });

    return dayObj;
  }, [data]);

  const dayKeys = Object.keys(daysData());

  if (dayKeys.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500 text-lg">No events available</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-auto overflow-hidden bg-white lg:block hidden">
        {/* Header */}
        <div className="flex bg-gray-100 font-medium text-sm  rounded-md py-2.5 px-4 ">
          <div className="text-nowrap w-48">Time (IST)</div>
          <div className="w-48 items-center flex">Country</div>
          <div className="w-48 items-center flex">Imp.</div>
          <div className="w-full">Event</div>
          <div className="w-48 items-center flex">Act</div>
          <div className="w-48 items-center flex">Cons</div>
          <div className="w-48 items-center flex">Prev</div>
        </div>
        {/* Rows */}
        <div>
          {dayKeys.map((date) => (
            <>
              <div
                key={date}
                className="h-10 flex items-center justify-center w-full px-4 border-gray-100 border-b"
              >
                <p className="text-sm font-semibold text-center ">
                  {dateTimeUtils.formatDateTime(date, "DD MMM YYYY")}
                </p>
              </div>
              {daysData()[date]?.map((row, index) => (
                <div
                  key={index}
                  className="flex text-sm   border-b  border-gray-100 hover:bg-gray-50 cursor-pointer py-2.5 px-4 text-black"
                >
                  {/* Time */}
                  <div className="font-medium w-48 flex items-center">
                    {row.event_time}
                  </div>

                  {/* Country */}
                  <div className="flex gap-2 w-48 items-center">
                    <Image
                      src={`/images/country/${row.country
                        ?.toString()
                        .toLowerCase()}.svg`}
                      alt={row.country}
                      width={18}
                      height={18}
                    />
                    <span className=" ">{row.country}</span>
                  </div>
                  <div className="flex w-48 items-center">
                    <StarRating
                      value={Number(row.importance_rating)}
                      size={15}
                      max={3}
                    />
                  </div>

                  {/* Event */}
                  <div className=" flex items-center w-full">
                    {row.event_name}
                  </div>
                  <div className="flex gap-2 w-48 items-center">
                    {row.actual_val.toString() || "-"}
                  </div>
                  <div className="flex gap-2 w-48 items-center">
                    {row.forecast_val.toString() || "-"}
                  </div>
                  <div className="flex gap-2 w-48 items-center">
                    {row.previous_val.toString() || "-"}
                  </div>
                </div>
              ))}
            </>
          ))}
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden  w-full">
        {dayKeys.map((date) => (
          <>
            <div className="text-xs quicksand-bold bg-gray-100 w-full p-1.5 text-center flex justify-center items-center">
              <p>{dateTimeUtils.formatDateTime(date, "DD MMM YYYY")}</p>
            </div>
            {daysData()[date]?.map((row, index) => (
              <>
                <div
                  key={index}
                  className="border-b border-gray-100 px-4 py-3 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">
                        {row.event_time}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Image
                        src={`/images/country/${row.country
                          ?.toString()
                          .toLowerCase()}.svg`}
                        alt={row.country}
                        width={16}
                        height={18}
                      />
                      <span className="text-xs">{row.country}</span>
                    </div>

                    <StarRating
                      value={Number(row.importance_rating)}
                      size={15}
                      max={3}
                    />
                  </div>
                  <div className="mb-2">
                    <p className="text-xs font-medium">{row.event_name}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-gray-500 text-xs">Actual</p>
                      <p className="font-medium">
                        {row.actual_val.toString() || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Forecast</p>
                      <p className="font-medium">
                        {row.forecast_val.toString() || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Previous</p>
                      <p className="font-medium">
                        {row.previous_val.toString() || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ))}
          </>
        ))}
      </div>
    </>
  );
}
