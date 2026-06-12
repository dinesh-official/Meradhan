"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import OtpInput from "@/global/elements/inputs/OtpInput";
import { useTimer } from "@/hooks/useTimer";
import apiGateway from "@root/apiGateway";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Channel = "mobile" | "email";

const COPY: Record<
  Channel,
  {
    title: string;
    description: (target: string) => string;
    sendErr: string;
    verifyErr: string;
    sendSuccess: string;
    verifySuccess: string;
  }
> = {
  mobile: {
    title: "Verify mobile number",
    description: (target) =>
      `An OTP has been sent to the customer's registered mobile (${target}). Ask the customer to read it out and enter it below.`,
    sendErr: "Could not send mobile OTP. Try again.",
    verifyErr: "Mobile OTP verification failed.",
    sendSuccess: "OTP sent to customer's mobile.",
    verifySuccess: "Mobile number verified.",
  },
  email: {
    title: "Verify email address",
    description: (target) =>
      `An OTP has been sent to the customer's registered email (${target}). Ask the customer to read it out and enter it below.`,
    sendErr: "Could not send email OTP. Try again.",
    verifyErr: "Email OTP verification failed.",
    sendSuccess: "OTP sent to customer's email.",
    verifySuccess: "Email address verified.",
  },
};

const MAX_RESEND_ATTEMPTS = 3;
const RESEND_COOLDOWN_SECONDS = 180;

interface VerifyCustomerOtpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: number;
  channel: Channel;
}

/**
 * Shared confirmation dialog driving both the "Verify mobile" and "Verify
 * email" flows on the CRM customer profile page. Mirrors the meradhan
 * customer-side UX (`Tabs/PersonalDetails.tsx` → `MobileNoVerify` /
 * `EmailVerification`):
 *
 *  - Send → 6-digit OTP delivered to the customer's registered phone/email.
 *  - Confirm → admin types the code the customer reads aloud.
 *  - 180-second resend cooldown shown as `Resend OTP (mm:ss)`.
 *  - Max 3 resends per dialog session.
 *  - Closing the dialog resets all state (no stale token leaks).
 *
 * On success the dialog invalidates `["fetchCustomer", customerId]` so the
 * pill on the surrounding `CustomerProfileView` immediately flips to
 * "Verified".
 */
export function VerifyCustomerOtpDialog({
  open,
  onOpenChange,
  customerId,
  channel,
}: VerifyCustomerOtpDialogProps) {
  const queryClient = useQueryClient();
  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState("");
  /**
   * Channel the currently-held `otpToken` was issued for. Bound at every
   * `setOtpToken` so we can refuse to submit a mobile token to the email
   * verify endpoint (or vice versa) even if the dialog somehow gets
   * reused across channels without remount.
   */
  const [tokenChannel, setTokenChannel] = useState<Channel | null>(null);
  const [sentTo, setSentTo] = useState<string>("");
  const [resendCount, setResendCount] = useState(0);
  const [allowResend, setAllowResend] = useState(false);
  const { isActive, reset, start, time } = useTimer({
    duration: RESEND_COOLDOWN_SECONDS,
    onFinish() {
      setAllowResend(true);
    },
  });

  const copy = COPY[channel];

  const api = new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller);

  const resetAll = () => {
    setOtp("");
    setOtpToken("");
    setTokenChannel(null);
    setSentTo("");
    setResendCount(0);
    setAllowResend(false);
    reset(RESEND_COOLDOWN_SECONDS);
  };

  const sendOtpMutation = useMutation({
    mutationKey: ["crm-customer-otp-send", channel, customerId],
    mutationFn: async () => {
      // Capture the channel/customer at call time so the response can
      // never be applied to a different channel than it was issued for.
      const issuedFor = channel;
      const res =
        issuedFor === "mobile"
          ? await api.sendCustomerMobileVerifyOtp(customerId)
          : await api.sendCustomerEmailVerifyOtp(customerId);
      return { issuedFor, data: res.data.responseData };
    },
    onSuccess: ({ issuedFor, data }) => {
      // Late-arriving response for a channel the user has since switched
      // away from — drop it silently (the new channel will issue its own
      // send via the effect below).
      if (issuedFor !== channel) return;
      setOtpToken(data.otpToken);
      setTokenChannel(issuedFor);
      setSentTo(data.sentTo);
      setOtp("");
      setAllowResend(false);
      setResendCount((c) => c + 1);
      reset(RESEND_COOLDOWN_SECONDS);
      start();
      toast.success(copy.sendSuccess);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || copy.sendErr);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationKey: ["crm-customer-otp-verify", channel, customerId],
    mutationFn: async () => {
      const payload = { otp, token: otpToken };
      const res =
        channel === "mobile"
          ? await api.verifyCustomerMobileOtp(customerId, payload)
          : await api.verifyCustomerEmailOtp(customerId, payload);
      return res.data.responseData;
    },
    onSuccess: () => {
      toast.success(copy.verifySuccess);
      queryClient.invalidateQueries({
        queryKey: ["fetchCustomer", customerId],
      });
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || copy.verifyErr);
    },
  });

  // Auto-send on open OR on channel/customer change. Reset on close.
  // `channel` and `customerId` are in the deps so that a parent that
  // reuses the same dialog instance across channel switches (no
  // remount) is still safe — a channel flip wipes the stale token and
  // issues a fresh one.
  useEffect(() => {
    if (open) {
      resetAll();
      sendOtpMutation.mutate();
    } else {
      resetAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, channel, customerId]);

  const handleSubmit = () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP.");
      return;
    }
    if (!otpToken || tokenChannel !== channel) {
      toast.error("OTP session missing — please resend the OTP.");
      return;
    }
    verifyOtpMutation.mutate();
  };

  const handleResend = () => {
    if (resendCount >= MAX_RESEND_ATTEMPTS) {
      toast.error("Maximum resend attempts reached.");
      return;
    }
    if (isActive) return;
    sendOtpMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-medium">
            <ShieldCheck className="size-5 text-primary" />
            {copy.title}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {sendOtpMutation.isPending && !sentTo
              ? "Sending OTP to customer…"
              : sentTo
                ? copy.description(sentTo)
                : "Preparing OTP…"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <OtpInput
            otp={otp}
            setOtp={setOtp}
            length={6}
            disabled={
              verifyOtpMutation.isPending ||
              (sendOtpMutation.isPending && !sentTo)
            }
          />
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={
              verifyOtpMutation.isPending ||
              otp.length !== 6 ||
              !otpToken ||
              tokenChannel !== channel ||
              sendOtpMutation.isPending
            }
          >
            {verifyOtpMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Verifying…
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>
          <Button
            variant="link"
            type="button"
            className="w-full"
            disabled={
              sendOtpMutation.isPending ||
              isActive ||
              resendCount >= MAX_RESEND_ATTEMPTS ||
              !allowResend
            }
            onClick={handleResend}
          >
            {sendOtpMutation.isPending
              ? "Sending…"
              : resendCount >= MAX_RESEND_ATTEMPTS
                ? "Resend limit reached"
                : isActive
                  ? `Resend OTP (${time})`
                  : "Resend OTP"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
