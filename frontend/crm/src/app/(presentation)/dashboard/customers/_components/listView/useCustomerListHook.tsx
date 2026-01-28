import { Dispatch, SetStateAction, useEffect, useState } from "react";

export interface TCustomerFilterListHook {
  state: {
    resetAll: () => void;
    paginationIndex: number;
    setPaginationIndex: Dispatch<SetStateAction<number>>;
    accountStatus: string;
    setAccountStatus: Dispatch<SetStateAction<string>>;
    accountKycStatus: string;
    setAccountKycStatus: Dispatch<SetStateAction<string>>;
    search: string;
    setSearch: Dispatch<SetStateAction<string>>;
  };
}
export const useCustomerFilterListHook = (): TCustomerFilterListHook => {
  const [paginationIndex, setPaginationIndex] = useState<number>(1);
  const [accountStatus, setAccountStatus] = useState<string>("ALL");
  const [accountKycStatus, setAccountKycStatus] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  function resetAll() {
    setPaginationIndex(1);
    setSearch("");
    setAccountKycStatus("");
    setAccountStatus("");
  }

  useEffect(() => {
    if (paginationIndex != 1) {
      setPaginationIndex(1);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, accountStatus, accountKycStatus]);
  return {
    state: {
      resetAll,
      paginationIndex,
      setPaginationIndex,
      accountStatus,
      setAccountStatus,
      accountKycStatus,
      setAccountKycStatus,
      search,
      setSearch,
    },
  };
};
