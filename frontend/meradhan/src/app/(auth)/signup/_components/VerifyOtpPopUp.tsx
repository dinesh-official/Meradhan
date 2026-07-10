"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { memo, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { ApiError } from "@root/apiGateway";
import { ISignUpAuthFlow } from "../_hooks/useSignUpAuthFlow";
import { SignUPFormDataHook } from "../_hooks/useSignUpFormDataState";
import { useTrackUserVerifyFlowStore } from "../_hooks/useTrackUserVerifyFlowStore";
import CaptchaInput from "./CaptchaInput";
import { makeFullname } from "@/global/utils/formate";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const EMAIL_OTP_LEN = 6;
const MOBILE_OTP_LEN = 4;

/** Matches SignUpForm input styling */
const SIGNUP_INPUT_CLASS =
  "bg-muted py-4.5 border-none placeholder:text-[#7fabd2]";
const SIGNUP_MOBILE_INPUT_CLASS =
  "peer bg-muted py-5 ps-11 pe-12 border-none placeholder:text-[#7fabd2]";

function OtpField({
  label,
  value,
  onChange,
  maxLength,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <Box className="flex flex-col gap-2">
      <label className="font-medium text-[#1e3a5f] text-sm">{label}</label>
      <Input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) =>
          onChange(e.target.value.replace(/\D/g, "").slice(0, maxLength))
        }
        className={SIGNUP_INPUT_CLASS}
      />
    </Box>
  );
}

