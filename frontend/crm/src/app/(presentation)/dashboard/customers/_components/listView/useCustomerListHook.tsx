"use client";

import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

/** URL search params for /dashboard/customers (shareable filters + pagination). */
export const customerListUrlParsers = {
  q: parseAsString.withDefault(""),
  status: parseAsString.withDefault("ALL"),
  kyc: parseAsString.withDefault("ALL"),
  type: parseAsString.withDefault("ALL"),
  rm: parseAsString.withDefault("ALL"),
  page: parseAsInteger.withDefault(1),
};

export interface TCustomerFilterListHook {
  state: {
    resetAll: () => void;
    paginationIndex: number;
    setPaginationIndex: Dispatch<SetStateAction<number>>;
    accountStatus: string;
    setAccountStatus: Dispatch<SetStateAction<string>>;
    accountKycStatus: string;
    setAccountKycStatus: Dispatch<SetStateAction<string>>;
    userType: string;
    setUserType: Dispatch<SetStateAction<string>>;
    rmAssignment: string;
    setRmAssignment: Dispatch<SetStateAction<string>>;
    search: string;
    setSearch: Dispatch<SetStateAction<string>>;
    hasActiveFilters: boolean;
  };
}

function omitDefault(value: string, defaultValue: string) {
  return value === defaultValue ? null : value;
}

export const useCustomerFilterListHook = (): TCustomerFilterListHook => {
  const [params, setParams] = useQueryStates(customerListUrlParsers, {
    history: "push",
  });

  const setSearch = useCallback<Dispatch<SetStateAction<string>>>(
    (value) => {
      setParams((prev) => {
        const next = typeof value === "function" ? value(prev.q ?? "") : value;
        return {
          q: next.trim() ? next : null,
          page: 1,
        };
      });
    },
    [setParams],
  );

  const setAccountStatus = useCallback<Dispatch<SetStateAction<string>>>(
    (value) => {
      setParams((prev) => {
        const next =
          typeof value === "function" ? value(prev.status ?? "ALL") : value;
        return {
          status: omitDefault(next, "ALL"),
          page: 1,
        };
      });
    },
    [setParams],
  );

  const setAccountKycStatus = useCallback<Dispatch<SetStateAction<string>>>(
    (value) => {
      setParams((prev) => {
        const next = typeof value === "function" ? value(prev.kyc ?? "ALL") : value;
        return {
          kyc: omitDefault(next, "ALL"),
          page: 1,
        };
      });
    },
    [setParams],
  );

  const setUserType = useCallback<Dispatch<SetStateAction<string>>>(
    (value) => {
      setParams((prev) => {
        const next = typeof value === "function" ? value(prev.type ?? "ALL") : value;
        return {
          type: omitDefault(next, "ALL"),
          page: 1,
        };
      });
    },
    [setParams],
  );

  const setRmAssignment = useCallback<Dispatch<SetStateAction<string>>>(
    (value) => {
      setParams((prev) => {
        const next = typeof value === "function" ? value(prev.rm ?? "ALL") : value;
        return {
          rm: omitDefault(next, "ALL"),
          page: 1,
        };
      });
    },
    [setParams],
  );

  const setPaginationIndex = useCallback<Dispatch<SetStateAction<number>>>(
    (value) => {
      setParams((prev) => {
        const next =
          typeof value === "function" ? value(prev.page ?? 1) : value;
        const safePage = Math.max(1, next);
        return { page: safePage === 1 ? null : safePage };
      });
    },
    [setParams],
  );

  function resetAll() {
    setParams(null);
  }

  const hasActiveFilters = useMemo(
    () =>
      params.q.trim() !== "" ||
      params.status !== "ALL" ||
      params.kyc !== "ALL" ||
      params.type !== "ALL" ||
      params.rm !== "ALL",
    [params.q, params.status, params.kyc, params.type, params.rm],
  );

  return {
    state: {
      resetAll,
      hasActiveFilters,
      paginationIndex: params.page,
      setPaginationIndex,
      accountStatus: params.status,
      setAccountStatus,
      accountKycStatus: params.kyc,
      setAccountKycStatus,
      userType: params.type,
      setUserType,
      rmAssignment: params.rm,
      setRmAssignment,
      search: params.q,
      setSearch,
    },
  };
};
