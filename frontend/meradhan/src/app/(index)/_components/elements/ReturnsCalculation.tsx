"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";
import { PiCurrencyInrBold } from "react-icons/pi";
import { ReturnCalcChart } from "./ReturnCalcChart";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function ReturnsCalculation() {
  const [amount, setAmount] = useState<number>(100000);
  const [tenure, setTenure] = useState<number>(1);
  const [rate, setRate] = useState<number>(9.65);

  const { interest, total } = useMemo(() => {
    const p = Number.isFinite(amount) ? amount : 0;
    const y = Number.isFinite(tenure) ? tenure : 0;
    const r = Number.isFinite(rate) ? rate : 0;

    const interestAmt = (p * r * y) / 100;
    const totalAmt = p + interestAmt;
    return {
      interest: interestAmt,
      total: totalAmt,
    };
  }, [amount, tenure, rate]);

  const clamp = (n: number, min: number, max: number) =>
    Math.min(Math.max(n, min), max);

  const onAmountInput = (v: string) =>
    setAmount(clamp(Number(v.replace(/[^\d.]/g, "")) || 0, 0, 10_00_00_000));

  const onTenureInput = (v: string) =>
    setTenure(clamp(Number(v.replace(/[^\d.]/g, "")) || 0, 0, 40));

  const onRateInput = (v: string) =>
    setRate(clamp(Number(v.replace(/[^\d.]/g, "")) || 0, 0, 100));

  return (
    <div className="gap-10 grid lg:grid-cols-2 mt-8">
      <div className="flex flex-col gap-10">
        <div>
          <div className="flex justify-between items-center mb-4">
            <p>Investment Amount</p>
            <Input
              className="bg-white border-gray-200 w-32 md:w-60"
              value={amount}
              onChange={(e) => onAmountInput(e.target.value)}
            />
          </div>
          <div>
            <label className="range_label">
              <input
                type="range"
                name="amount_range"
                className="range-input"
                min={0}
                max={1000000}
                step={1000}
                value={amount}
                onChange={(e) => onAmountInput(e.target.value)}
              />
            </label>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-4">
            <p>Tenure</p>
            <div className="relative">
              <Input
                value={tenure}
                onChange={(e) => onTenureInput(e.target.value)}
                className="peer bg-white pe-12 border-gray-200 w-32 md:w-60"
                type="text"
              />
              <span className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 pe-3 text-sm pointer-events-none end-0">
                Year
              </span>
            </div>
          </div>
          <div>
            <label className="range_label">
              <input
                type="range"
                min={1}
                max={40}
                step={1}
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="range-input"
              />
            </label>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-4">
            <p>Return Rate</p>
            <div className="relative">
              <Input
                value={rate}
                onChange={(e) => onRateInput(e.target.value)}
                className="peer bg-white pe-12 border-gray-200 w-32 md:w-60"
                type="text"
              />
              <span className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 pe-3 text-sm pointer-events-none end-0">
                %
              </span>
            </div>
          </div>
          <div>
            <label className="range_label">
              <input
                type="range"
                min={0}
                max={30}
                step={0.05}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="range-input"
              />
            </label>
          </div>
        </div>
      </div>
      <Card className="border-0">
        <CardContent>
          <div className="gap-5 grid md:grid-cols-2">
            <div className="flex flex-col gap-6">
              <h1 className="flex items-center text-3xl">
                <PiCurrencyInrBold />{" "}
                {inr.format(total).replace("₹", "").trim()}
              </h1>
              <p className="text-lg">
                you will get after {tenure} {tenure === 1 ? "year" : "years"}
              </p>
              <div className="flex flex-col gap-1">
                <Label className="font-normal text-gray-600">
                  Investment Amount
                </Label>
                <p className="flex items-center text-lg">
                  <PiCurrencyInrBold />
                  {inr.format(amount).replace("₹", "").trim()}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="font-normal text-gray-600">
                  Interest Amount
                </Label>
                <p className="flex items-center text-lg">
                  <PiCurrencyInrBold />{" "}
                  {inr.format(interest).replace("₹", "").trim()}
                </p>
              </div>
            </div>
            <div>
              <ReturnCalcChart amount={amount} interest={interest} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ReturnsCalculation;
