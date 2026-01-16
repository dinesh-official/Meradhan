"use client";

import Link from "next/link";
import { FaFacebook, FaMicrosoft, FaUser } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import ErrorBox from "../_components/ErrorBox";
import PasswordInput from "../_components/PasswordInput";
import SignInOtpInput from "./_components/SignInOtpInput";

import { useLoginDataStore } from "./_hooks/useLoginDataStore";
import { ILoginFormHook, useLoginFormHook } from "./_hooks/useLoginFormHook";
import { signIn } from "next-auth/react";
import { sanitizeStrapiHTML } from "@/global/utils/html-sanitizer";
import { useEffect } from "react";

/* ---------------------------------------------------------
 * 🔹 Helper Component: Social Login Buttons
 * --------------------------------------------------------- */
const SocialLoginButtons = () => (
  <>
    <p className="py-3 text-center">Or continue with</p>

    <div className="gap-3 lg:gap-5 grid md:grid-cols-3">
      <Button
        variant="outlineGray"
        className="w-full"
        onClick={() => signIn("google", { redirect: false })}
      >
        <FcGoogle /> Google
      </Button>

      <Button
        variant="outlineGray"
        className="w-full"
        onClick={() => signIn("facebook")}
      >
        <FaFacebook className="text-blue-700" /> Facebook
      </Button>

      <Button
        variant="outlineGray"
        className="w-full"
        onClick={() => signIn("microsoft-entra-id")}
      >
        <FaMicrosoft className="text-secondary" /> Hotmail
      </Button>
    </div>
  </>
);

/* ---------------------------------------------------------
 * 🔹 Helper Component: Email or Phone Input Field
 * --------------------------------------------------------- */
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
          onEnter(); // your function
        }
      }}
    />

    {/* Left Icon */}
    <div className="absolute inset-y-0 flex items-center ps-4 text-[#7fabd2] pointer-events-none start-0">
      <FaUser size={16} aria-hidden="true" />
    </div>

    {/* Error Message */}
    {error && <ErrorBox>{error}</ErrorBox>}
  </div>
);

/* ---------------------------------------------------------
 * 🔹 Helper Component: Verification Section (Password / OTP)
 * --------------------------------------------------------- */
