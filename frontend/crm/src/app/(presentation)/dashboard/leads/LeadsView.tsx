"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CardPagination from "@/global/elements/table/CardPagination";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { Plus } from "lucide-react";
import LeadsSearchFilterBar from "./_components/listLeads/LeadsSearchFilterBar";
import LeadTable from "./_components/listLeads/LeadTable";
import { useLeadFilterApiHook } from "./_components/listLeads/useLeadFilterApiHook";
import { useLeadFilterListHook } from "./_components/listLeads/useLeadFilterListHook";
import NewLeadFormOnPopup from "./create/NewLeadFormOnPopup";

function LeadsView() {
  const filterManager = useLeadFilterListHook();
  const filterApiManager = useLeadFilterApiHook(filterManager);

  const isShowPagination = () => {
    return (
      (filterApiManager.fetchLeadsQuery.data?.responseData.data.length || 0) >
        0 &&
      filterApiManager.fetchLeadsQuery.data?.responseData.meta.totalPages !=
        1 &&
      !filterApiManager.fetchLeadsQuery.isPending
    );
  };
  
  return (
    <div>
      <PageInfoBar
        title="Leads Management"
        description="Track and manage potential customers"
        actions={
          <NewLeadFormOnPopup>
            <Button>
              <Plus /> Add New Lead
            </Button>
          </NewLeadFormOnPopup>
        }
      />
      <Card className="mt-5">
        <LeadsSearchFilterBar
          placeholder="Search leads..."
          onSearchChange={filterManager.state.setSearch}
          onSourceChange={filterManager.state.setSourceFilter}
          onStatusChange={filterManager.state.setStatusFilter}
          searchValue={filterManager.state.search}
          sourceValue={filterManager.state.sourceFilter}
          statusValue={filterManager.state.statusFilter}
        />
        <CardContent>
          <LeadTable
            data={
              filterApiManager.fetchLeadsQuery.data?.responseData.data || []
            }
            isLoading={filterApiManager.fetchLeadsQuery.isLoading}
          />
        </CardContent>
        {isShowPagination() && (
          <CardPagination
            onClick={filterManager.state.setPaginationIndex}
            page={filterManager.state.paginationIndex}
            totalPages={
              filterApiManager.fetchLeadsQuery.data?.responseData.meta
                .totalPages || 1
            }
          />
        )}
      </Card>
    </div>
  );
}

export default LeadsView;
