import { useState, useEffect, Dispatch, SetStateAction } from "react";

// Utility function to format date to DD-MM-YYYY
const formatDateForAPI = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Utility function to format date for input field (YYYY-MM-DD)
const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get default dates (2 days ago to today)
const getDefaultDates = () => {
  const today = new Date();
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(today.getDate() - 2);
  
  return {
    fromDate: formatDateForInput(twoDaysAgo),
    toDate: formatDateForInput(today)
  };
};

export interface SettleOrdersFilterState {
  id?: number;
  orderNumber?: string;
  filtFromModSettleDate?: string;
  filtToModSettleDate?: string;
  filtCounterParty?: string;
  paginationIndex: number;
}

export interface TSettleOrdersFilterHook {
  state: {
    resetAll: () => void;
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
  };
}

export const useSettleOrdersFilterHook = (): TSettleOrdersFilterHook => {
  const defaultDates = getDefaultDates();
  
  const [id, setId] = useState<string>("");
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [filtFromModSettleDate, setFiltFromModSettleDate] = useState<string>(defaultDates.fromDate);
  const [filtToModSettleDate, setFiltToModSettleDate] = useState<string>(defaultDates.toDate);
  const [filtCounterParty, setFiltCounterParty] = useState<string>("");
  const [paginationIndex, setPaginationIndex] = useState<number>(1);

  // Reset pagination when any filter changes
  useEffect(() => {
    setPaginationIndex(1);
  }, [id, orderNumber, filtFromModSettleDate, filtToModSettleDate, filtCounterParty]);

  function resetAll() {
    const defaultDates = getDefaultDates();
    setId("");
    setOrderNumber("");
    setFiltFromModSettleDate(defaultDates.fromDate);
    setFiltToModSettleDate(defaultDates.toDate);
    setFiltCounterParty("");
    setPaginationIndex(1);
  }

  return {
    state: {
      resetAll,
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
      paginationIndex,
      setPaginationIndex,
    },
  };
};

// Export utility function for use in API hook
export { formatDateForAPI };