"use client";

import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CbricsParticipantDetailCards } from "./_components/CbricsParticipantDetailCards";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function CbricsManagerView() {
  const api = useMemo(() => new apiGateway.crm.cbricsManager.CbricsManagerApi(apiClientCaller), []);
  const searchParams = useSearchParams();

  const [participantId, setParticipantId] = useState("");

  const idNum = participantId.trim() ? Number(participantId) : NaN;

  useEffect(() => {
    if (!searchParams) return;
    const pidRaw = searchParams.get("participantId") ?? searchParams.get("pid");
    if (!pidRaw) return;
    const n = Number(pidRaw.replace(/\D/g, ""));
    if (Number.isFinite(n) && n > 0) {
      setParticipantId(String(n));
    }
  }, [searchParams]);

  const participantQuery = useQuery({
    queryKey: ["cbrics-manager-participant", idNum],
    queryFn: async () => {
      const res = await api.getParticipantById(idNum);
      return res.data.responseData as Record<string, unknown>;
    },
    enabled: Number.isFinite(idNum) && idNum > 0,
    retry: false,
  });

  const p = participantQuery.data;

  return (
    <div className="flex flex-col gap-4 p-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>NSE live CBRICS</AlertTitle>
        <AlertDescription>
          Enter the unregistered-participant numeric id and load fresh data from NSE. Banks and DP lines come from this
          same response together with CRM profile badges.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live participant</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2 items-end">
            <div className="space-y-1">
              <Label htmlFor="pid">Participant id (NSE)</Label>
              <Input
                id="pid"
                placeholder="e.g. 72932"
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value.replace(/\D/g, ""))}
                className="w-48"
              />
            </div>
            <Button
              type="button"
              onClick={() => {
                if (!Number.isFinite(idNum) || idNum <= 0) return;
                void participantQuery.refetch();
              }}
              disabled={!Number.isFinite(idNum) || idNum <= 0 || participantQuery.isFetching}
            >
              {participantQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Open from RFQ Participants with query <span className="font-mono">?participantId=…</span> to pre-fill.
          </p>

          {participantQuery.isError && (
            <p className="text-sm text-destructive">
              {(participantQuery.error as Error)?.message || "Failed to load participant"}
            </p>
          )}

          {p && <CbricsParticipantDetailCards participant={p} />}
        </CardContent>
      </Card>
    </div>
  );
}
