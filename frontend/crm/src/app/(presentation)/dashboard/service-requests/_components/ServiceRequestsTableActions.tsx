"use client";

import { Button } from "@/components/ui/button";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import type { CrmServiceRequestRow } from "@root/apiGateway";
import type { UseMutationResult } from "@tanstack/react-query";
import Swal from "sweetalert2";

export default function ServiceRequestsTableActions({
  row,
  closeMutation,
  rejectMutation,
}: {
  row: CrmServiceRequestRow;
  closeMutation: UseMutationResult<unknown, Error, number, unknown>;
  rejectMutation: UseMutationResult<unknown, Error, number, unknown>;
}) {
  if (row.status !== "PENDING") {
    return null;
  }

  const handleClose = async () => {
    const result = await Swal.fire({
      title: "Close account?",
      text: "This will soft-delete the account (move to trash), mark it as closed, log the customer out, and block future logins. The account is not permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Close Account",
      confirmButtonColor: "#dc2626",
    });
    if (result.isConfirmed) {
      closeMutation.mutate(row.id);
    }
  };

  const handleReject = async () => {
    const result = await Swal.fire({
      title: "Reject request?",
      text: "The customer will be notified and may submit a new request.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Reject",
    });
    if (result.isConfirmed) {
      rejectMutation.mutate(row.id);
    }
  };

  return (
    <AllowOnlyView permissions={["edit:service_requests"]}>
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="destructive"
          onClick={handleClose}
          disabled={closeMutation.isPending}
        >
          Close Account
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReject}
          disabled={rejectMutation.isPending}
        >
          Reject
        </Button>
      </div>
    </AllowOnlyView>
  );
}
