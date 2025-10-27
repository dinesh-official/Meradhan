"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ISignUpAuthFlow } from "../_hooks/useSignUpAuthFlow";
import { SignUPFormDataHook } from "../_hooks/useSignUpFormDataState";
import { useTrackUserVerifyFlowStore } from "../_hooks/useTrackUserVerifyFlowStore";
import CaptchaInput from "./CaptchaInput";
import SignUpOtpInput from "./SignUpOtpInput";

function VerifyOtpPopUp({ formData ,signUpFlowKyc}: { formData: SignUPFormDataHook['signUpFormData'] , signUpFlowKyc:ISignUpAuthFlow  }) {
  const {
    currentStep,
    email,
    mobile,
    otp,
    setOtp,
    showCaptcha,
    openOtpPopup,
    reset,
  } = useTrackUserVerifyFlowStore();

  const flowManager = signUpFlowKyc;

  const [VerifyCaptcha, setVerifyCaptcha] = useState(false);

  useEffect(() => {
    setVerifyCaptcha(false);
  }, [showCaptcha, setVerifyCaptcha]);

  const genContent = useCallback(() => {
    if (showCaptcha) {
      return {
        title: "OTP Expired",
        text: "Oops! OTP expired. Please complete the CAPTCHA and click ‘Resend OTP’ to get a new one",
      };
    }
    if (currentStep == "email") {
      return {
        title: "Verify Email",
        text: "We’ve sent a One-Time Password (OTP) to your email address. Please check your email and enter the OTP to verify your account.",
        errorMessage: email.errorMessage,
        successMessage: email.successMessage,
      };
    } else if (currentStep == "mobile") {
      return {
        title: "Verify Mobile",
        text: "We’ve sent a One-Time Password (OTP) to your mobile number. Please check your phone and enter the OTP to verify your account.",
        errorMessage: mobile.errorMessage,
        successMessage: mobile.successMessage,
      };
    }

    return {
      title: "Max Limit Reached",
      text: "You have reached the maximum number of attempts to verify your account. Please try again later.",
    };
  }, [
    currentStep,
    email.errorMessage,
    mobile.errorMessage,
    mobile.successMessage,
    email.successMessage,
    showCaptcha,
  ]);

  const content = useMemo(() => genContent(), [genContent]);

  return (
    <Dialog
      open={openOtpPopup}
      onOpenChange={(e) => {
        if (!e) {
          const confirm = window.confirm(
            "Are you sure you want to close this dialog?"
          );
          if (confirm) {
            reset();
          }
        }
      }}
    >
      <DialogContent className="p-0">
        <DialogHeader className="p-4 px-5 border-gray-200 border-b">
          <p className="font-medium text-lg">{content.title}</p>
        </DialogHeader>
        <div className="flex flex-col gap-3.5 px-5">
          <p className="text-green-600">{content.successMessage}</p>
          <p className="text-gray-700 text-sm">{content.text}</p>
          {currentStep != "support" &&
            (showCaptcha ? (
              <CaptchaInput onVerify={(e) => setVerifyCaptcha(e)} />
            ) : (
              <SignUpOtpInput otp={otp} setOtp={setOtp} />
            ))}

          <div>
            {flowManager.timer.isActive && <p>{flowManager.timer.time}</p>}
            {content.errorMessage && (
              <p className="text-red-600 text-sm">{content.errorMessage}</p>
            )}
          </div>
        </div>
        <DialogFooter className="p-5 border-gray-200 border-t">
          {!showCaptcha ? (
            <Button
              className="w-full"
              disabled={otp.length < 4 || flowManager.isPending}
              onClick={() =>
                flowManager.verifySignupOtp({
                  emailId: formData.email,
                  firstName: formData.firstName,
                  lastName: formData.lastName,
                  password: formData.password,
                  phoneNo: formData.mobile,
                  termsAccepted: formData.isAcceptedTerms,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  userType: formData.userType as any,
                  whatsAppNo: formData.mobile,
                  whatsAppNotificationAllow:
                    formData.isAcceptedWhatsapp,
                })
              }
            >
              Verify Email
            </Button>
          ) : (
            <Button
              disabled={!VerifyCaptcha}
              className="w-full"
              onClick={() =>
                flowManager.sendVerifyOtp({
                  emailId: formData.email,
                  mobile: formData.mobile,
                  name:
                    formData.firstName +
                    " " +
                    formData.lastName,
                })
              }
            >
              Resend OTP
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default memo(VerifyOtpPopUp);
