"use client";

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
import { AlertCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const serviceRequestsApi = new apiGateway.meradhan.customerServiceRequestsApi(
  apiClientCaller,
);

export default function AccountClosureSection() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reasonId, setReasonId] = useState<string>("");
  const [remark, setRemark] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

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

  const latestRequest = requestsQuery.data?.[0];
  const isPending = latestRequest?.status === "PENDING";
  const isRejected = latestRequest?.status === "REJECTED";
  const canSubmit = !isPending;

  const createMutation = useMutation({
    mutationFn: async () => {
      return serviceRequestsApi.createRequest({
        type: "CLOSURE",
        reasonId: Number(reasonId),
        reasonRemark: remark.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Your closure request has been submitted. Our team will review it shortly.");
      setDialogOpen(false);
      setReasonId("");
      setRemark("");
      setAcknowledged(false);
      queryClient.invalidateQueries({ queryKey: ["my-closure-requests"] });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.response?.data?.message ?? error.message);
      } else {
        toast.error("Failed to submit request");
      }
    },
  });

  const resetDialog = () => {
    setReasonId("");
    setRemark("");
    setAcknowledged(false);
  };

  const submitDisabled =
    !reasonId || !acknowledged || remark.length > 500 || createMutation.isPending;

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
          className="max-w-5xl rounded-3xl px-8 py-10 sm:px-12 sm:py-12"
          showCloseButton={false}
        >
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-4">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#F4511E] text-white">
                <AlertCircle className="size-6" />
              </div>
              <h2 className="text-md font-semibold tracking-tight text-gray-900 sm:text-3xl">
                Delete My Account
              </h2>
            </div>

            <p className="mt-4 max-w-3xl text-center text-base leading-snug text-gray-900">
              We are sad to see you go! Please help us understand why you want
              to close your account!
            </p>

            <p className="mt-7 text-center text-base font-normal text-gray-900">
              Please select your reason for account deletion
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="space-y-2">
              <Label className="sr-only">Reason for closure</Label>
              <Select value={reasonId} onValueChange={setReasonId}>
                <SelectTrigger className="h-12 rounded-lg border border-gray-200 px-5 text-left text-base text-gray-500 [&_svg]:hidden">
                  <SelectValue placeholder="Select Reason" />
                  <ChevronDown className="size-5 text-black" />
                </SelectTrigger>
                <SelectContent>
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
                value={remark}
                onChange={(e) => setRemark(e.target.value.slice(0, 500))}
                placeholder="Additional Comments"
                rows={4}
                className="min-h-[104px] rounded-lg border border-gray-200 px-5 py-4 text-base placeholder:text-gray-400"
              />
              <p className="text-right text-xs text-muted-foreground">
                {remark.length}/500
              </p>
            </div>

            <div className="flex items-start justify-center gap-3 px-2">
              <Checkbox
                id="closure-ack"
                checked={acknowledged}
                onCheckedChange={(v) => setAcknowledged(v === true)}
                className="mt-1"
              />
              <Label
                htmlFor="closure-ack"
                className="max-w-3xl text-center text-base font-normal leading-snug text-gray-900"
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
              variant="outline"
              onClick={() => createMutation.mutate()}
              disabled={submitDisabled}
              className="h-11 min-w-[142px] rounded-lg border-[#E85D4C] px-8 text-sm font-medium text-[#E85D4C] hover:bg-red-50 hover:text-[#D14A3A]"
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
    </div>
  );
}
