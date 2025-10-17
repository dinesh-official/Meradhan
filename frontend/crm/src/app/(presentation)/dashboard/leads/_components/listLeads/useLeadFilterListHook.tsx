import { Dispatch, SetStateAction, useState } from "react"


export interface TLeadFilterListHook {
  state: {
    resetAll: () => void;
    paginationIndex: number;
    setPaginationIndex: Dispatch<SetStateAction<number>>;
    search: string;
    setSearch: Dispatch<SetStateAction<string>>;
    statusFilter: string;
    setStatusFilter: Dispatch<SetStateAction<string>>;
    sourceFilter: string;
    setSourceFilter: Dispatch<SetStateAction<string>>;
  };
}

export const useLeadFilterListHook = ():TLeadFilterListHook=>{
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
        state:{
            resetAll,
            paginationIndex,
            search,
            statusFilter,
            sourceFilter,
            setSourceFilter,
            setStatusFilter,
            setSearch,
            setPaginationIndex,
        }
      }


}