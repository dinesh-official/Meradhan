"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import LabelView from "@/global/elements/wrapper/LabelView";
import StatusBadge from "@/global/elements/wrapper/badges/StatusBadge";
import apiGateway from "@root/apiGateway";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { toast } from "sonner";

const REKYC_CONFIRM_WORD = "confirm";

interface CustomerOverViewCardProps {
  name: string;
  customerSince: string;
  kycStatus: string;
  kraStatus: string;
  userId: number;
}
function CustomerOverViewCard(
  customerOverViewCardData: CustomerOverViewCardProps
) {
  const apiGate = new apiGateway.meradhan.customerKycApi.CustomerKycApi(
    apiClientCaller,
  );
  const queryClient = useQueryClient();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [rekycToken, setRekycToken] = useState<string | null>(null);

  const requestOtpMutate = useMutation({
    mutationKey: ["rekyc-request-otp"],
    mutationFn: async () => {
      const res = await apiGate.requestRekycOtp(customerOverViewCardData.userId);
      return res.responseData?.token ?? null;
    },
    onSuccess(token) {
      if (token) {
        setRekycToken(token);
        setOtpValue("");
        setConfirmDialogOpen(false);
        setConfirmText("");
        setOtpDialogOpen(true);
        toast.success("OTP sent to your registered email");
      }
    },
    onError() {
      toast.error("Failed to send OTP. Check your email is set in CRM.");
    },
  });

  const confirmRekycMutate = useMutation({
    mutationKey: ["rekyc-confirm"],
    mutationFn: async () => {
      if (!rekycToken || !otpValue.trim())
        throw new Error("OTP is required");
      return await apiGate.confirmRekyc({ token: rekycToken, otp: otpValue.trim() });
    },
    onSuccess() {
      toast.success("ReKYC applied successfully");
      setOtpDialogOpen(false);
      setRekycToken(null);
      setOtpValue("");
      queryClient.invalidateQueries({ queryKey: ["customer"] });
    },
    onError() {
      toast.error("Invalid OTP or expired. Request a new OTP.");
    },
  });

  const handleRequestRekyc = () => {
    setConfirmText("");
    setConfirmDialogOpen(true);
  };

  const handleConfirmWordSubmit = () => {
    if (confirmText.trim().toLowerCase() !== REKYC_CONFIRM_WORD) {
      toast.error(`Type "${REKYC_CONFIRM_WORD}" to confirm`);
      return;
    }
    requestOtpMutate.mutate();
  };

  const handleConfirmOtp = () => {
    if (!otpValue.trim()) {
      toast.error("Enter the 6-digit OTP from your email");
      return;
    }
    confirmRekycMutate.mutate();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Customer Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="gap-5 grid grid-cols-2 md:grid-cols-4">
            <LabelView title="Customer Name">
              <p className="text-sm">{customerOverViewCardData.name}</p>
            </LabelView>
            <LabelView title="Current KYC Status">
              <div className="flex justify-start items-center gap-3">
                <StatusBadge value={customerOverViewCardData.kycStatus} />
                {customerOverViewCardData.kycStatus !== "PENDING" && customerOverViewCardData.kycStatus !== "RE_KYC" &&
                  !confirmRekycMutate.data && (
                    <p
                      className="text-xs cursor-pointer text-primary"
                      onClick={
                        requestOtpMutate.isPending
                          ? undefined
                          : handleRequestRekyc
                      }
                    >
                      {requestOtpMutate.isPending
                        ? "Sending OTP..."
                        : "Request ReKyc"}
                    </p>
                  )}
              </div>
            </LabelView>
            <LabelView title="Current KRA Status">
              <StatusBadge
                value={customerOverViewCardData?.kraStatus || "Not Started"}
              />
            </LabelView>
            <LabelView title="Customer Since">
              <p className="text-sm">{customerOverViewCardData.customerSince}</p>
            </LabelView>
          </div>
        </CardContent>
      </Card>

      {/* Popup 1: Type "confirm" to proceed */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm ReKYC request</DialogTitle>
            <DialogDescription>
              To request ReKYC for this customer, type <strong>{REKYC_CONFIRM_WORD}</strong> below.
              An OTP will then be sent to your registered CRM email to complete the request.
            </DialogDescription>
          </DialogHeader>
          <div className="gap-2 py-4">
            <Input
              placeholder={`Type "${REKYC_CONFIRM_WORD}" to continue`}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={requestOtpMutate.isPending}
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={requestOtpMutate.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmWordSubmit}
              disabled={
                confirmText.trim().toLowerCase() !== REKYC_CONFIRM_WORD ||
                requestOtpMutate.isPending
              }
            >
              {requestOtpMutate.isPending ? "Sending OTP..." : "Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Popup 2: Enter OTP from email */}
      <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm ReKYC by email</DialogTitle>
            <DialogDescription>
              A 6-digit OTP has been sent to your registered CRM email. Enter it
              below to confirm and apply ReKYC for this customer. This prevents
              accidental requests.
            </DialogDescription>
          </DialogHeader>
          <div className="gap-2 py-4">
            <Input
              placeholder="Enter 6-digit OTP"
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              className="font-mono text-center text-lg tracking-widest"
              disabled={confirmRekycMutate.isPending}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOtpDialogOpen(false)}
              disabled={confirmRekycMutate.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmOtp}
              disabled={!otpValue.trim() || otpValue.length < 6 || confirmRekycMutate.isPending}
            >
              {confirmRekycMutate.isPending ? "Confirming..." : "Confirm ReKYC"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CustomerOverViewCard;
