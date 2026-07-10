"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import ParticipantsTableFilter from "./_components/ParticipantsTablelFilter";
import ParticipantsTableList from "./_components/ParticipantsTableList";
import { useParticipantsApi } from "./hooks/useParticipantsApi";

function ParticipantsView() {
  const queryClient = useQueryClient();
  const { fetchParticipantsQuery, state } = useParticipantsApi();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const data = fetchParticipantsQuery.data ?? [];

  const participantsApi = useMemo(
    () => new apiGateway.crm.rfq.participants.RfqParticipantsApi(apiClientCaller),
    [],
  );

  const someOnScreenSelected = useMemo(
    () => data.some((r) => selectedIds.has(String(r.id))),
    [data, selectedIds],
  );
  const allOnScreenSelected = useMemo(
    () =>
      data.length > 0 && data.every((r) => selectedIds.has(String(r.id))),
    [data, selectedIds],
  );

  const onToggleRow = useCallback((participantId: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(participantId);
      else next.delete(participantId);
      return next;
    });
  }, []);

  const selectAllOnScreen = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const r of data) {
        next.add(String(r.id));
      }
      return next;
    });
  }, [data]);

  const clearOnScreen = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const r of data) {
        next.delete(String(r.id));
      }
      return next;
    });
  }, [data]);

  const resyncMutation = useMutation({
    mutationFn: async (
      items: { loginId: string; workflowStatus: number }[],
    ) => {
      const res = await participantsApi.resyncKraFromCbricsParticipants({
        items,
      });
      return res.data;
    },
    onSuccess: (envelope) => {
      const results = envelope.responseData?.results ?? [];
      const updated = results.filter((r) => r.outcome === "updated").length;
      const skipped = results.filter((r) => r.outcome === "skipped").length;
      toast.success(
        `KRA resync finished: ${updated} updated, ${skipped} skipped.`,
      );
      void queryClient.invalidateQueries({
        queryKey: ["fetchParticipantsQuery"],
      });
      setSelectedIds(new Set());
    },
    onError: () => {
      toast.error("KRA resync failed. Try again or check the network.");
    },
  });

  const headerCheckboxState: boolean | "indeterminate" = allOnScreenSelected
    ? true
    : someOnScreenSelected
      ? "indeterminate"
      : false;

  return (
    <div className="mt-5">
      <Card>
        <ParticipantsTableFilter
          onSearchChange={state.setSearch}
          searchValue={state.search}
          workflowStatusChange={state.setWorkflowStatus}
          workflowStatusValue={state.workflowStatus}
          actualStatusChange={state.setActualStatus}
          actualStatusValue={state.actualStatus}
        />
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Click a row to open CBRICS manager with that participant&apos;s NSE id prefilled.
            Use checkboxes to resync KRA from CBRICS workflow (login id must match customer username; KYC must be VERIFIED).
          </p>
          <div className="flex flex-wrap items-center gap-3 px-1 py-1">
            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              role="presentation"
            >
              <Checkbox
                checked={headerCheckboxState}
                onCheckedChange={(v) => {
                  if (v === true) selectAllOnScreen();
                  else clearOnScreen();
                }}
              />
              <span className="text-sm text-muted-foreground">
                Select all on screen
              </span>
            </div>
            <Button
              type="button"
              size="sm"
              disabled={selectedIds.size === 0 || resyncMutation.isPending}
              onClick={() => {
                const items = data
                  .filter((r) => selectedIds.has(String(r.id)))
                  .map((r) => ({
                    loginId: r.loginId,
                    workflowStatus: r.workflowStatus,
                  }));
                if (items.length === 0) return;
                resyncMutation.mutate(items);
              }}
            >
              {resyncMutation.isPending ? "Resyncing…" : "Resync KRA status"}
            </Button>
            {selectedIds.size > 0 ? (
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} selected
              </span>
            ) : null}
          </div>
          <ParticipantsTableList
            data={data}
            isLoading={fetchParticipantsQuery.isFetching}
            selectedIds={selectedIds}
            onToggleRow={onToggleRow}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default ParticipantsView;