const VerifyModeSection = ({
  formManager,
}: {
  formManager: ILoginFormHook;
}) => {
  const { state, setOtp, setPassword, setType, setRememberMe } =
    useLoginDataStore();

  // Switch between password and OTP modes
  const handleSwitchToOtp = () => {
    setType("otp");
    handleResendOtp();
  };

  // Trigger resend OTP functionality
  const handleResendOtp = () => {
    formManager.timer.reset();
    formManager.timer.pause();
    formManager.handleSendOtp();
  };

  return (
    <>
      {/* Password Field */}
      {state.type === "password" && (
        <PasswordInput
          placeholder="Password*"
          value={state.password}
          onChange={(e) => setPassword(e.target.value)}
        />
      )}

      {/* OTP Input */}
      {state.type === "otp" && (
        <div className="flex flex-col gap-1.5">
          <p>Please enter OTP</p>
          <SignInOtpInput
            otp={state.otp}
            setOtp={setOtp}
            onComplete={() => formManager.verifyOtpMutation.mutate()}
          />
        </div>
      )}

      {/* Extra Options */}
      <div className="flex justify-between items-center">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <Checkbox
            checked={state.rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
          />
          Remember Me
        </label>

        {state.type === "password" ? (
          // Password mode options
          <div className="flex gap-3 text-primary">
            <Link href="/forgot-password">Reset Password</Link> |
            <p className="cursor-pointer" onClick={handleSwitchToOtp}>
              Use OTP
            </p>
          </div>
        ) : (
          // OTP mode options
          <p
            className={`text-primary cursor-pointer ${
              !state.allowedResend && "opacity-60"
            }`}
            onClick={state.allowedResend ? handleResendOtp : undefined}
          >
            {state.allowedResend ? "Resend OTP" : formManager.timer.time}
          </p>
        )}
      </div>
    </>
  );
};

/* ---------------------------------------------------------
 * 🔹 Main Component: LoginForm
 * --------------------------------------------------------- */
function LoginForm() {
  const { state, setEmailOrPhoneNo } = useLoginDataStore();
  const formManager = useLoginFormHook();

  const {
    errors,
    handleSignInRequest,
    requestLoginMutation,
    handleSignInWithPassword,
    signInWithPasswordMutation,
    verifyOtpMutation,
    handleVerifyOtp,
  } = formManager;

  // Derived state
  const isVerifyMode = state.mode === "verify";
  const isPasswordLogin = state.type === "password";
  const isOtpLogin = state.type === "otp";

  // Handle "Continue" button click
  const handleContinue = () => handleSignInRequest();

  // Handle resend email verification click using event delegation
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      console.log("handleClick");

      const target = e.target as HTMLElement;
      // Check if the clicked element is the resend link or a child of it
      const resendElement = target.closest("#resend-email-verification");
      if (resendElement) {
        e.preventDefault();
        e.stopPropagation();
        formManager.handleResendEmailVerification();
      }
    };

    // Use event delegation on document to catch clicks on dynamically added elements
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [formManager]);

  return (
    <div className="flex flex-col gap-3.5">
      {/* ---------------------------------------------------
       * Welcome Message
       * --------------------------------------------------- */}
      <p>
        {/* Welcome{" "}
        {requestLoginMutation.data?.responseData?.id ? (
          <span className="font-semibold">
            {requestLoginMutation.data?.responseData?.firstName}{" "}
            {requestLoginMutation.data?.responseData?.lastName}!
          </span>
        ) : (
          "Back!"
        )} */}
        Sign in to your account
      </p>

      {/* ---------------------------------------------------
       * OTP Attempt Limit
       * --------------------------------------------------- */}
      {state.currentOtpTry < state.maxOtpTry ? (
        <>
          {/* Email / Phone Input */}
          <EmailOrPhoneInput
            value={state.emailOrPhoneNo}
            onChange={(e) => setEmailOrPhoneNo(e.target.value.toLowerCase())}
            readOnly={isVerifyMode}
            error={errors?.emailOrPhone}
            onEnter={handleContinue}
          />

          {/* Verification Section (Password / OTP) */}
          {isVerifyMode && <VerifyModeSection formManager={formManager} />}

          {/* ---------------------------------------------------
           * Action Buttons
           * --------------------------------------------------- */}
          {isVerifyMode ? (
            <>
              {/* OTP Login */}
              {isOtpLogin && (
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
              )}

              {/* Password Login */}
              {isPasswordLogin && (
                <Button
                  disabled={
                    requestLoginMutation.isPending ||
                    !state.password ||
                    signInWithPasswordMutation.isPending
                  }
                  onClick={handleSignInWithPassword}
                >
                  Login Now
                </Button>
              )}
            </>
          ) : (
            // Continue button before verification mode
            <Button
              onClick={handleContinue}
              disabled={requestLoginMutation.isPending}
            >
              Continue
            </Button>
          )}

          {/* ---------------------------------------------------
           * Status Messages
           * --------------------------------------------------- */}
          {state.errorMessage && (
            <p
              className="text-red-600 text-sm"
              dangerouslySetInnerHTML={{
                __html: sanitizeStrapiHTML(state.errorMessage),
              }}
            />
          )}
          {state.successMessage && (
            <p
              className="text-green-600 text-sm"
              dangerouslySetInnerHTML={{
                __html: sanitizeStrapiHTML(state.successMessage),
              }}
            />
          )}
        </>
      ) : (
        /* ---------------------------------------------------
         * Max OTP Attempt Message
         * --------------------------------------------------- */
        <div className="flex flex-col gap-5 py-8">
          <p className="px-5 font-medium text-red-600 text-center">
            You have reached the maximum number of attempts. Please try again
            later.
          </p>

          <p className="px-20 text-sm text-center">
            Please contact our support team for further assistance.{" "}
            <Link
              href="/contact-us"
              className="text-primary text-center underline"
            >
              Contact Us
            </Link>
          </p>
        </div>
      )}

      {/* ---------------------------------------------------
       * Social Login Buttons
       * --------------------------------------------------- */}
      {/* <SocialLoginButtons /> */}
    </div>
  );
}

export default LoginForm;
