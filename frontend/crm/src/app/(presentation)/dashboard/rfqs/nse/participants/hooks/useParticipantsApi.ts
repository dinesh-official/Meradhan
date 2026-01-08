import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const useParticipantsApi = () => {
  const [search, setSearch] = useState("");
  const [workflowStatus, setWorkflowStatus] = useState<string | undefined>("1");
  const [page, setPage] = useState(1);

  const participantsApi =
    new apiGateway.crm.rfq.participants.RfqParticipantsApi(apiClientCaller);

  const fetchParticipantsQuery = useQuery({
    queryKey: ["fetchParticipantsQuery", search, workflowStatus, page],
    queryFn: async () => {
      return await participantsApi.getAllParticipants({
        page: page.toString(),
        search: search,
        workflowStatus: workflowStatus != "ALL" ? workflowStatus : undefined,
      });
    },
  });

  return {
    fetchParticipantsQuery,
    state: {
      search,
      setSearch,
      workflowStatus,
      setWorkflowStatus,
      page,
      setPage,
    },
  };
};
