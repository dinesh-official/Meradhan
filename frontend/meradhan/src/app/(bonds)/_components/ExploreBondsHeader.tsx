/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Input } from "@/components/ui/input";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import {
  couponOptions,
  interestPaymentOptions,
  maturityOptions,
  ratingOptions,
  taxationOptions,
} from "../_hooks/bonds_filter_data";
import { BondsFilterHook } from "../_hooks/useBondsFilters";
import { ReactNode, useEffect, useState } from "react";

function ExploreBondsHeader({
  manager,
  applyFilters,
  desc,
  title,
}: {
  manager: BondsFilterHook;
  applyFilters?: () => void;
  title?: string | ReactNode;
  desc?: string | ReactNode;
}) {
  const [dounce, setDobunce] = useState(0);

  useEffect(() => {
    if (dounce === 0) return; // skip first render

    const timer = setTimeout(() => {
      applyFilters?.(); // ✅ safely call it after delay
    }, 1200); // 1200ms debounce

    return () => clearTimeout(timer); // ✅ cleanup on re-run
  }, [dounce]);

  return (
    <div className="flex flex-col justify-center items-center bg-primary lg:-mt-5 py-8 lg:py-0 w-full lg:h-[420px]">
      <div className="h-full text-white text-center container">
        <div className="flex flex-col justify-center gap-5 h-full">
          {title && (
            <h1
              className={cn(
                "font-medium lg:text-[40px] text-3xl",
                "quicksand-medium"
              )}
            >
              {title}
            </h1>
          )}
          {desc && <p>{desc}</p>}
          <div className="relative">
            <Input
              className="bg-white px-5 py-5.5 border-0 text-gray-950"
              placeholder="Search by ISIN, Issuer Name"
              onChange={(e) => {
                manager.setSearch(e.target.value);
                setDobunce((prev) => prev + 1);
              }}
              value={manager.filters?.search || ""}
            />
            <button
              className="focus:z-10 absolute inset-y-0 flex justify-center items-center disabled:opacity-50 focus-visible:border-ring rounded-e-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 w-9 h-full text-muted-foreground/80 hover:text-foreground transition-[color,box-shadow] disabled:cursor-not-allowed disabled:pointer-events-none end-0"
              aria-label="Subscribe"
              disabled={!manager.filters?.search}
              onClick={() => {
                setDobunce((prev) => prev + 1);
              }}
            >
              <Search className="mr-3 text-secondary" />
            </button>
          </div>
          <p className="mt-5">Or Search by Filter</p>
          <div className="gap-3 grid grid-cols-2 lg:grid-cols-6">
            <MultiSelect
              defaultValues={[]}
              onValuesChange={() => {
                setDobunce((prev) => prev + 1);
              }}
            >
              <MultiSelectTrigger className="w-full" disabled>
                <MultiSelectValue placeholder="Yield" />
              </MultiSelectTrigger>
              <MultiSelectContent>
                <MultiSelectGroup>
                  {([] as unknown as typeof maturityOptions).map((option) => (
                    <MultiSelectItem key={option.value} value={option.value}>
                      {option.title}
                    </MultiSelectItem>
                  ))}
                </MultiSelectGroup>
              </MultiSelectContent>
            </MultiSelect>

            <MultiSelect
              values={manager.filters?.maturity}
              onValuesChange={(values) => {
                manager.setMaturity(values);
                setDobunce((prev) => prev + 1);
              }}
            >
              <MultiSelectTrigger className="w-full">
                <MultiSelectValue placeholder="Select Maturity" />
              </MultiSelectTrigger>
              <MultiSelectContent>
                <MultiSelectGroup>
                  {maturityOptions.map((option) => (
                    <MultiSelectItem key={option.value} value={option.value}>
                      {option.title}
                    </MultiSelectItem>
                  ))}
                </MultiSelectGroup>
              </MultiSelectContent>
            </MultiSelect>

            <MultiSelect
              values={manager.filters?.rating}
              onValuesChange={(values) => {
                manager.setRating(values);
                setDobunce((prev) => prev + 1);
              }}
            >
              <MultiSelectTrigger className="w-full">
                <MultiSelectValue placeholder="Credit Rating" />
              </MultiSelectTrigger>
              <MultiSelectContent>
                <MultiSelectGroup>
                  {ratingOptions.map((option) => (
                    <MultiSelectItem key={option.value} value={option.value}>
                      {option.title}
                    </MultiSelectItem>
                  ))}
                </MultiSelectGroup>
              </MultiSelectContent>
            </MultiSelect>

            <MultiSelect
              values={manager.filters?.taxation}
              onValuesChange={(values) => {
                manager.setTaxation(values);
                setDobunce((prev) => prev + 1);
              }}
            >
              <MultiSelectTrigger className="w-full">
                <MultiSelectValue placeholder="Taxation" />
              </MultiSelectTrigger>
              <MultiSelectContent>
                <MultiSelectGroup>
                  {taxationOptions.map((option) => (
                    <MultiSelectItem key={option.value} value={option.value}>
                      {option.title}
                    </MultiSelectItem>
                  ))}
                </MultiSelectGroup>
              </MultiSelectContent>
            </MultiSelect>

            <MultiSelect
              values={manager.filters?.coupon}
              onValuesChange={(values) => {
                manager.setCoupon(values);
                setDobunce((prev) => prev + 1);
              }}
            >
              <MultiSelectTrigger className="w-full">
                <MultiSelectValue placeholder="Coupon (%)" />
              </MultiSelectTrigger>
              <MultiSelectContent>
                <MultiSelectGroup>
                  {couponOptions.map((option) => (
                    <MultiSelectItem key={option.value} value={option.value}>
                      {option.title}
                    </MultiSelectItem>
                  ))}
                </MultiSelectGroup>
              </MultiSelectContent>
            </MultiSelect>

            <MultiSelect
              values={manager.filters?.interest}
              onValuesChange={(values) => {
                manager.setInterest(values);
                setDobunce((prev) => prev + 1);
              }}
            >
              <MultiSelectTrigger className="w-full">
                <MultiSelectValue placeholder="Interest Payment" />
              </MultiSelectTrigger>
              <MultiSelectContent>
                <MultiSelectGroup>
                  {interestPaymentOptions.map((option) => (
                    <MultiSelectItem key={option.value} value={option.value}>
                      {option.title}
                    </MultiSelectItem>
                  ))}
                </MultiSelectGroup>
              </MultiSelectContent>
            </MultiSelect>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExploreBondsHeader;
