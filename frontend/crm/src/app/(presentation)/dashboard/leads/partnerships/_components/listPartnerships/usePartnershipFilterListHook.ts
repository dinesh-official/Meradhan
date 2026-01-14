import { useState } from "react";

export type TPartnershipFilterListHook = ReturnType<
  typeof usePartnershipFilterListHook
>;

export const usePartnershipFilterListHook = () => {
  const [paginationIndex, setPaginationIndex] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [partnershipModelFilter, setPartnershipModelFilter] =
    useState<string>("ALL");
  const [organizationTypeFilter, setOrganizationTypeFilter] =
    useState<string>("");

  function resetAll() {
    setPaginationIndex(1);
    setSearch("");
    setStatusFilter("ALL");
    setPartnershipModelFilter("ALL");
    setOrganizationTypeFilter("");
  }
  return {
    state: {
      resetAll,
      paginationIndex,
      search,
      statusFilter,
      partnershipModelFilter,
      organizationTypeFilter,
      setStatusFilter,
      setPartnershipModelFilter,
      setOrganizationTypeFilter,
      setSearch,
      setPaginationIndex,
    },
  };
};

