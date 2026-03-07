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
import { cn } from "@/lib/utils";
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

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const settlementOptions = (base: Date) => {
  const options: { label: string; value: number; date: Date }[] = [];
  let businessOffset = 0;

  for (
    let cursor = new Date(base);
    options.length < 4;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    const day = cursor.getDay();
    const isWeekend = day === 0 || day === 6;
    if (!isWeekend) {
      options.push({
        label: `${formatDateLabel(cursor)} (T+${businessOffset})`,
        value: businessOffset,
        date: new Date(cursor),
      });
      businessOffset += 1;
    }
  }

  return options;
};

function XirrCalculator({
  showFlowChart = false,
  showTitle = false,
  showChart = false,
}: {
  showFlowChart?: boolean;
  showTitle?: boolean;
  showChart?: boolean;
}) {
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
  const settlementChoices = useMemo(() => settlementOptions(today), [today]);
  const [settlementTerm, setSettlementTerm] = useState<number>(
    settlementChoices[0]?.value ?? 0
  );

  const updateSettlementByOffset = (offset: number) => {
    const choice = settlementChoices.find((option) => option.value === offset);
    if (choice) {
      setSettlementDate(choice.date);
    }
  };

  return (
    <>
      <div className="bg-muted">
        <div className="container">
          {showTitle && (
            <h2 className="text-4xl font-bold pt-10 text-center quicksand-medium">
              <span className="text-secondary">YTM</span> Calculator
            </h2>
          )}

          <SectionWrapper className="md:gap-10 gap-5 grid lg:grid-cols-3">
            <div
              className={cn(
                "gap-6 grid grid-cols-2",
                showChart ? "lg:col-span-1" : "lg:col-span-2"
              )}
            >
              <div className="flex flex-col gap-2 ">
                <Label className="font-normal">Face (Par) Value</Label>
                <div className="relative">
                  <Input
                    className={` bg-white py-5 ps-9 border-0 font-medium  text-[1rem]  appearance-none ${!faceValue ||
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

              <div className="flex flex-col gap-2 ">
                <Label className="font-normal">Clean (Current) Price</Label>
                <div className="relative">
                  <Input
                    className={` bg-white py-5 ps-9 border-0 font-medium text-[1rem] appearance-none ${!cleanPrice ||
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

              <div className="flex flex-col gap-2 ">
                <Label className="font-normal">Coupon Rate (%)</Label>

                <div className="relative">
                  <Input
                    className={` bg-white py-5 pe-12 border-0 font-medium text-[1rem]  appearance-none ${!annualCouponRate ||
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
                  <SelectTrigger className="bg-white py-5 border-0 w-full font-medium text-[1rem]">
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

              <div className="flex flex-col gap-2 col-span-2">
                <Label className="font-normal">Day Count Convention</Label>

                <Select
                  value={dayCount}
                  onValueChange={(e) =>
                    setDayCount(e as keyof typeof dayCountMap)
                  }
                >
                  <SelectTrigger className="bg-white py-5 border-0 w-full font-medium text-[1rem]">
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
                  inputClassName="font-medium"
                  maxDate={today} // today
                  minDate={
                    new Date(
                      today.getFullYear() - 15,
                      today.getMonth(),
                      today.getDate()
                    )
                  } // last 15 years
                  onChange={(date) => {
                    if (date) setIssueDate(date);
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="font-normal">Maturity Date</Label>
                <DatePicker
                  className="w-full "
                  value={maturityDate}
                  inputClassName="font-medium"
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
                  inputClassName="font-medium"
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
                  <SelectTrigger className="bg-white py-5 border-0 w-full font-medium text-[1rem]">
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
            {showChart ? (
              <div className="lg:col-span-2 bg-white rounded-md">
                <FlowChart
                  xirrData={flowData}
                  ytm={result.approximateYtm}
                  yieldVal={yieldVal}
                />
              </div>
            ) : (
              <div className=" bg-white rounded-md p-5 py-10 flex justify-center items-center flex-col">
                <h3 className="md:text-4xl text-3xl text-center">
                  YTM:{" "}
                  {isNaN(Number(result.approximateYtm)) ? (
                    <span className="text-red-600">CHECK INPUTS</span>
                  ) : (
                    <span
                      className={cn("font-semibold", {
                        "text-green-600": Number(result.approximateYtm) > 0,
                        "text-red-600": Number(result.approximateYtm) < 0,
                      })}
                    >
                      {result.approximateYtm?.toFixed(4)}%
                    </span>
                  )}
                </h3>
              </div>
            )}
          </SectionWrapper>
        </div>
      </div>
      {/* <p className="text-xl font-bold text-muted-foreground text-center">
        {(getXirr(prepareXirrValues(flowData.cashflow)) * 100).toFixed(4)}%
      </p> */}
      {showFlowChart && (
        <SectionWrapper className="pb-5">
          <FlowTable cashflow={result.cashflow} />
        </SectionWrapper>
      )}
    </>
  );
}

export default XirrCalculator;
