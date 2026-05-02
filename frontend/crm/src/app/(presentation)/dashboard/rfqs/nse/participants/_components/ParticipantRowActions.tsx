"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway, { type ParticipantData } from "@root/apiGateway";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Send } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { buildCbricsUnregUpdateBodyFromLive } from "../_utils/cbricsUnregUpdatePayload";

const RETURNED_WORKFLOWS = new Set<number>([6, 16]);

export function ParticipantRowActions({ row }: { row: ParticipantData }) {
  const queryClient = useQueryClient();
  const [pushOpen, setPushOpen] = useState(false);
  const cbricsManager = useMemo(
    () => new apiGateway.crm.cbricsManager.CbricsManagerApi(apiClientCaller),
    []
  );

  const canPushUpdate = RETURNED_WORKFLOWS.has(Number(row.workflowStatus));

  const pushUpdateMutation = useMutation({
    mutationFn: async () => {
      const liveRes = await cbricsManager.getParticipantById(row.id);
      const live = liveRes.data.responseData as Record<string, unknown> | undefined;
      if (!live || typeof live !== "object") {
        throw new Error("Could not load live participant from NSE.");
      }
      const body = buildCbricsUnregUpdateBodyFromLive(live);
      const post = await cbricsManager.postParticipantUpdate(row.id, body);
      return post.data.responseData;
    },
    onSuccess: () => {
      toast.success("Registration update submitted to NSE.");
      void queryClient.invalidateQueries({ queryKey: ["fetchParticipantsQuery"] });
      setPushOpen(false);
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Update failed");
    },
  });

  const managerHref = `/dashboard/tools/cbrics-manager?participantId=${row.id}` as Route;

  return (
    <div
      className="flex flex-wrap items-center justify-end gap-1.5"
      role="presentation"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Button type="button" variant="outline" size="sm" className="h-8 gap-1 px-2" asChild>
        <Link href={managerHref} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="size-3.5" aria-hidden />
          CBRICS
        </Link>
      </Button>

      {canPushUpdate ? (
        <AlertDialog open={pushOpen} onOpenChange={setPushOpen}>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 gap-1 px-2"
              disabled={pushUpdateMutation.isPending}
            >
              <Send className="size-3.5" aria-hidden />
              Push update
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Re-submit registration to NSE?</AlertDialogTitle>
              <AlertDialogDescription>
                Fetches the latest record for participant id{" "}
                <span className="font-mono">{row.id}</span> and calls CBRICS{" "}
                <span className="font-mono">/unreg/update</span>. Allowed only when workflow is
                Returned (6) or Returned by checker (16).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
              <Button
                type="button"
                disabled={pushUpdateMutation.isPending}
                onClick={() => void pushUpdateMutation.mutate()}
              >
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  );
}
