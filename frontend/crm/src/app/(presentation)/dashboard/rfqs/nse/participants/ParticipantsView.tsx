"use client";
import { Card, CardContent } from "@/components/ui/card";
import CardPagination from "@/global/elements/table/CardPagination";
import ParticipantsTableList from "./_components/ParticipantsTableList";
import { useParticipantsApi } from "./hooks/useParticipantsApi";
import ParticipantsTableFilter from "./_components/ParticipantsTablelFilter";

function ParticipantsView() {
  const { fetchParticipantsQuery, state } = useParticipantsApi();
  const isShowPagination = () => {
    return (
      (fetchParticipantsQuery.data?.data?.responseData.data.length || 0) > 0 &&
      fetchParticipantsQuery.data?.data?.responseData.meta.totalPages != 1 &&
      !fetchParticipantsQuery.isPending
    );
  };
  return (
    <div className="mt-5">
      <Card>
        <ParticipantsTableFilter
          onSearchChange={state.setSearch}
          searchValue={state.search}
          statusChange={state.setWorkflowStatus}
          statusValue={state.workflowStatus}
        />
        <CardContent>
          <ParticipantsTableList
            data={fetchParticipantsQuery.data?.data.responseData.data || []}
            isLoading={fetchParticipantsQuery.isLoading}
          />
        </CardContent>
        {isShowPagination() && (
          <CardPagination
            onClick={(p) => {
              state.setPage(p);
            }}
            page={fetchParticipantsQuery.data?.data.responseData.meta.page || 1}
            totalPages={
              fetchParticipantsQuery.data?.data.responseData.meta.totalPages ||
              1
            }
          />
        )}
      </Card>
    </div>
  );
}

export default ParticipantsView;
