"use client";

import React, { useMemo, useState } from "react";
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip } from "recharts";

type Freq = "Monthly" | "Quarterly" | "Half-yearly" | "Yearly";

const FREQ_MAP: Record<Freq, number> = {
  Monthly: 12,
  Quarterly: 4,
  "Half-yearly": 2,
  Yearly: 1,
};

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);

export default function ReturnsCalculator() {
  const [amount, setAmount] = useState<number>(100000);
  const [tenure, setTenure] = useState<number>(10);
  const [rate, setRate] = useState<number>(9.65);
  const [freq, setFreq] = useState<Freq>("Monthly");

  const interest = useMemo(
    () => amount * (rate / 100) * tenure,
    [amount, rate, tenure]
  );
  const total = amount + interest;
  const periods = FREQ_MAP[freq];
  const periodicInterest = interest / (tenure * periods);

  const chartData = [
    { name: "Total Investment", value: amount },
    { name: "Total Interest", value: interest },
  ];
  const COLORS = ["#BFD7EA", "#9DB7D1"];

  return (
    <section className="w-full bg-[#FFF1EE]">
      {/* heading */}
      <div className="max-w-[1200px] mx-auto px-4 pt-10">
        <h2 className="text-center text-[32px] md:text-[36px] leading-tight mb-6">
          <span className="text-[#F25C4C] font-semibold">Returns</span>{" "}
          <span className="text-[#02264A] font-medium">Calculation</span>
        </h2>
      </div>

      {/* content */}
      <div className="max-w-[70%] mx-auto px-4 pb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="pt-2 ">
          {/* Investment Amount */}
          <div className="mb-10">
            <label className="block text-[15px] text-[#222] mb-2">
              Investment Amount
            </label>
            <div className="w-full max-w-[520px]">
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) =>
                  setAmount(() =>
                    Math.max(
                      1000,
                      Math.min(
                        100000000,
                        Number(e.target.value.replace(/\D/g, "")) || 0
                      )
                    )
                  )
                }
                className="w-[320px] md:w-[360px] rounded-md border border-[#E5E7EB] px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-[#F25C4C] bg-white"
              />
              <div className="mt-5 flex items-center gap-3">
                <input
                  type="range"
                  min={1000}
                  max={10000000}
                  step={1000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="range-track"
                />
              </div>
            </div>
          </div>

          <div className="mb-10">
            <label className="block text-[15px] text-[#222] mb-2">Tenure</label>
            <div className="w-full max-w-[520px]">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={tenure}
                  onChange={(e) =>
                    setTenure(() =>
                      Math.max(1, Math.min(40, Number(e.target.value) || 0))
                    )
                  }
                  className="w-[120px] rounded-md border border-[#E5E7EB] px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-[#F25C4C] bg-white"
                />
                <span className="text-sm text-gray-600">Year</span>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={40}
                  step={1}
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="range-track"
                />
              </div>
            </div>
          </div>

          {/* Return Rate */}
          <div className="mb-10">
            <label className="block text-[15px] text-[#222] mb-2">
              Return Rate
            </label>
            <div className="w-full max-w-[520px]">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  max={30}
                  value={rate}
                  onChange={(e) =>
                    setRate(() =>
                      Math.max(0, Math.min(30, Number(e.target.value) || 0))
                    )
                  }
                  className="w-[120px] rounded-md border border-[#E5E7EB] px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-[#F25C4C] bg-white"
                />
                <span className="text-sm text-gray-600">%</span>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={30}
                  step={0.05}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="range-track"
                />
              </div>
            </div>
          </div>

          {/* Interest Frequency */}
          <div className="mb-4">
            <label className="block text-[15px] text-[#222] mb-2">
              Interest Frequency
            </label>
            <select
              value={freq}
              onChange={(e) => setFreq(e.target.value as Freq)}
              className="w-[180px] rounded-md border border-[#E5E7EB] px-4 py-2 text-gray-900 bg-white outline-none focus:ring-2 focus:ring-[#F25C4C]"
            >
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Half-yearly</option>
              <option>Yearly</option>
            </select>
          </div>
        </div>

        {/* RIGHT – summary card + chart */}
        <div className="bg-white rounded-xl shadow-sm border border-[#F1F1F1] p-6 md:p-7">
          <div className="flex flex-col md:flex-row gap-6 ">
            <div className="flex-1">
              <div className="text-[28px] md:text-[30px] font-semibold text-[#E94E2E]">
                {formatINR(total)}
              </div>
              <p className="text-gray-600 mt-1">
                you will get after {tenure} {tenure === 1 ? "year" : "years"}
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <div className="text-sm text-gray-500">Investment Amount</div>
                  <div className="font-medium">{formatINR(amount)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Interest Amount</div>
                  <div className="font-medium">{formatINR(interest)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Monthly Interest</div>
                  <div className="font-medium">
                    {formatINR(periodicInterest)}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded bg-[#BFD7EA]" />
                  <span className="text-gray-600">Total Investment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded bg-[#9DB7D1]" />
                  <span className="text-gray-600">Total Interest</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-[300px] h-[240px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={1}
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatINR(Number(v))} />
                  {/* Using our custom legend above to match the mock */}
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* slider cosmetics to exactly match the square, orange-bordered knob */}
      <style jsx>{`
        .range-track {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 9999px;
          outline: none;
          background: linear-gradient(
            to right,
            #e94e2e var(--range-progress, 0%),
            #ffffff var(--range-progress, 0%)
          );
          transition: background 0.1s ease;
        }

        /* thumb style (orange square outline) */
        .range-track::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 22px;
          width: 22px;
          background: #fff;
          border: 3px solid #e94e2e;
          border-radius: 6px;
          cursor: pointer;
          margin-top: -8px; /* center thumb */
        }
        .range-track::-moz-range-thumb {
          height: 22px;
          width: 22px;
          background: #fff;
          border: 3px solid #e94e2e;
          border-radius: 6px;
          cursor: pointer;
        }

        /* hide default focus halo */
        .range-track:focus {
          outline: none;
        }

        .slider-square {
          height: 22px;
          width: 22px;
          border: 3px solid #e94e2e;
          background: #fff;
          border-radius: 6px;
          flex: 0 0 auto;
        }
      `}</style>
    </section>
  );
}
