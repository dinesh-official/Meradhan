"use client";

import { FaUser } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import ErrorBox from "../_components/ErrorBox";
import SignInOtpInput from "./_components/SignInOtpInput";
import LoginAccountActivationPopUp from "./_components/LoginAccountActivationPopUp";
import LoginTwoFactorDialog from "./_components/LoginTwoFactorDialog";

import { useLoginDataStore } from "./_hooks/useLoginDataStore";
import { ILoginFormHook, useLoginFormHook } from "./_hooks/useLoginFormHook";
import { sanitizeStrapiHTML } from "@/global/utils/html-sanitizer";
import { useEffect } from "react";
import Link from "next/link";

const EmailOrPhoneInput = ({
  value,
  onChange,
  error,
  readOnly,
  onEnter,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  readOnly: boolean;
  onEnter: () => void;
}) => (
  <div className="relative">
    <Input
      className="peer text-sm  bg-muted py-5 ps-12 border-none placeholder:text-[#7fabd2]"
      placeholder="Email or Phone Number"
      type="email"
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onEnter();
        }
      }}
    />

    <div className="absolute inset-y-0 flex items-center ps-4 text-[#7fabd2] pointer-events-none start-0">
      <FaUser size={16} aria-hidden="true" />
    </div>

    {error && <ErrorBox>{error}</ErrorBox>}
  </div>
);

const VerifyOtpSection = ({
  formManager,
}: {
  formManager: ILoginFormHook;
}) => {
  const { state, setOtp, setRememberMe } = useLoginDataStore();

  const handleResendOtp = () => {
    formManager.timer.reset();
    formManager.timer.pause();
    formManager.handleResendOtp();
  };

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <p>Please enter OTP</p>
        <SignInOtpInput
          otp={state.otp}
          setOtp={setOtp}
          onComplete={() => formManager.verifyOtpMutation.mutate()}
        />
      </div>

      <div className="flex justify-between items-center">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <Checkbox
            checked={state.rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
          />
          Remember Me
        </label>

        <p
          className={`text-primary cursor-pointer ${
            !state.allowedResend && "opacity-60"
          }`}
          onClick={state.allowedResend ? handleResendOtp : undefined}
        >
          {state.allowedResend ? "Resend OTP" : formManager.timer.time}
        </p>
      </div>
    </>
  );
};

function LoginForm() {
  const { state, setEmailOrPhoneNo } = useLoginDataStore();
  const formManager = useLoginFormHook();

  const {
    errors,
    handleSignInRequest,
    requestLoginMutation,
    verifyOtpMutation,
    handleVerifyOtp,
  } = formManager;

  const isVerifyMode = state.mode === "verify";
  const isActivationMode = state.mode === "account_activation";

  const handleContinue = () => handleSignInRequest();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const resendElement = target.closest("#resend-email-verification");
      if (resendElement) {
        e.preventDefault();
        e.stopPropagation();
        formManager.handleResendEmailVerification();
      }
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [formManager]);

  return (
    <div className="flex flex-col gap-3.5">
      <p>Sign in to your account</p>

      {state.currentOtpTry < state.maxOtpTry ? (
        <>
          <EmailOrPhoneInput
            value={state.emailOrPhoneNo}
            onChange={(e) => setEmailOrPhoneNo(e.target.value.toLowerCase())}
            readOnly={isVerifyMode || isActivationMode}
            error={errors?.emailOrPhone}
            onEnter={handleContinue}
          />

          {isVerifyMode && <VerifyOtpSection formManager={formManager} />}

          {isActivationMode ? null : isVerifyMode ? (
            <Button
              disabled={
                requestLoginMutation.isPending ||
                state.otp.length !== 4 ||
                verifyOtpMutation.isPending
              }
              onClick={handleVerifyOtp}
            >
              Login Now
            </Button>
          ) : (
            <Button
              onClick={handleContinue}
              disabled={requestLoginMutation.isPending}
            >
              Continue
            </Button>
          )}

          {!isActivationMode && !state.twoFactorDialogOpen && state.errorMessage && (
            <p
              className="text-red-600 text-sm"
              dangerouslySetInnerHTML={{
                __html: sanitizeStrapiHTML(state.errorMessage),
              }}
            />
          )}
          {!isActivationMode && !state.twoFactorDialogOpen && state.successMessage && (
            <p
              className="text-green-600 text-sm"
              dangerouslySetInnerHTML={{
                __html: sanitizeStrapiHTML(state.successMessage),
              }}
            />
          )}
        </>
      ) : (
        <div className="flex flex-col gap-5 py-8">
          <p className="px-5 font-medium text-red-600 text-center">
            You have reached the maximum number of attempts. Please try again
            later.
          </p>

          <p className="px-20 text-sm text-center">
            Please contact our support team for further assistance.{" "}
            <Link
              href="/contact-us"
              title="Contact Us"
              aria-label="Contact Us"
              className="text-primary text-center underline"
            >
              Contact Us
            </Link>
          </p>
        </div>
      )}

      <LoginAccountActivationPopUp formManager={formManager} />
      <LoginTwoFactorDialog formManager={formManager} />
    </div>
  );
}

export default LoginForm;
