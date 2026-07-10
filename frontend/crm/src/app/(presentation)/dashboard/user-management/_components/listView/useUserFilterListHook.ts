import { Dispatch, SetStateAction, useEffect, useState } from "react";

export interface TUserFilterListHook {
  state: {
    resetAll: () => void;
    paginationIndex: number;
    setPaginationIndex: Dispatch<SetStateAction<number>>;
    search: string;
    setSearch: Dispatch<SetStateAction<string>>;
    accountStatus: string;
    setAccountStatus: Dispatch<SetStateAction<string>>;
    roleFilter: string;
    setRoleFilter: Dispatch<SetStateAction<string>>;
  };
}
export const useUserFilterListHook = (): TUserFilterListHook => {
  const [paginationIndex, setPaginationIndex] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [accountStatus, setAccountStatus] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  function resetAll() {
    setPaginationIndex(1);
    setSearch("");
    setAccountStatus("ALL");
    setRoleFilter("ALL");
  }

  useEffect(() => {
    setPaginationIndex(1);
  }, [search, accountStatus, roleFilter]);

  return {
    state: {
      resetAll,
      paginationIndex,
      setPaginationIndex,
      search,
      setSearch,
      accountStatus,
      setAccountStatus,
      roleFilter,
      setRoleFilter,
    },
  };
};
