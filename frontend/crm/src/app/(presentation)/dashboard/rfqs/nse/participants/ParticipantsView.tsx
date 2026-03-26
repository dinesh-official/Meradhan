"use client";
import { Card, CardContent } from "@/components/ui/card";
import ParticipantsTableFilter from "./_components/ParticipantsTablelFilter";
import ParticipantsTableList from "./_components/ParticipantsTableList";
import { useParticipantsApi } from "./hooks/useParticipantsApi";

function ParticipantsView() {
  const { fetchParticipantsQuery, state } = useParticipantsApi();
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
            data={fetchParticipantsQuery.data?.data.responseData || []}
            isLoading={fetchParticipantsQuery.isLoading}
          />
        </CardContent>
        {/* {isShowPagination() && (
          <CardPagination
            onClick={(p) => {
              state.setPage(p);
            }}
            page={fetchParticipantsQuery.data?.data.responseData || 1}
            totalPages={
              fetchParticipantsQuery.data?.data.responseData.meta.totalPages ||
              1
            }
          />
        )} */}
      </Card>
    </div>
  );
}

export default ParticipantsView;
