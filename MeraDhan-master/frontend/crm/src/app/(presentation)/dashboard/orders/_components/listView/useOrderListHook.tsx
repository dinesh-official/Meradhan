import { Dispatch, SetStateAction, useState } from "react";

export interface TOrderFilterListHook {
  state: {
    resetAll: () => void;
    paginationIndex: number;
    setPaginationIndex: Dispatch<SetStateAction<number>>;
    statusFilter: string;
    setStatusFilter: Dispatch<SetStateAction<string>>;
    bondTypeFilter: string;
    setBondTypeFilter: Dispatch<SetStateAction<string>>;
    search: string;
    setSearch: Dispatch<SetStateAction<string>>;
    date: Date | undefined;
    setDate: Dispatch<SetStateAction<Date | undefined>>;
  };
}

export const useOrderFilterListHook = (): TOrderFilterListHook => {
  const [paginationIndex, setPaginationIndex] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [bondTypeFilter, setBondTypeFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>();

  function resetAll() {
    setPaginationIndex(1);
    setSearch("");
    setStatusFilter("ALL");
    setBondTypeFilter("ALL");
    setDate(undefined);
  }

  return {
    state: {
      resetAll,
      paginationIndex,
      setPaginationIndex,
      statusFilter,
      setStatusFilter,
      bondTypeFilter,
      setBondTypeFilter,
      search,
      setSearch,
      date,
      setDate,
    },
  };
};
