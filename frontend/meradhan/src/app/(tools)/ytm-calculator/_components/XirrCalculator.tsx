"use client";
import DatePicker from "@/components/picker/DatePicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import { useMemo, useState } from "react";
import { FaPercent } from "react-icons/fa";
import { PiCurrencyInrBold } from "react-icons/pi";
import {
  formatToMMDDYYYY,
  FrequencyType,
  getBondCashflowJson,
} from "../_helpers/xirr";
import { cFrequencyMap, dayCountMap, useYtm } from "../_hooks/useYtm";
import { FlowChart } from "./FlowChart";
import FlowTable from "./FlowTable";
const couponFrequencyMap: Record<keyof typeof cFrequencyMap, FrequencyType> = {
  Annual: "annual",
  "Semi-Annual": "semi-annual",
  Quarterly: "quarterly",
  Monthly: "monthly",
};

const fallbackFlow = {
  dayDiff: 0,
  accruedInterest: 0,
  totalCost: 0,
  cashflow: [
    {
      paymentDate: new Date().toISOString().split("T")[0],
      days: 0,
      amount: 0,
      mc: false,
      type: "Investment",
      extra: false,
      interest: 0,
    },
  ],
};

const formatOffsetLabel = (offset: number) => {
  const base = new Date();
  base.setDate(base.getDate() + offset);
  return base.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const settlementOptions = () => [
  { label: "T+0 (Today)", value: 0 },
  { label: "T+1 (Tomorrow)", value: 1 },
  { label: `T+2 (${formatOffsetLabel(2)})`, value: 2 },
  { label: `T+3 (${formatOffsetLabel(3)})`, value: 3 },
];

function XirrCalculator() {
  const {
    result,
    manager: {
      faceValue,
      cleanPrice,
      annualCouponRate,
      couponFrequency,
      dayCount,
      issueDate,
      settlementDate,
      lastCouponDate,
      maturityDate,
      setFaceValue,
      setCleanPrice,
      setAnnualCouponRate,
      setCouponFrequency,
      setDayCount,
      setIssueDate,
      setSettlementDate,
      setLastCouponDate,
      setMaturityDate,
    },
  } = useYtm();

  const flowData = useMemo(() => {
    try {
      return getBondCashflowJson({
        buyDate: settlementDate.toISOString().split("T")[0],
        cleanPrice: Number(cleanPrice),
        couponRate: Number(annualCouponRate),
        faceValue: Number(faceValue),
        frequency:
          couponFrequencyMap[couponFrequency] ?? ("annual" as FrequencyType),
        lastCouponReleaseDate: formatToMMDDYYYY(
          lastCouponDate.toISOString().split("T")[0]
        ),
        maturityDate: maturityDate.toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Error calculating cash flow:", error);
      return fallbackFlow;
    }
  }, [
    settlementDate,
    cleanPrice,
    annualCouponRate,
    faceValue,
    couponFrequency,
    lastCouponDate,
    maturityDate,
  ]);

  const yieldVal = useMemo(() => {
    if (!cleanPrice) return 0;
    return (Number(faceValue) * Number(annualCouponRate)) / Number(cleanPrice);
  }, [annualCouponRate, cleanPrice, faceValue]);

  const today = useMemo(() => new Date(), []);
  const settlementChoices = useMemo(() => settlementOptions(), []);
  const [settlementTerm, setSettlementTerm] = useState<number>(0);

  const updateSettlementByOffset = (offset: number) => {
    const next = new Date(today);
    next.setDate(next.getDate() + offset);
    setSettlementDate(next);
  };

  return (
    <>
      <div className="bg-muted">
        <div className="container">
          <SectionWrapper className="gap-10 grid lg:grid-cols-3">
            <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="font-normal">Face (Par) Value</Label>
                <div className="relative">
                  <Input
                    className={`peer bg-white py-5 ps-9 border-0 font-medium text-lg     appearance-none ${
                      !faceValue ||
                      isNaN(Number(faceValue)) ||
                      (Number(faceValue) <= 0
                        ? "border-red-300 focus:border-red-500"
                        : "")
                    }`}
                    placeholder="Amount"
                    value={faceValue}
                    onChange={(e) => setFaceValue(Number(e.target.value))}
                    type="number"
                    min="0"
                    step="0.01"
                  />
                  <div className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 ps-3 pointer-events-none start-0">
                    <PiCurrencyInrBold size={16} aria-hidden="true" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="font-normal">Clean (Current) Price</Label>
                <div className="relative">
                  <Input
                    className={`peer bg-white py-5 ps-9 border-0 font-medium text-lg appearance-none ${
                      !cleanPrice ||
                      isNaN(Number(cleanPrice)) ||
                      Number(cleanPrice) <= 0
                        ? "border-red-300 focus:border-red-500"
                        : ""
                    }`}
                    placeholder="Amount"
                    value={cleanPrice}
                    onChange={(e) => setCleanPrice(Number(e.target.value))}
                    type="number"
                    min="0"
                    step="0.01"
                  />
                  <div className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 ps-3 pointer-events-none start-0">
                    <PiCurrencyInrBold size={16} aria-hidden="true" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="font-normal">Coupon Rate (%)</Label>

                <div className="relative">
                  <Input
                    className={`peer bg-white py-5 pe-12 border-0 font-medium     appearance-none ${
                      !annualCouponRate ||
                      isNaN(Number(annualCouponRate)) ||
                      Number(annualCouponRate) <= 0
                        ? "border-red-300 focus:border-red-500"
                        : ""
                    }`}
                    placeholder="Rate"
                    value={annualCouponRate}
                    onChange={(e) =>
                      setAnnualCouponRate(Number(e.target.value))
                    }
                    type="number"
                    min="0"
                    max="50"
                    step="0.01"
                  />
                  <span className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 pe-3 text-muted-foreground text-sm pointer-events-none end-0">
                    <FaPercent />
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="font-normal">Coupon Frequency</Label>

                <Select
                  value={couponFrequency}
                  onValueChange={(e) =>
                    setCouponFrequency(e as keyof typeof cFrequencyMap)
                  }
                >
                  <SelectTrigger className="bg-white py-5 border-0 w-full font-medium">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Annual">Annual</SelectItem>
                      <SelectItem value="Semi-Annual">Semi-Annual</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                <Label className="font-normal">Day Count Convention</Label>

                <Select
                  value={dayCount}
                  onValueChange={(e) =>
                    setDayCount(e as keyof typeof dayCountMap)
                  }
                >
                  <SelectTrigger className="bg-white py-5 border-0 w-full font-medium">
                    <SelectValue placeholder="Select day count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {Object.keys(dayCountMap).map((key) => (
                        <SelectItem key={key} value={key}>
                          {key}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="font-normal">Issue Date</Label>
                <DatePicker
                  className="w-full"
                  value={issueDate}
                  maxDate={today}
                  onChange={(date) => {
                    if (date) setIssueDate(date);
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="font-normal">Maturity Date</Label>
                <DatePicker
                  className="w-full"
                  value={maturityDate}
                  minDate={issueDate}
                  maxDate={new Date(2050, 11, 31)}
                  onChange={(date) => {
                    if (date) setMaturityDate(date);
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-normal">Last Coupon Date</Label>
                <DatePicker
                  className="w-full"
                  value={lastCouponDate}
                  maxDate={today}
                  onChange={(date) => {
                    if (date) setLastCouponDate(date);
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-normal">Settlement Date</Label>
                <Select
                  value={String(settlementTerm)}
                  onValueChange={(value) => {
                    const offset = Number(value);
                    setSettlementTerm(offset);
                    updateSettlementByOffset(offset);
                  }}
                >
                  <SelectTrigger className="bg-white py-5 border-0 w-full font-medium">
                    <SelectValue placeholder="Select settlement term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {settlementChoices.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={String(option.value)}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-md">
              <FlowChart
                xirrData={flowData}
                ytm={result.answer}
                yieldVal={yieldVal}
              />
            </div>
          </SectionWrapper>
        </div>
      </div>
      <SectionWrapper className="pb-5">
        <FlowTable flowData={flowData} />
      </SectionWrapper>
    </>
  );
}

export default XirrCalculator;
