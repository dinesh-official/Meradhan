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
import { Search, Trash2Icon, X } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import {
  couponOptions,
  interestPaymentOptions,
  maturityOptions,
  ratingOptions,
  taxationOptions,
} from "../_hooks/bonds_filter_data";
import { BondsFilterHook } from "../_hooks/useBondsFilters";
import { useRouter } from "nextjs-toploader/app";

function ExploreBondsHeader({
  manager,
  applyFilters,
  desc,
  title,
  rootUrl,
}: {
  manager: BondsFilterHook;
  applyFilters?: () => void;
  title?: string | ReactNode;
  desc?: string | ReactNode;
  rootUrl: string;
}) {
  const [dounce, setDobunce] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (dounce === 0) return; // skip first render

    const timer = setTimeout(() => {
      applyFilters?.(); // ✅ safely call it after delay
    }, 1200); // 1200ms debounce

    return () => clearTimeout(timer); // ✅ cleanup on re-run
  }, [dounce]);

  return (
    <div className="flex flex-col justify-center items-center bg-primary py-14 w-full ">
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
          <div className="gap-3 grid grid-cols-2 lg:grid-cols-5">
            {/* <MultiSelect
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
            </MultiSelect> */}

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
          <div className="flex flex-wrap gap-3">
            {/* Search Filter */}
            {/* {manager.filters?.search && (
              <div className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full text-white text-sm">
                <span>Search: {manager.filters.search}</span>
                <Trash2Icon
                  className="hover:text-red-300 transition-colors cursor-pointer"
                  size={14}
                  onClick={() => {
                    manager.setSearch("");
                    setDobunce((prev) => prev + 1);
                  }}
                />
              </div>
            )} */}

            {/* Maturity Filters */}
            {manager.filters?.maturity?.map((m) => {
              const maturityOption = maturityOptions.find(
                (opt) => opt.value === m
              );
              return (
                <div
                  key={m}
                  className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full text-white text-sm"
                >
                  <span>Maturity: {maturityOption?.title || m}</span>
                  <Trash2Icon
                    className="hover:text-red-300 transition-colors cursor-pointer"
                    size={14}
                    onClick={() => {
                      const newMaturity =
                        manager.filters?.maturity?.filter(
                          (item) => item !== m
                        ) || [];
                      manager.setMaturity(newMaturity);
                      setDobunce((prev) => prev + 1);
                    }}
                  />
                </div>
              );
            })}

            {/* Rating Filters */}
            {manager.filters?.rating?.map((r) => {
              const ratingOption = ratingOptions.find((opt) => opt.value === r);
              return (
                <div
                  key={r}
                  className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full text-white text-sm"
                >
                  <span>Rating: {ratingOption?.title || r}</span>
                  <Trash2Icon
                    className="hover:text-red-300 transition-colors cursor-pointer"
                    size={14}
                    onClick={() => {
                      const newRating =
                        manager.filters?.rating?.filter((item) => item !== r) ||
                        [];
                      manager.setRating(newRating);
                      setDobunce((prev) => prev + 1);
                    }}
                  />
                </div>
              );
            })}

            {/* Taxation Filters */}
            {manager.filters?.taxation?.map((t) => {
              const taxationOption = taxationOptions.find(
                (opt) => opt.value === t
              );
              return (
                <div
                  key={t}
                  className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full text-white text-sm"
                >
                  <span>Taxation: {taxationOption?.title || t}</span>
                  <Trash2Icon
                    className="hover:text-red-300 transition-colors cursor-pointer"
                    size={14}
                    onClick={() => {
                      const newTaxation =
                        manager.filters?.taxation?.filter(
                          (item) => item !== t
                        ) || [];
                      manager.setTaxation(newTaxation);
                      setDobunce((prev) => prev + 1);
                    }}
                  />
                </div>
              );
            })}

            {/* Coupon Filters */}
            {manager.filters?.coupon?.map((c) => {
              const couponOption = couponOptions.find((opt) => opt.value === c);
              return (
                <div
                  key={c}
                  className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full text-white text-sm"
                >
                  <span>Coupon: {couponOption?.title || c}%</span>
                  <Trash2Icon
                    className="hover:text-red-300 transition-colors cursor-pointer"
                    size={14}
                    onClick={() => {
                      const newCoupon =
                        manager.filters?.coupon?.filter((item) => item !== c) ||
                        [];
                      manager.setCoupon(newCoupon);
                      setDobunce((prev) => prev + 1);
                    }}
                  />
                </div>
              );
            })}

            {/* Interest Payment Filters */}
            {manager.filters?.interest?.map((i) => {
              const interestOption = interestPaymentOptions.find(
                (opt) => opt.value === i
              );
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full text-white text-sm"
                >
                  <span>Interest: {interestOption?.title || i}</span>
                  <Trash2Icon
                    className="hover:text-red-300 transition-colors cursor-pointer"
                    size={14}
                    onClick={() => {
                      const newInterest =
                        manager.filters?.interest?.filter(
                          (item) => item !== i
                        ) || [];
                      manager.setInterest(newInterest);
                      setDobunce((prev) => prev + 1);
                    }}
                  />
                </div>
              );
            })}

            {/* Clear All Filters Button */}
            {manager.filters?.maturity?.length ||
              manager.filters?.rating?.length ||
              manager.filters?.taxation?.length ||
              manager.filters?.coupon?.length ||
              manager.filters?.interest?.length ? (
              <div
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full text-white text-sm transition-colors cursor-pointer"
                onClick={() => {
                  // manager.setSearch("");
                  // manager.setMaturity([]);
                  // manager.setRating([]);
                  // manager.setTaxation([]);
                  // manager.setCoupon([]);
                  // manager.setInterest([]);
                  router.replace(rootUrl);
                  // setDobunce((prev) => prev + 1);
                }}
              >
                <span>Clear All</span>
                <X size={14} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExploreBondsHeader;
