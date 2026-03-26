import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useEffect } from "react";
import z from "zod";
import { toValidatedArray, validateBondsFilters } from "../_utils/filter";

// --- Zod schema ---
const bondsFilterSchema = appSchema.bonds.bondsFilterSchema;

// --- Hook ---
export const useBondsFilters = ({
  pathname,
  category,
}: {
  pathname: string;
  category: string;
}) => {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );
  const [maturity, setMaturity] = useQueryState(
    "maturity",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [rating, setRating] = useQueryState(
    "rating",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [coupon, setCoupon] = useQueryState(
    "coupon",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [taxation, setTaxation] = useQueryState(
    "taxation",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [interest, setInterest] = useQueryState(
    "interest",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const { page } = useParams<{ page?: string }>(); // returns an object
  const router = useRouter();

  const filters = { search, maturity, rating, coupon, taxation, interest };
  const validated = bondsFilterSchema.safeParse(filters);

  useEffect(() => {
    if (!validated.success) {
      setMaturity((prev) =>
        toValidatedArray(prev, appSchema.bonds.maturityYearEnums)
      );
      setCoupon((prev) =>
        toValidatedArray(prev, appSchema.bonds.couponPercentEnums)
      );
      setTaxation((prev) =>
        toValidatedArray(prev, appSchema.bonds.taxationEnums)
      );
      setInterest((prev) =>
        toValidatedArray(prev, appSchema.bonds.INTEREST_MODE_VALUES)
      );
    }
  }, [setCoupon, setInterest, setMaturity, setTaxation, validated.success]);

  const apiCaller = new apiGateway.bondsApi.BondsApi(apiClientCaller);

  const applyFilterMutation = useMutation({
    mutationKey: ["bonds", "filters"],
    mutationFn: async ({
      filters,
    }: {
      filters: z.infer<typeof bondsFilterSchema>;
    }) => {
      const queryFilter = validateBondsFilters(filters || {});
      return await apiCaller.getListedBonds({
        filters: {
          ...queryFilter,
        },
        params: { page: 1, category, all: "YES", limit: 100 },
      });
    },
  });

  const applyFilters = async (filter: z.infer<typeof bondsFilterSchema>) => {
    const activePage = page ? parseInt(page as string, 10) : 1;

    if (activePage !== 1) {
      router.push(pathname + window.location.search);
    } else {
      // Direct API fetch
      applyFilterMutation.mutate({ filters: filter });
    }
  };

  const anyFilterApplied = (() => {
    if (search) return true;
    if (maturity.length > 0) return true;
    if (rating.length > 0) return true;
    if (coupon.length > 0) return true;
    if (taxation.length > 0) return true;
    if (interest.length > 0) return true;
    return false;
  })();

  return {
    filters: validated.success
      ? validated.data
      : {
        ...filters,
        maturity: toValidatedArray(
          filters.maturity,
          appSchema.bonds.maturityYearEnums
        ),
        coupon: toValidatedArray(
          filters.coupon,
          appSchema.bonds.couponPercentEnums
        ),
        taxation: toValidatedArray(
          filters.taxation,
          appSchema.bonds.taxationEnums
        ),
        interest: toValidatedArray(
          filters.interest,
          appSchema.bonds.INTEREST_MODE_VALUES
        ),
      },
    setSearch,
    setMaturity,
    setRating,
    setCoupon,
    setTaxation,
    setInterest,
    applyFilters,
    applyFilterMutation,
    anyFilterApplied,
  };
};

export default useBondsFilters;

export type BondsFilterHook = ReturnType<typeof useBondsFilters>;
