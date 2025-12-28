"use client";
import { DatePicker } from "@/components/custom/DatePicker";
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
import { FaPercent } from "react-icons/fa";
import { PiCurrencyInrBold } from "react-icons/pi";
import { CouponFrequency, DayCountConvention } from "../_helpers/ytm";
import { useYtm } from "../_hooks/useYtm";
import { FlowChart } from "./FlowChart";
import FlowTable from "./FlowTable";

// Helper functions to convert between date formats
// DatePicker value prop expects DD/MM/YYYY format
// DatePicker onChange returns YYYY-MM-DD format
const formatToDatePicker = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatFromDatePicker = (dateString: string): string => {
  if (!dateString) return "";
  // DatePicker onChange already returns YYYY-MM-DD format
  return dateString;
};

function XirrCalculator() {
  const {
    cleanPrice,
    couponFrequency,
    couponRate,
    faceValue,
    ytmResult,
    issueDate,
    lastCouponDate,
    maturityDate,

    settlementDate,
    dayCountConvention,
    setCleanPrice,
    setCouponFrequency,
    setCouponRate,
    setFaceValue,
    setIssueDate,
    setLastCouponDate,
    setMaturityDate,
    setSettlementDate,
    setDayCountConvention,
    validationErrors,
  } = useYtm();

  return (
    <>
      <div className="bg-muted">
        <div className="container">
          <SectionWrapper className="gap-10 grid lg:grid-cols-3">
            <div className="gap-6 grid grid-cols-2">
              {/* Face Value */}
              <div className="flex flex-col gap-2">
                <Label className="font-normal">Face Value</Label>
                <div className="relative">
                  <Input
                    className={`peer bg-white py-5 ps-9 border-0 font-medium text-lg appearance-none ${!faceValue ||
                      isNaN(parseFloat(faceValue)) ||
                      parseFloat(faceValue) <= 0
                      ? "border-red-300 focus:border-red-500"
                      : ""
                      }`}
                    placeholder="Amount"
                    value={faceValue}
                    onChange={(e) => setFaceValue(e.target.value)}
                    type="number"
                    min="0"
                    step="0.01"
                  />
                  <div className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 ps-3 pointer-events-none start-0">
                    <PiCurrencyInrBold size={16} aria-hidden="true" />
                  </div>
                </div>
              </div>

              {/* Clean Price */}
              <div className="flex flex-col gap-2">
                <Label className="font-normal">Clean Price</Label>
                <div className="relative">
                  <Input
                    className={`peer bg-white py-5 ps-9 border-0 font-medium text-lg appearance-none ${!cleanPrice ||
                      isNaN(parseFloat(cleanPrice)) ||
                      parseFloat(cleanPrice) <= 0
                      ? "border-red-300 focus:border-red-500"
                      : ""
                      }`}
                    placeholder="Amount"
                    value={cleanPrice}
                    onChange={(e) => setCleanPrice(e.target.value)}
                    type="number"
                    min="0"
                    step="0.01"
                  />
                  <div className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 ps-3 pointer-events-none start-0">
                    <PiCurrencyInrBold size={16} aria-hidden="true" />
                  </div>
                </div>
              </div>

              {/* Coupon Rate */}
              <div className="flex flex-col gap-2">
                <Label className="font-normal">Annual Coupon Rate (%)</Label>
                <div className="relative">
                  <Input
                    className={`peer bg-white py-5 pe-12 border-0 font-medium appearance-none ${!couponRate ||
                      isNaN(parseFloat(couponRate)) ||
                      parseFloat(couponRate) < 0
                      ? "border-red-300 focus:border-red-500"
                      : ""
                      }`}
                    placeholder="Rate"
                    value={couponRate}
                    onChange={(e) => setCouponRate(e.target.value)}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                  <span className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 pe-3 text-muted-foreground text-sm pointer-events-none end-0">
                    <FaPercent />
                  </span>
                </div>
              </div>

              {/* Coupon Frequency */}
              <div className="flex flex-col gap-2">
                <Label className="font-normal">Coupon Frequency</Label>
                <Select
                  value={couponFrequency}
                  onValueChange={(e) =>
                    setCouponFrequency(e as CouponFrequency)
                  }
                >
                  <SelectTrigger className="bg-white py-5 border-0 w-full font-medium">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="ANNUAL">Annual</SelectItem>
                      <SelectItem value="SEMI_ANNUAL">Semi-Annual</SelectItem>
                      <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="AT_MATURITY">At Maturity</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Day Count Convention */}
              <div className="flex flex-col gap-2 col-span-2">
                <Label className="font-normal">Day Count Convention</Label>
                <Select
                  value={dayCountConvention}
                  onValueChange={(e) =>
                    setDayCountConvention(e as DayCountConvention)
                  }
                >
                  <SelectTrigger className="bg-white py-5 border-0 w-full font-medium">
                    <SelectValue placeholder="Select convention" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="ACT_ACTUAL">
                        Actual/Actual
                      </SelectItem>
                      <SelectItem value="THIRTY_360">30/360 (US)</SelectItem>
                      <SelectItem value="ACT_360">Actual/360</SelectItem>
                      <SelectItem value="ACT_365F">
                        Actual/365 (Fixed)
                      </SelectItem>
                      <SelectItem value="THIRTY_360_EU">30E/360 (EU)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Issue Date */}
              <div className="flex flex-col gap-2 col-span-2">
                <Label className="font-normal">Issue Date</Label>
                <DatePicker
                  toYear={2050}
                  className="bg-white py-5 border-none font-medium"
                  value={formatToDatePicker(issueDate)}
                  onChange={(e) =>
                    setIssueDate(formatFromDatePicker(e.target.value))
                  }
                />
              </div>

              {/* Settlement Date */}
              <div className="flex flex-col gap-2 col-span-2">
                <Label className="font-normal">Settlement Date</Label>
                <DatePicker
                  toYear={2050}
                  className="bg-white py-5 border-none font-medium"
                  value={formatToDatePicker(settlementDate)}
                  onChange={(e) =>
                    setSettlementDate(formatFromDatePicker(e.target.value))
                  }
                />
              </div>

              {/* Maturity Date */}
              <div className="flex flex-col gap-2 col-span-2">
                <Label className="font-normal">Maturity Date</Label>
                <DatePicker
                  toYear={2050}
                  className="bg-white py-5 border-none font-medium"
                  value={formatToDatePicker(maturityDate)}
                  onChange={(e) =>
                    setMaturityDate(formatFromDatePicker(e.target.value))
                  }
                />
              </div>

              {/* Last Coupon Date */}
              {couponFrequency !== "AT_MATURITY" && (
                <div className="flex flex-col gap-2 col-span-2">
                  <Label className="font-normal">
                    Last Coupon Date
                  </Label>
                  <DatePicker
                    toYear={2050}
                    className={`bg-white py-5 border-none font-medium ${validationErrors.some((e) =>
                      e.includes("Last Coupon Date")
                    )
                      ? "border-red-300 focus:border-red-500"
                      : ""
                      }`}
                    value={formatToDatePicker(lastCouponDate)}
                    onChange={(e) =>
                      setLastCouponDate(formatFromDatePicker(e.target.value))
                    }
                  />
                  {validationErrors
                    .filter((e) => e.includes("Last Coupon Date"))
                    .map((error, index) => (
                      <p key={index} className="text-red-600 text-xs mt-1">
                        {error}
                      </p>
                    ))}
                </div>
              )}
            </div>
            <div className="lg:col-span-2 bg-white rounded-md">
              {validationErrors.length > 0 && (
                <div className="bg-red-50 mb-4 p-4 border border-red-200 rounded-md">
                  <h4 className="mb-2 font-medium text-red-800 text-sm">
                    Please fix the following errors:
                  </h4>
                  <ul className="space-y-1 text-red-600 text-xs">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
              <FlowChart ytmData={ytmResult} />
            </div>
          </SectionWrapper>
        </div>
      </div>
      <SectionWrapper className="pb-5">
        <FlowTable flowData={ytmResult} />
      </SectionWrapper>
    </>
  );
}

export default XirrCalculator;