function Box({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={className}>{children}</div>;
}

function VerifyOtpPopUp({
  formData,
  signUpFlowKyc,
  onEmailUpdated,
  onPhoneUpdated,
}: {
  formData: SignUPFormDataHook["signUpFormData"];
  signUpFlowKyc: ISignUpAuthFlow;
  onEmailUpdated: (email: string) => void;
  onPhoneUpdated: (phone: string) => void;
}) {
  const {
    mode,
    email,
    mobile,
    emailOtp,
    mobileOtp,
    setEmailOtp,
    setMobileOtp,
    openOtpPopup,
    reset,
  } = useTrackUserVerifyFlowStore();
  const router = useRouter();
  const flowManager = signUpFlowKyc;

  const [showEmailEdit, setShowEmailEdit] = useState(false);
  const [showPhoneEdit, setShowPhoneEdit] = useState(false);
  const [editEmail, setEditEmail] = useState(formData.email);
  const [editPhone, setEditPhone] = useState(formData.mobile);
  const [emailEditError, setEmailEditError] = useState("");
  const [phoneEditError, setPhoneEditError] = useState("");
  const [emailCaptchaOk, setEmailCaptchaOk] = useState(false);
  const [mobileCaptchaOk, setMobileCaptchaOk] = useState(false);

  useEffect(() => {
    setEditEmail(formData.email);
  }, [formData.email]);

  useEffect(() => {
    setEditPhone(formData.mobile);
  }, [formData.mobile]);

  useEffect(() => {
    setEmailCaptchaOk(false);
  }, [email.showCaptcha]);

  useEffect(() => {
    setMobileCaptchaOk(false);
  }, [mobile.showCaptcha]);

  const fullName = useMemo(
    () =>
      makeFullname({
        firstName: formData.firstName,
        lastName: formData.lastName,
      }),
    [formData.firstName, formData.lastName],
  );

  const handleUpdateEmail = async () => {
    const parsed = z.email().safeParse(editEmail.trim());
    if (!parsed.success) {
      setEmailEditError("Please enter a valid email address");
      return;
    }
    if (parsed.data === formData.email) {
      setEmailEditError("This is already your registered email");
      return;
    }
    setEmailEditError("");
    if (!formData.id) {
      setEmailEditError("Account is not ready yet. Please submit the signup form again.");
      return;
    }
    try {
      const updated = await flowManager.updateSignupEmail({
        customerId: formData.id,
        newEmail: parsed.data,
        name: fullName,
      });
      onEmailUpdated(updated);
      setEditEmail(updated);
      setShowEmailEdit(false);
    } catch (error) {
      const msg =
        error instanceof ApiError
          ? error.response?.data?.message || error.message
          : error instanceof Error
            ? error.message
            : "Could not update email. Please try again.";
      setEmailEditError(msg);
      toast.error(msg);
    }
  };

  const handleUpdatePhone = async () => {
    const parsed = z
      .string()
      .regex(/^[5-9][0-9]{9}$/, "Enter a valid 10-digit mobile number")
      .safeParse(editPhone.trim());
    if (!parsed.success) {
      setPhoneEditError(
        parsed.error.issues[0]?.message ?? "Invalid phone number",
      );
      return;
    }
    if (parsed.data === formData.mobile) {
      setPhoneEditError("This is already your registered phone number");
      return;
    }
    setPhoneEditError("");
    if (!formData.id) {
      setPhoneEditError("Account is not ready yet. Please submit the signup form again.");
      return;
    }
    try {
      const updated = await flowManager.updateSignupPhone({
        customerId: formData.id,
        newPhone: parsed.data,
      });
      onPhoneUpdated(updated);
      setEditPhone(updated);
      setShowPhoneEdit(false);
    } catch (error) {
      const msg =
        error instanceof ApiError
          ? error.response?.data?.message || error.message
          : error instanceof Error
            ? error.message
            : "Could not update phone number. Please try again.";
      setPhoneEditError(msg);
      toast.error(msg);
    }
  };

  const canVerify =
    emailOtp.length === EMAIL_OTP_LEN &&
    mobileOtp.length === MOBILE_OTP_LEN &&
    !flowManager.isPending &&
    formData.id != null;

  return (
    <Dialog
      open={openOtpPopup}
      onOpenChange={(open) => {
        if (!open) {
          const confirm = window.confirm(
            "Are you sure you want to close this? If you close now, you won't be able to login on MeraDhan. To log in later, you will still need verify your account.",
          );
          if (confirm) {
            reset();
          }
        }
      }}
    >
      <DialogContent className="gap-0 overflow-hidden rounded-2xl border-[#c5d4e8] p-0 sm:max-w-md">
        <DialogHeader className="space-y-0 border-[#dce6f2] border-b px-6 py-5 text-left">
          <DialogTitle className="font-semibold text-[#1e3a5f] text-lg">
            Verify Email and Phone Number
          </DialogTitle>
        </DialogHeader>

        {mode === "support" ? (
          <Box className="space-y-5 px-6 py-6">
            <p className="text-[#1e3a5f] text-sm">
              We&apos;re here to help. You&apos;ve used all email and mobile OTP
              attempts. Please{" "}
              <a href="/contact-us" className="text-primary underline">
                contact us
              </a>{" "}
              to verify your account safely.
            </p>
            <Button className="w-full" onClick={() => router.push("/contact-us")}>
              Contact MeraDhan
            </Button>
          </Box>
        ) : (
          <Box className="flex flex-col px-6 py-6">
            <Box className="flex flex-col gap-5">
              {email.showCaptcha ? (
                <Box className="flex flex-col gap-2">
                  <p className="text-[#1e3a5f] text-sm">Email OTP expired</p>
                  <CaptchaInput onVerify={setEmailCaptchaOk} />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!emailCaptchaOk || flowManager.isPending}
                    onClick={() =>
                      flowManager.resendEmailOtp(formData.email, fullName)
                    }
                  >
                    Resend email OTP
                  </Button>
                </Box>
              ) : (
                <OtpField
                  label="Enter 6-digit OTP sent to your Email"
                  placeholder="Enter 6-digit OTP"
                  value={emailOtp}
                  onChange={setEmailOtp}
                  maxLength={EMAIL_OTP_LEN}
                  disabled={flowManager.isPending}
                />
              )}
              {email.successMessage && (
                <p className="text-green-600 text-xs">{email.successMessage}</p>
              )}
              {email.errorMessage && (
                <p className="text-red-600 text-xs">{email.errorMessage}</p>
              )}

              {mobile.showCaptcha ? (
                <Box className="flex flex-col gap-2">
                  <p className="text-[#1e3a5f] text-sm">Mobile OTP expired</p>
                  <CaptchaInput onVerify={setMobileCaptchaOk} />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!mobileCaptchaOk || flowManager.isPending}
                    onClick={() => flowManager.resendMobileOtp(formData.mobile)}
                  >
                    Resend mobile OTP
                  </Button>
                </Box>
              ) : (
                <OtpField
                  label="Enter 4-digit OTP sent to your Phone"
                  placeholder="Enter 4-digit OTP"
                  value={mobileOtp}
                  onChange={setMobileOtp}
                  maxLength={MOBILE_OTP_LEN}
                  disabled={flowManager.isPending}
                />
              )}
              {mobile.successMessage && (
                <p className="text-green-600 text-xs">{mobile.successMessage}</p>
              )}
              {mobile.errorMessage && (
                <p className="text-red-600 text-xs">{mobile.errorMessage}</p>
              )}

              {flowManager.timer.isActive && (
                <p className="text-center text-[#5a7a9a] text-xs">
                  OTP expires in {flowManager.timer.time}
                </p>
              )}
            </Box>

            <Button
              type="button"
              className="mt-6 h-11 w-full rounded-lg bg-[#0b2d5c] font-medium text-white hover:bg-[#0b2d5c]/90"
              disabled={!canVerify}
              onClick={() => flowManager.verifyBothSignupOtps(formData.id!)}
            >
              Verify
            </Button>

            <Box className="mt-5 space-y-2 text-center text-[#1e3a5f] text-sm">
              {!showEmailEdit ? (
                <p>
                  Incorrect Email ID?{" "}
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={() => {
                      setShowEmailEdit(true);
                      setShowPhoneEdit(false);
                      setEmailEditError("");
                    }}
                  >
                    Click here
                  </button>{" "}
                  to change it
                </p>
              ) : (
                <Box className="space-y-2 rounded-lg border border-[#dce6f2] bg-[#f7fafc] p-3 text-left">
                  <p className="font-medium text-xs">Update email address</p>
                  <Input
                    type="email"
                    placeholder="Email ID*"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value.toLowerCase())}
                    className={SIGNUP_INPUT_CLASS}
                  />
                  {emailEditError && (
                    <p className="text-red-600 text-xs">{emailEditError}</p>
                  )}
                  <Box className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="flex-1 bg-[#0b2d5c]"
                      disabled={flowManager.isPending}
                      onClick={handleUpdateEmail}
                    >
                      Save &amp; resend OTP
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowEmailEdit(false)}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              )}

              {!showPhoneEdit ? (
                <p>
                  Incorrect Phone Number?{" "}
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={() => {
                      setShowPhoneEdit(true);
                      setShowEmailEdit(false);
                      setPhoneEditError("");
                    }}
                  >
                    Click here
                  </button>{" "}
                  to change it
                </p>
              ) : (
                <Box className="space-y-2 rounded-lg border border-[#dce6f2] bg-[#f7fafc] p-3 text-left">
                  <p className="font-medium text-xs">Update phone number</p>
                  <Box className="relative">
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Mobile No*"
                      maxLength={10}
                      value={editPhone}
                      onChange={(e) =>
                        setEditPhone(
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      className={SIGNUP_MOBILE_INPUT_CLASS}
                    />
                    <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-gray-800 text-sm">
                      +91
                    </span>
                  </Box>
                  {phoneEditError && (
                    <p className="text-red-600 text-xs">{phoneEditError}</p>
                  )}
                  <Box className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="flex-1 bg-[#0b2d5c]"
                      disabled={flowManager.isPending}
                      onClick={handleUpdatePhone}
                    >
                      Save &amp; resend OTP
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowPhoneEdit(false)}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default memo(VerifyOtpPopUp);
