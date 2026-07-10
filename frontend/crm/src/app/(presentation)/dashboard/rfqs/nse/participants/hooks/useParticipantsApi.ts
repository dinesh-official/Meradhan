import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway, { type ParticipantData } from "@root/apiGateway";
import {
  CBRICS_UNREG_WORKFLOW_STATUS_OPTIONS,
  type CbricsUnregisteredWorkflowStatus,
} from "@root/schema";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

export const useParticipantsApi = () => {
  const [search, setSearch] = useState("");
  const [workflowStatus, setWorkflowStatus] = useState<string>("ALL");
  const [actualStatus, setActualStatus] = useState<string>("ALL");

  const participantsApi = useMemo(
    () => new apiGateway.crm.rfq.participants.RfqParticipantsApi(apiClientCaller),
    []
  );

  const fetchParticipantsQuery = useQuery({
    queryKey: ["fetchParticipantsQuery", search.trim(), workflowStatus, actualStatus],
    queryFn: async (): Promise<ParticipantData[]> => {
      const q = { search: search.trim() || undefined };

      let rows: ParticipantData[];

      if (workflowStatus === "ALL") {
        const results = await Promise.all(
          CBRICS_UNREG_WORKFLOW_STATUS_OPTIONS.map((o) =>
            participantsApi.getCbricsParticipantsByWorkflow(o.code, q)
          )
        );
        const byId = new Map<number, ParticipantData>();
        for (const res of results) {
          for (const row of res.data.responseData?.participants ?? []) {
            byId.set(row.id, row);
          }
        }
        rows = Array.from(byId.values()).sort((a, b) => {
          const ta = new Date(String(a.updatedAt)).getTime();
          const tb = new Date(String(b.updatedAt)).getTime();
          return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
        });
      } else {
        const wf = Number(workflowStatus) as CbricsUnregisteredWorkflowStatus;
        const res = await participantsApi.getCbricsParticipantsByWorkflow(wf, q);
        rows = res.data.responseData?.participants ?? [];
      }

      if (actualStatus !== "ALL") {
        const code = Number(actualStatus);
        rows = rows.filter((row) => row.actualStatus === code);
      }

      return rows;
    },
  });

  return {
    fetchParticipantsQuery,
    state: {
      search,
      setSearch,
      workflowStatus,
      setWorkflowStatus,
      actualStatus,
      setActualStatus,
    },
  };
};
