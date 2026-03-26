"use client";
import { Card, CardContent } from "@/components/ui/card";
import CardPagination from "@/global/elements/table/CardPagination";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import PartnershipsSearchFilterBar from "./_components/listPartnerships/PartnershipsSearchFilterBar";
import PartnershipTable from "./_components/listPartnerships/PartnershipTable";
import { usePartnershipFilterApiHook } from "./_components/listPartnerships/usePartnershipFilterApiHook";
import { usePartnershipFilterListHook } from "./_components/listPartnerships/usePartnershipFilterListHook";

function PartnershipsView() {
  const filterManager = usePartnershipFilterListHook();
  const filterApiManager = usePartnershipFilterApiHook(filterManager);

  const isShowPagination = () => {
    return (
      (filterApiManager.fetchPartnershipsQuery.data?.responseData.data.length ||
        0) > 0 &&
      filterApiManager.fetchPartnershipsQuery.data?.responseData.meta
        .totalPages != 1
    );
  };

  return (
    <div>
      <PageInfoBar
        title="Partners & Distributors"
        description="Manage partnership submissions and enquiries"
      />
      <Card className="mt-5">
        <PartnershipsSearchFilterBar
          placeholder="Search partnerships..."
          onSearchChange={filterManager.state.setSearch}
          onStatusChange={filterManager.state.setStatusFilter}
          onPartnershipModelChange={filterManager.state.setPartnershipModelFilter}
          onOrganizationTypeChange={filterManager.state.setOrganizationTypeFilter}
          searchValue={filterManager.state.search}
          statusValue={filterManager.state.statusFilter}
          partnershipModelValue={filterManager.state.partnershipModelFilter}
          organizationTypeValue={filterManager.state.organizationTypeFilter}
        />
        <CardContent>
          <PartnershipTable
            data={
              filterApiManager.fetchPartnershipsQuery.data?.responseData.data ||
              []
            }
            isLoading={filterApiManager.fetchPartnershipsQuery.isLoading}
          />
        </CardContent>
        {isShowPagination() && (
          <CardPagination
            onClick={filterManager.state.setPaginationIndex}
            page={filterManager.state.paginationIndex}
            totalPages={
              filterApiManager.fetchPartnershipsQuery.data?.responseData.meta
                .totalPages || 1
            }
          />
        )}
      </Card>
    </div>
  );
}

export default PartnershipsView;

