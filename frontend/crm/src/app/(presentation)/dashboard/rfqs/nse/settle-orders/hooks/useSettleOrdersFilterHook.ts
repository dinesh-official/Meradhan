import { useEffect, useMemo, useRef, useState, Dispatch, SetStateAction } from "react";
import { parseAsString, useQueryStates } from "nuqs";

// Utility function to format date to DD-MM-YYYY
const formatDateForAPI = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Utility function to format date for input field (YYYY-MM-DD)
const formatDateForInput = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Get default dates (2 days ago to today)
const getDefaultDates = () => {
  const today = new Date();
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(today.getDate() - 2);

  return {
    fromDate: formatDateForInput(twoDaysAgo),
    toDate: formatDateForInput(today),
  };
};

/** URL search params for settle orders (shareable / bookmarkable filters). */
const settleOrdersUrlParsers = {
  id: parseAsString,
  order: parseAsString,
  from: parseAsString,
  to: parseAsString,
  cp: parseAsString,
};

export interface SettleOrdersAppliedFilters {
  id: string;
  orderNumber: string;
  filtFromModSettleDate: string;
  filtToModSettleDate: string;
  filtCounterParty: string;
  paginationIndex: number;
}

export interface TSettleOrdersFilterHook {
  state: {
    resetAll: () => void;
    applyFilters: () => void;
    id: string;
    setId: Dispatch<SetStateAction<string>>;
    orderNumber: string;
    setOrderNumber: Dispatch<SetStateAction<string>>;
    filtFromModSettleDate: string;
    setFiltFromModSettleDate: Dispatch<SetStateAction<string>>;
    filtToModSettleDate: string;
    setFiltToModSettleDate: Dispatch<SetStateAction<string>>;
    filtCounterParty: string;
    setFiltCounterParty: Dispatch<SetStateAction<string>>;
    paginationIndex: number;
    setPaginationIndex: (updater: SetStateAction<number>) => void;
    applied: SettleOrdersAppliedFilters;
    hasPendingFilterChanges: boolean;
  };
}

export const useSettleOrdersFilterHook = (): TSettleOrdersFilterHook => {
  const defaultDatesRef = useRef(getDefaultDates());

  const [params, setParams] = useQueryStates(settleOrdersUrlParsers, {
    history: "push",
  });

  const applied = useMemo((): SettleOrdersAppliedFilters => {
    const d = defaultDatesRef.current;
    return {
      id: params.id ?? "",
      orderNumber: params.order ?? "",
      filtFromModSettleDate: params.from ?? d.fromDate,
      filtToModSettleDate: params.to ?? d.toDate,
      filtCounterParty: params.cp ?? "",
      paginationIndex: 1,
    };
  }, [params.id, params.order, params.from, params.to, params.cp]);

  const [draft, setDraft] = useState({
    id: "",
    orderNumber: "",
    filtFromModSettleDate: defaultDatesRef.current.fromDate,
    filtToModSettleDate: defaultDatesRef.current.toDate,
    filtCounterParty: "",
  });

  // Keep draft in sync when URL / applied filters change (load, back/forward, apply, reset).
  useEffect(() => {
    setDraft({
      id: applied.id,
      orderNumber: applied.orderNumber,
      filtFromModSettleDate: applied.filtFromModSettleDate,
      filtToModSettleDate: applied.filtToModSettleDate,
      filtCounterParty: applied.filtCounterParty,
    });
  }, [
    applied.id,
    applied.orderNumber,
    applied.filtFromModSettleDate,
    applied.filtToModSettleDate,
    applied.filtCounterParty,
  ]);

  const [appliedForPagination, setAppliedForPagination] = useState<SettleOrdersAppliedFilters>(
    () => ({
      ...applied,
      paginationIndex: 1,
    })
  );

  // When URL filter params change (apply, reset, back/forward), sync API state and reset to page 1.
  useEffect(() => {
    setAppliedForPagination({
      id: applied.id,
      orderNumber: applied.orderNumber,
      filtFromModSettleDate: applied.filtFromModSettleDate,
      filtToModSettleDate: applied.filtToModSettleDate,
      filtCounterParty: applied.filtCounterParty,
      paginationIndex: 1,
    });
  }, [
    applied.id,
    applied.orderNumber,
    applied.filtFromModSettleDate,
    applied.filtToModSettleDate,
    applied.filtCounterParty,
  ]);

  const hasPendingFilterChanges = useMemo(() => {
    return (
      draft.id !== applied.id ||
      draft.orderNumber !== applied.orderNumber ||
      draft.filtFromModSettleDate !== applied.filtFromModSettleDate ||
      draft.filtToModSettleDate !== applied.filtToModSettleDate ||
      draft.filtCounterParty !== applied.filtCounterParty
    );
  }, [draft, applied]);

  function applyFilters() {
    setParams({
      id: draft.id.trim() || null,
      order: draft.orderNumber.trim() || null,
      from: draft.filtFromModSettleDate || null,
      to: draft.filtToModSettleDate || null,
      cp: draft.filtCounterParty.trim() || null,
    });
  }

  function resetAll() {
    const d = getDefaultDates();
    defaultDatesRef.current = d;
    setParams(null);
  }

  const mergedApplied: SettleOrdersAppliedFilters = {
    ...applied,
    paginationIndex: appliedForPagination.paginationIndex,
  };

  return {
    state: {
      resetAll,
      applyFilters,
      id: draft.id,
      setId: (v) =>
        setDraft((prev) => ({
          ...prev,
          id: typeof v === "function" ? v(prev.id) : v,
        })),
      orderNumber: draft.orderNumber,
      setOrderNumber: (v) =>
        setDraft((prev) => ({
          ...prev,
          orderNumber: typeof v === "function" ? v(prev.orderNumber) : v,
        })),
      filtFromModSettleDate: draft.filtFromModSettleDate,
      setFiltFromModSettleDate: (v) =>
        setDraft((prev) => ({
          ...prev,
          filtFromModSettleDate:
            typeof v === "function" ? v(prev.filtFromModSettleDate) : v,
        })),
      filtToModSettleDate: draft.filtToModSettleDate,
      setFiltToModSettleDate: (v) =>
        setDraft((prev) => ({
          ...prev,
          filtToModSettleDate:
            typeof v === "function" ? v(prev.filtToModSettleDate) : v,
        })),
      filtCounterParty: draft.filtCounterParty,
      setFiltCounterParty: (v) =>
        setDraft((prev) => ({
          ...prev,
          filtCounterParty:
            typeof v === "function" ? v(prev.filtCounterParty) : v,
        })),
      paginationIndex: mergedApplied.paginationIndex,
      setPaginationIndex: (updater: SetStateAction<number>) => {
        setAppliedForPagination((prev) => ({
          ...prev,
          paginationIndex:
            typeof updater === "function"
              ? updater(prev.paginationIndex)
              : updater,
        }));
      },
      applied: mergedApplied,
      hasPendingFilterChanges,
    },
  };
};

export { formatDateForAPI };
