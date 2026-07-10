"use client";



import { useState, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import {

  BarChart,

  Bar,

  XAxis,

  YAxis,

  CartesianGrid,

  Tooltip,

  ResponsiveContainer,

  LabelList,

} from "recharts";

import ChartCard from "./ChartCard";

import { PortfolioCashflowChartShimmerBody } from "./PortfolioTabShimmers";

import apiGateway from "@root/apiGateway";

import { apiClientCaller } from "@/core/connection/apiClientCaller";



type CfRow = { month: string; Principal: number; Interest: number };



export default function CashflowChartCard() {

  const [timePeriod, setTimePeriod] =

    useState<"1yr" | "2yrs" | "5yrs">("1yr");



  const portfolioApi = useMemo(

    () => new apiGateway.meradhan.customerPortfolioApi(apiClientCaller),

    []

  );



  const { data: response, isLoading, isError } = useQuery({

    queryKey: ["cashflow-to-maturity"],

    queryFn: async () => portfolioApi.getCashflowToMaturity(),

  });



  const apiSeries = response?.responseData?.[timePeriod];

  const hasApiPoints =

    Array.isArray(apiSeries) && apiSeries.length > 0;

  const chartData: CfRow[] = hasApiPoints

    ? (apiSeries as CfRow[])

    : [];



  const chartWidth = Math.max(chartData.length * 140, 800);

  const maxValue =

    chartData.length > 0

      ? Math.max(

          ...chartData.map((d) => Math.max(d.Principal, d.Interest))

        )

      : 0;



  const roundedMax = Math.max(50, Math.ceil(maxValue / 50) * 50);



  const ticks = Array.from({ length: 5 }, (_, i) =>

    Math.round((roundedMax / 4) * i),

  );

  return (

    <ChartCard title="Cashflow to Maturity / Call">



      <div className="flex justify-end mb-4">

        <div className="flex bg-gray-100 rounded-md p-1">

          {(["1yr", "2yrs", "5yrs"] as const).map((period) => (

            <button

              key={period}

              onClick={() => setTimePeriod(period)}

              className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${timePeriod === period

                ? "bg-gray-700 text-white"

                : "text-gray-600 hover:bg-gray-200"

                }`}

            >

              {period === "1yr"

                ? "1 yr"

                : period === "2yrs"

                  ? "2 yrs"

                  : "5 yrs"}

            </button>

          ))}

        </div>

      </div>



      {isLoading ? (

        <PortfolioCashflowChartShimmerBody showPeriodStrip={false} />

      ) : isError ? (

        <div className="h-[320px] flex items-center justify-center text-sm text-red-700">

          Could not load cashflow data. Please try again later.

        </div>

      ) : !hasApiPoints ? (

        <div className="h-[320px] flex flex-col items-center justify-center gap-2 px-6 text-center text-sm text-neutral-600">

          <p className="font-medium text-neutral-800">

            No projected cashflows in this range

          </p>

          <p>

            Either you have no open bond positions yet, holdings are fully

            matured, or we need allotment / maturity / coupon dates in bond

            data to build your schedule.

          </p>

        </div>

      ) : (

        <>

          <div className="flex w-full min-w-0">



            <div className="w-[70px] h-[320px] shrink-0 cashflow-chart-container-left">

              <ResponsiveContainer width="100%" height="100%">

                <BarChart data={chartData}>

                  <YAxis

                   domain={[0, roundedMax]}

                    ticks={ticks}

                    width={60}

                    tick={{ fontSize: 12 }}

                    axisLine={false}

                    tickLine={false}

                    label={{

                      value: "Amount",

                      angle: -90,

                      position: "insideLeft",

                      style: { fontSize: 12 },

                    }}

                  />

                </BarChart>

              </ResponsiveContainer>

            </div>



            <div className="flex-1 min-w-0 overflow-x-auto w-full max-w-full sm:max-w-[1200px] cashflow-chart-container">

              <div style={{ width: chartWidth, height: 320 }}>

                <ResponsiveContainer width="100%" height="100%">

                  <BarChart data={chartData} barCategoryGap="28%">

                    <CartesianGrid

                      vertical={false}

                      stroke="#e5e7eb"

                      strokeDasharray="4 4"

                    />



                    <XAxis

                      dataKey="month"

                      tick={{ fontSize: 12 }}

                      axisLine={false}

                      tickLine={false}

                    />



                    <YAxis hide domain={[0, roundedMax]} ticks={ticks} />



                    <Tooltip

                      formatter={(value: number) =>

                        `₹ ${value.toFixed(2)}`

                      }

                    />



                    <Bar

                      dataKey="Principal"

                      fill="#ff4560"

                      barSize={26}

                      radius={[6, 6, 0, 0]}

                    >

                      <LabelList dataKey="Principal" position="top" />

                    </Bar>



                    <Bar

                      dataKey="Interest"

                      fill="#00E396"

                      barSize={26}

                      radius={[6, 6, 0, 0]}

                    >

                      <LabelList dataKey="Interest" position="top" />

                    </Bar>

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </div>

          </div>



          <div className="flex justify-center gap-6 mt-4 text-sm font-medium">

            <div className="flex items-center gap-2">

              <span className="w-3 h-3 rounded-full bg-[#ff4560]"></span>

              Principal

            </div>



            <div className="flex items-center gap-2">

              <span className="w-3 h-3 rounded-full bg-[#00E396]"></span>

              Interest

            </div>

          </div>

        </>

      )}

    </ChartCard>

  );

}

