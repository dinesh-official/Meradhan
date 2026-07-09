import { useState } from "react";

export type TLeadFilterListHook = ReturnType<typeof useLeadFilterListHook>

export const useLeadFilterListHook = () => {
  const [paginationIndex, setPaginationIndex] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");

  function resetAll() {
    setPaginationIndex(1);
    setSearch("");
    setStatusFilter("ALL");
    setSourceFilter("ALL");
  }
  return {
    state: {
      resetAll,
      paginationIndex,
      search,
      statusFilter,
      sourceFilter,
      setSourceFilter,
      setStatusFilter,
      setSearch,
      setPaginationIndex,
    },
  };
};
