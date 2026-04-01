import { useState, useMemo, Dispatch, SetStateAction } from "react";

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
    setPaginationIndex: Dispatch<SetStateAction<number>>;
    /** Filters last sent to the API (drives the table query). */
    applied: SettleOrdersAppliedFilters;
    /** True when draft inputs differ from applied filters (pending apply). */
    hasPendingFilterChanges: boolean;
  };
}

export const useSettleOrdersFilterHook = (): TSettleOrdersFilterHook => {
  const defaultDates = getDefaultDates();

  const [id, setId] = useState<string>("");
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [filtFromModSettleDate, setFiltFromModSettleDate] = useState<string>(
    defaultDates.fromDate
  );
  const [filtToModSettleDate, setFiltToModSettleDate] = useState<string>(
    defaultDates.toDate
  );
  const [filtCounterParty, setFiltCounterParty] = useState<string>("");

  const [applied, setApplied] = useState<SettleOrdersAppliedFilters>(() => ({
    id: "",
    orderNumber: "",
    filtFromModSettleDate: defaultDates.fromDate,
    filtToModSettleDate: defaultDates.toDate,
    filtCounterParty: "",
    paginationIndex: 1,
  }));

  const hasPendingFilterChanges = useMemo(() => {
    return (
      id !== applied.id ||
      orderNumber !== applied.orderNumber ||
      filtFromModSettleDate !== applied.filtFromModSettleDate ||
      filtToModSettleDate !== applied.filtToModSettleDate ||
      filtCounterParty !== applied.filtCounterParty
    );
  }, [
    id,
    orderNumber,
    filtFromModSettleDate,
    filtToModSettleDate,
    filtCounterParty,
    applied,
  ]);

  function applyFilters() {
    setApplied({
      id,
      orderNumber,
      filtFromModSettleDate,
      filtToModSettleDate,
      filtCounterParty,
      paginationIndex: 1,
    });
  }

  function resetAll() {
    const d = getDefaultDates();
    setId("");
    setOrderNumber("");
    setFiltFromModSettleDate(d.fromDate);
    setFiltToModSettleDate(d.toDate);
    setFiltCounterParty("");
    setApplied({
      id: "",
      orderNumber: "",
      filtFromModSettleDate: d.fromDate,
      filtToModSettleDate: d.toDate,
      filtCounterParty: "",
      paginationIndex: 1,
    });
  }

  return {
    state: {
      resetAll,
      applyFilters,
      id,
      setId,
      orderNumber,
      setOrderNumber,
      filtFromModSettleDate,
      setFiltFromModSettleDate,
      filtToModSettleDate,
      setFiltToModSettleDate,
      filtCounterParty,
      setFiltCounterParty,
      paginationIndex: applied.paginationIndex,
      setPaginationIndex: (updater: SetStateAction<number>) => {
        setApplied((prev) => ({
          ...prev,
          paginationIndex:
            typeof updater === "function"
              ? updater(prev.paginationIndex)
              : updater,
        }));
      },
      applied,
      hasPendingFilterChanges,
    },
  };
};

// Export utility function for use in API hook
export { formatDateForAPI };
