"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import DataInfoLabel from "@/app/(account)/_components/cards/DataInfoLabel";
import SignInOtpInput from "@/app/(auth)/login/_components/SignInOtpInput";
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
import apiGateway, { GetCustomerResponseById } from "@root/apiGateway";

type Props = {
  profile: GetCustomerResponseById["responseData"];
};

export function EmailVerification({ profile }: Props) {
  const [openOtpPopup, setOpenOtpPopup] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [verifyAttemptCount, setVerifyAttemptCount] = useState(0);
  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState<string>("");

  const customerApi = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(
    apiClientCaller
  );

  const MAX_VERIFY_ATTEMPTS = 3;
  const MAX_RESEND_ATTEMPTS = 3;
  const isMaxVerifyAttemptsReached = verifyAttemptCount >= MAX_VERIFY_ATTEMPTS;

  /* ---------------- Send Verification Email ---------------- */
  const sendEmailMutation = useMutation({
    mutationKey: ["profile-email-verify", profile.id],
    mutationFn: async () => {
      const response = await customerApi.sendSignupEmailVerify({
        email: profile.emailAddress || "",
        name: profile.firstName + " " + profile.lastName,
      });
      return response;
    },
    onSuccess: (data) => {
      toast.success("Verification OTP sent");
      setOpenOtpPopup(true);
      // Store the token from response
      if (data.responseData?.token) {
        setOtpToken(data.responseData.token);
      }
      // Reset verification attempts when new email is sent
      setVerifyAttemptCount(0);
      setOtp("");
    },
    onError: () => {
      toast.error("Failed to send verification OTP");
    },
  });

  /* ---------------- Verify OTP ---------------- */
  const verifyOtpMutation = useMutation({
    mutationKey: ["verify-email-otp", profile.id],
    mutationFn: async () => {
      if (!otpToken) {
        throw new Error("OTP token not found. Please request a new OTP.");
      }
      return await customerApi.verifySignupOtp({
        otp,
        token: otpToken,
        verifyBy: "email",
        id: profile.id.toString(),
      });
    },
    onSuccess: () => {
      toast.success("Email verified successfully");
      setOpenOtpPopup(false);
      setVerifyAttemptCount(0);
      setOtp("");
      setOtpToken("");
      // Refresh the page or refetch profile data
      window.location.reload();
    },
    onError: (error: unknown) => {
      const newAttemptCount = verifyAttemptCount + 1;
      setVerifyAttemptCount(newAttemptCount);

      if (newAttemptCount >= MAX_VERIFY_ATTEMPTS) {
        toast.error(
          "Maximum verification attempts reached. Please request a new OTP."
        );
      } else {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Invalid or expired OTP";
        toast.error(
          `${errorMessage}. ${
            MAX_VERIFY_ATTEMPTS - newAttemptCount
          } attempt(s) remaining.`
        );
      }
      setOtp("");
    },
  });

  /* ---------------- Resend OTP ---------------- */
  const resendOtpMutation = useMutation({
    mutationKey: ["resend-email-otp", profile.id, resendCount],
    mutationFn: async () => {
      const response = await customerApi.sendSignupEmailVerify({
        email: profile.emailAddress || "",
        name: profile.firstName + " " + profile.lastName,
      });
      return response;
    },
    onSuccess: () => {
      toast.success("OTP resent successfully");
      setResendCount((c) => c + 1);
      // Store the new token from response
      setVerifyAttemptCount(0);
      setOtp("");
    },
    onError: () => {
      toast.error("Failed to resend OTP");
    },
  });

  return (
    <DataInfoLabel
      title="Email"
      status={profile.utility.isEmailVerified ? "SUCCESS" : undefined}
      showStatus
      statusLabel={
        !profile.utility.isEmailVerified && (
          <span
            className="text-secondary underline cursor-pointer"
            onClick={() => sendEmailMutation.mutate()}
          >
            {sendEmailMutation.isPending ? "Sending..." : "Verify"}
          </span>
        )
      }
    >
      <p className="flex items-center gap-2 font-medium text-sm">
        {profile.emailAddress || "--"}
      </p>

      <Dialog open={openOtpPopup} onOpenChange={setOpenOtpPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter OTP</DialogTitle>
            <DialogDescription>
              Please enter the OTP sent to your email address.
              {verifyAttemptCount > 0 && !isMaxVerifyAttemptsReached && (
                <span className="block mt-1 text-sm text-destructive">
                  {MAX_VERIFY_ATTEMPTS - verifyAttemptCount} attempt(s)
                  remaining
                </span>
              )}
              {isMaxVerifyAttemptsReached && (
                <span className="block mt-1 text-sm text-destructive font-medium">
                  Maximum verification attempts reached. Please request a new
                  OTP.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-5">
            <SignInOtpInput
              otp={otp}
              setOtp={(newOtp) => {
                if (!isMaxVerifyAttemptsReached) {
                  setOtp(newOtp);
                }
              }}
              length={6}
            />
          </div>

          <DialogFooter>
            <Button
              className="w-full"
              disabled={
                otp.length !== 6 ||
                verifyOtpMutation.isPending ||
                isMaxVerifyAttemptsReached
              }
              onClick={() => {
                if (isMaxVerifyAttemptsReached) {
                  toast.error(
                    "Maximum verification attempts reached. Please request a new OTP."
                  );
                  return;
                }
                verifyOtpMutation.mutate();
              }}
            >
              {verifyOtpMutation.isPending
                ? "Verifying..."
                : isMaxVerifyAttemptsReached
                ? "Max Attempts Reached"
                : "Verify OTP"}
            </Button>
          </DialogFooter>

          <Button
            variant="link"
            disabled={
              resendCount >= MAX_RESEND_ATTEMPTS || resendOtpMutation.isPending
            }
            onClick={() => {
              if (resendCount >= MAX_RESEND_ATTEMPTS) {
                toast.error("Maximum resend attempts reached");
                return;
              }
              resendOtpMutation.mutate();
            }}
          >
            Resend OTP ({MAX_RESEND_ATTEMPTS - resendCount} left)
          </Button>
        </DialogContent>
      </Dialog>
    </DataInfoLabel>
  );
}
