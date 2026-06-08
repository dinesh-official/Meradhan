// [Ticket: Maturity and Credit Rating dropdown filters should display only bonds we hold]
// This hook fetches the filter options dynamically from the backend, based on which
// bonds are actually in the database. It falls back to the static option lists on error
// so the UI is never broken if the endpoint is temporarily unavailable.
"use client";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import {
  couponOptions,
  interestPaymentOptions,
  maturityOptions,
  ratingOptions,
  taxationOptions,
} from "./bonds_filter_data";

const bondsApiClient = new apiGateway.bondsApi.BondsApi(apiClientCaller);

/**
 * Fetches the filter option buckets that have at least one active bond.
 * The returned arrays contain only the values present in the actual bond data,
 * so dropdowns will not show options that would always produce zero results.
 *
 * @param category - optional category slug (e.g. "tax-free", "psu") to scope options
 */
export function useBondFilterOptions(category?: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["bond-filter-options", category ?? "all"],
    queryFn: async () => {
      const response = await bondsApiClient.getBondFilterOptions(
        category ? { category } : undefined
      );
      return response.responseData;
    },
    // Cache for 5 minutes — options don't change on every page view
    staleTime: 5 * 60 * 1000,
    // Retry once on failure then fall through to static fallbacks
    retry: 1,
  });

  // ---- Maturity ----
  // [Dynamic filter logic]
  // BUG FIX: [] is truthy in JS — checking truthiness alone causes empty dropdowns
  // when the API returns an empty array. Use length > 0 so the static fallback fires
  // both on API failure (data=undefined) AND when no bonds match any bucket.
  // [Static fallback — uncomment to revert to always showing all options]
  // const activeMaturityOptions = maturityOptions;
  const dynamicMaturity = data?.maturity ?? null;
  const activeMaturityOptions =
    dynamicMaturity && dynamicMaturity.length > 0
      ? maturityOptions.filter((opt) => dynamicMaturity.includes(opt.value))
      : maturityOptions;

  // ---- Credit Rating ----
  // [Dynamic filter logic]
  // BUG FIX: DB stores the default unrated value as "UnRated" (capital R) but the
  // static ratingOptions list uses "Unrated" (lowercase r). Normalise before comparing
  // so the "Unrated" option is not silently dropped from the dropdown.
  // [Static fallback — uncomment to revert to always showing all options]
  // const activeRatingOptions = ratingOptions;
  const dynamicRatings = data?.rating
    ? data.rating.map((r) => (r === "UnRated" ? "Unrated" : r))
    : null;
  const activeRatingOptions =
    dynamicRatings && dynamicRatings.length > 0
      ? ratingOptions.filter((opt) => dynamicRatings.includes(opt.value))
      : ratingOptions;

  // ---- Taxation ----
  // [Dynamic filter logic]
  // [Static fallback — uncomment to revert to always showing all options]
  // const activeTaxationOptions = taxationOptions;
  const dynamicTaxation = data?.taxation ?? null;
  const activeTaxationOptions =
    dynamicTaxation && dynamicTaxation.length > 0
      ? taxationOptions.filter((opt) => dynamicTaxation.includes(opt.value))
      : taxationOptions;

  // ---- Coupon ----
  // [Dynamic filter logic]
  // [Static fallback — uncomment to revert to always showing all options]
  // const activeCouponOptions = couponOptions;
  const dynamicCoupon = data?.coupon ?? null;
  const activeCouponOptions =
    dynamicCoupon && dynamicCoupon.length > 0
      ? couponOptions.filter((opt) => dynamicCoupon.includes(opt.value))
      : couponOptions;

  // ---- Interest Payment ----
  // [Dynamic filter logic]
  // [Static fallback — uncomment to revert to always showing all options]
  // const activeInterestOptions = interestPaymentOptions;
  const dynamicInterest = data?.interest ?? null;
  const activeInterestOptions =
    dynamicInterest && dynamicInterest.length > 0
      ? interestPaymentOptions.filter((opt) => dynamicInterest.includes(opt.value))
      : interestPaymentOptions;

  return {
    isLoading,
    isError,
    activeMaturityOptions,
    activeRatingOptions,
    activeTaxationOptions,
    activeCouponOptions,
    activeInterestOptions,
  };
}

export default useBondFilterOptions;
