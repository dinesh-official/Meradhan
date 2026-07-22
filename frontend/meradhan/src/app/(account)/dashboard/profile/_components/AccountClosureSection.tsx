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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { queryClient } from "@/core/config/service-clients";
import apiGateway, { ApiError } from "@root/apiGateway";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

const serviceRequestsApi = new apiGateway.meradhan.customerServiceRequestsApi(
  apiClientCaller,
);

const isOtherReasonText = (text: string) =>
  text.trim().toLowerCase() === "other";

export default function AccountClosureSection() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reasonId, setReasonId] = useState<string>("");
  const [remark, setRemark] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const remarkRef = useRef<HTMLTextAreaElement>(null);
  const focusRemarkOnSelectClose = useRef(false);

  const reasonsQuery = useQuery({
    queryKey: ["closure-reasons"],
    queryFn: async () => {
      const res = await serviceRequestsApi.getReasons({ type: "CLOSURE" });
      return res.responseData ?? [];
    },
    enabled: dialogOpen,
  });

  const requestsQuery = useQuery({
    queryKey: ["my-closure-requests"],
    queryFn: async () => {
      const res = await serviceRequestsApi.getMyRequests({ type: "CLOSURE" });
      return res.responseData ?? [];
    },
  });

  const selectedReason = (reasonsQuery.data ?? []).find(
    (reason) => String(reason.id) === reasonId,
  );
  const isOtherReason = selectedReason
    ? isOtherReasonText(selectedReason.text)
    : false;

  const handleReasonChange = (value: string) => {
    setReasonId(value);
    const reason = (reasonsQuery.data ?? []).find(
      (item) => String(item.id) === value,
    );
    const selectedOther = reason ? isOtherReasonText(reason.text) : false;
    if (selectedOther) {
      focusRemarkOnSelectClose.current = true;
    } else {
      focusRemarkOnSelectClose.current = false;
      setRemark("");
    }
  };

  const latestRequest = requestsQuery.data?.[0];
  const isPending = latestRequest?.status === "PENDING";
  const isRejected = latestRequest?.status === "REJECTED";
  const canSubmit = !isPending;

  const createMutation = useMutation({
    mutationFn: async () => {
      const trimmedRemark = remark.trim();
      if (isOtherReason && !trimmedRemark) {
        throw new Error("Please enter additional comments");
      }
      return serviceRequestsApi.createRequest({
        type: "CLOSURE",
        reasonId: Number(reasonId),
        reasonRemark: isOtherReason ? trimmedRemark : undefined,
      });
    },
    onSuccess: () => {
      toast.success("Your closure request has been submitted. Our team will review it shortly.");
      setConfirmOpen(false);
      setDialogOpen(false);
      setReasonId("");
      setRemark("");
      setAcknowledged(false);
      queryClient.invalidateQueries({ queryKey: ["my-closure-requests"] });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.response?.data?.message ?? error.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to submit request");
      }
    },
  });

  const resetDialog = () => {
    setReasonId("");
    setRemark("");
    setAcknowledged(false);
    setConfirmOpen(false);
    focusRemarkOnSelectClose.current = false;
  };

  const proceedDisabled =
    !reasonId ||
    !acknowledged ||
    (isOtherReason && !remark.trim()) ||
    (isOtherReason && remark.length > 500) ||
    createMutation.isPending;

  if (process.env.NEXT_PUBLIC_ACCOUNT_CLOSURE_ENABLED === "false") {
    return null;
  }

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-base font-semibold text-gray-900">Account Management</h3>

      <div className="mt-4 rounded-lg border border-gray-200 p-5">
        <h4 className="text-sm font-semibold text-gray-900">Delete Account</h4>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-700">
          Before proceeding, please note that closing your account is permanent and cannot
          be reversed. Once closed, you will no longer be able to log in or use your
          account. Please note that your data will be deleted in line with regulatory
          requirements.
        </p>

        {isPending && (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Your account deletion request is pending review. You cannot submit another
            request while one is in progress.
          </div>
        )}

        {isRejected && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            Your previous account deletion request was not approved. You may submit a new
            request below.
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          className="mt-4 border-[#E85D4C] bg-white text-[#E85D4C] hover:bg-red-50 hover:text-[#D14A3A] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setDialogOpen(true)}
          disabled={!canSubmit}
        >
          Delete My Account
        </Button>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetDialog();
        }}
      >
        <DialogContent
          className="w-[calc(100%-2rem)] max-w-5xl rounded-3xl px-8 py-10 sm:max-w-5xl sm:px-12 sm:py-12"
          showCloseButton={false}
        >
          <div className="flex flex-col">
            <div className="flex items-center justify-center gap-4">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#F4511E] text-white">
                <AlertCircle className="size-6" />
              </div>
              <h2 className="text-md font-semibold tracking-tight text-gray-900 sm:text-3xl">
                Delete My Account
              </h2>
            </div>

            <p className="mt-4 text-justify text-base leading-snug text-gray-900">
              We are sad to see you go! Please help us understand why you want
              to close your account!
            </p>

            <p className="mt-7 text-justify text-base font-normal text-gray-900">
              Please select your reason for account deletion
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="space-y-2">
              <Label className="sr-only">Reason for closure</Label>
              <Select value={reasonId} onValueChange={handleReasonChange}>
                <SelectTrigger className="w-full rounded-lg border border-gray-200 shadow-none">
                  <SelectValue placeholder="Select Reason" />
                </SelectTrigger>
                <SelectContent
                  onCloseAutoFocus={(event) => {
                    if (!focusRemarkOnSelectClose.current) return;
                    // Stop Select from returning focus to the trigger.
                    event.preventDefault();
                    focusRemarkOnSelectClose.current = false;
                    // Defer until after React enables the textarea.
                    window.setTimeout(() => {
                      remarkRef.current?.focus();
                    }, 0);
                  }}
                >
                  {(reasonsQuery.data ?? []).map((reason) => (
                    <SelectItem key={reason.id} value={String(reason.id)}>
                      {reason.text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="sr-only">Additional comments</Label>
              <Textarea
                ref={remarkRef}
                value={remark}
                onChange={(e) => setRemark(e.target.value.slice(0, 500))}
                placeholder={
                  isOtherReason ? "Other reason" : "Additional Comments"
                }
                rows={4}
                disabled={!isOtherReason}
                className="min-h-[104px] rounded-lg border border-gray-200 px-5 py-4 text-base shadow-none placeholder:text-gray-400 focus-visible:ring-0 focus-visible:shadow-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60"
              />
              {isOtherReason && (
                <p className="text-right text-xs text-muted-foreground">
                  {remark.length}/500
                </p>
              )}
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="closure-ack"
                checked={acknowledged}
                onCheckedChange={(v) => setAcknowledged(v === true)}
                className="mt-1 shrink-0"
              />
              <Label
                htmlFor="closure-ack"
                className="flex-1 text-justify text-base font-normal leading-snug text-gray-900"
              >
                By clicking “Proceed,” I confirm that I have read and understood
                the account closure process and voluntarily request the deletion
                of my BondNest Capital India Securities Private Limited
                (MeraDhan) account. I understand that my login access will be
                permanently disabled.
                <br />
                <br />
                I also authorise MeraDhan to retain and store my information and
                records for the period required under applicable laws and
                regulatory requirements.
              </Label>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={proceedDisabled}
              className="h-11 min-w-[142px] rounded-lg bg-[#E85D4C] px-8 text-sm font-medium text-white hover:bg-[#D14A3A] disabled:opacity-50"
            >
              Proceed
            </Button>
            <Button
              onClick={() => setDialogOpen(false)}
              className="h-11 min-w-[158px] rounded-lg bg-[#0F4C81] px-8 text-sm font-medium text-white hover:bg-[#0C3D68]"
            >
              Delete Later
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!createMutation.isPending) {
            setConfirmOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm account deletion?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your account deletion request? Our
              team will review it, and once approved your login access will be
              permanently disabled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={createMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              disabled={createMutation.isPending}
              className="bg-[#E85D4C] text-white hover:bg-[#D14A3A]"
              onClick={(event) => {
                event.preventDefault();
                createMutation.mutate();
              }}
            >
              {createMutation.isPending ? "Submitting…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
