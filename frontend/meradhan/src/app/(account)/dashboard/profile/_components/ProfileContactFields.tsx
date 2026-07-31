"use client";

import DataInfoLabel from "@/app/(account)/_components/cards/DataInfoLabel";
import SignInOtpInput from "@/app/(auth)/login/_components/SignInOtpInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/core/config/service-clients";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useTimer } from "@/hooks/useTimer";
import apiGateway, { GetCustomerResponseById } from "@root/apiGateway";
import { useMutation } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import toast from "react-hot-toast";
import { FaEdit } from "react-icons/fa";

type ProfileContactFieldsProps = {
  profile: GetCustomerResponseById["responseData"];
  variant?: "individual" | "corporate";
};

export default function ProfileContactFields({
  profile,
  variant = "individual",
}: ProfileContactFieldsProps) {
  const emailTitle =
    variant === "corporate" ? "Communication Email" : "Email";
  const mobileTitle =
    variant === "corporate" ? "Communication Phone Number" : "Mobile";

  return (
    <>
      <MobileNoVerify profile={profile} title={mobileTitle} />
      <EmailVerification profile={profile} title={emailTitle} />
      {variant === "corporate" && (
        <DataInfoLabel title="WhatsApp">
          <p className="font-medium text-sm">{profile.whatsAppNo || "--"}</p>
        </DataInfoLabel>
      )}
      <AllowWhatsAppNotification profile={profile} />
    </>
  );
}

function EmailVerification({
  profile,
  title,
}: {
  profile: GetCustomerResponseById["responseData"];
  title: string;
}) {
  const [openOtpPopup, setOpenOtpPopup] = useState(false);
  const [otp, setOtp] = useState("");
  const [allowResend, setAllowResend] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const { isActive, reset, start, time } = useTimer({
    duration: 180,
    onFinish() {
      setAllowResend(true);
    },
  });

  const customerApi = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(
    apiClientCaller,
  );

  const sendEmailOtpMutation = useMutation({
    mutationKey: [
      "profile-email-verify-send-otp",
      profile.id,
      profile.emailAddress,
    ],
    mutationFn: async () => {
      return await customerApi.sendEmailVerifyOtp({
        email: profile.emailAddress?.trim() || "",
      });
    },
    onSuccess: () => {
      toast.success("OTP sent to your email");
      setResendCount((c) => c + 1);
      setAllowResend(false);
      setOpenOtpPopup(true);
      reset();
      start();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "Could not send OTP. Try again.",
      );
    },
  });

  const verifyEmailOtpMutation = useMutation({
    mutationKey: ["profile-email-verify-otp", profile.id, profile.emailAddress],
    mutationFn: async () => {
      return await customerApi.verifyEmailVerifyOtp({
        email: profile.emailAddress?.trim() || "",
        otp,
        token: sendEmailOtpMutation.data?.otpToken || "",
      });
    },
    onSuccess: () => {
      toast.success("Email verified successfully");
      setOpenOtpPopup(false);
      setOtp("");
      queryClient.invalidateQueries({
        queryKey: ["profile-page", profile.id],
      });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "OTP verification failed");
    },
  });

  const handleSubmitOtp = () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    verifyEmailOtpMutation.mutate();
  };

  return (
    <DataInfoLabel
      title={title}
      status={profile.utility.isEmailVerified ? "SUCCESS" : undefined}
      showStatus={true}
      statusLabel={
        !profile.utility.isEmailVerified ? (
          <button
            type="button"
            className="text-secondary underline cursor-pointer"
            onClick={() => sendEmailOtpMutation.mutate()}
          >
            {sendEmailOtpMutation.isPending ? "Sending.." : "Verify"}
          </button>
        ) : (
          ""
        )
      }
    >
      <p className="flex items-center gap-2 font-medium text-sm">
        {profile.emailAddress || "--"}{" "}
        {profile.kycStatus == "PENDING" && (
          <EmailChangeUpdate profile={profile} aria-label="Change email address">
            <FaEdit aria-hidden="true" className="cursor-pointer" />
          </EmailChangeUpdate>
        )}
      </p>

      <Dialog open={openOtpPopup} onOpenChange={setOpenOtpPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-medium">Enter OTP</DialogTitle>
            <DialogDescription className="text-gray-600">
              Please enter the OTP sent to {profile.emailAddress || "your email"}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-5">
            <SignInOtpInput otp={otp} setOtp={setOtp} length={6} />
          </div>

          <DialogFooter>
            <Button
              className="w-full"
              onClick={handleSubmitOtp}
              disabled={verifyEmailOtpMutation.isPending}
            >
              {verifyEmailOtpMutation.isPending ? "Verifying…" : "Verify OTP"}
            </Button>
          </DialogFooter>
          <Button
            variant="link"
            disabled={
              sendEmailOtpMutation.isPending ||
              isActive ||
              resendCount >= 3 ||
              !allowResend
            }
            onClick={() => {
              if (resendCount >= 3) {
                toast.error("Maximum resend attempts reached");
                return;
              }
              if (isActive) return;
              sendEmailOtpMutation.mutate();
            }}
          >
            {sendEmailOtpMutation.isPending
              ? "Sending..."
              : isActive
                ? `Resend OTP (${time})`
                : "Resend OTP"}
          </Button>
        </DialogContent>
      </Dialog>
    </DataInfoLabel>
  );
}

function EmailChangeUpdate({
  children,
  profile,
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  profile: GetCustomerResponseById["responseData"];
  "aria-label"?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [allowResend, setAllowResend] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const { isActive, reset, start, time } = useTimer({
    duration: 180,
    onFinish() {
      setAllowResend(true);
    },
  });

  const customerApi = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(
    apiClientCaller,
  );

  const resetDialog = () => {
    setStep("email");
    setNewEmail("");
    setOtp("");
    setOtpToken("");
    setEmailError(undefined);
    setAllowResend(false);
    setResendCount(0);
    reset();
  };

  const sendEmailChangeOtpMutation = useMutation({
    mutationKey: ["profile-email-change-send-otp", profile.id],
    mutationFn: async () => {
      const res = await customerApi.sendEmailChangeOtp({
        newEmail: newEmail.trim(),
      });
      return res.responseData.otpToken;
    },
    onSuccess: (token) => {
      setOtpToken(token);
      setStep("otp");
      setOtp("");
      toast.success("OTP sent to your new email address");
      setAllowResend(false);
      setResendCount((c) => c + 1);
      reset();
      start();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "Could not send OTP. Try again.",
      );
    },
  });

  const verifyEmailChangeMutation = useMutation({
    mutationKey: ["profile-email-change-verify", profile.id],
    mutationFn: async () => {
      return await customerApi.verifyEmailChange({
        newEmail: newEmail.trim(),
        otp,
        token: otpToken,
      });
    },
    onSuccess: () => {
      toast.success("Email updated successfully");
      setIsOpen(false);
      resetDialog();
      queryClient.invalidateQueries({
        queryKey: ["profile-page", profile.id],
      });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "OTP verification failed");
    },
  });

  const validateEmail = (value: string) => {
    const v = value.trim();
    if (!v) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email";
    return undefined;
  };

  const handleSendOtp = () => {
    const err = validateEmail(newEmail);
    setEmailError(err);
    if (err) return;
    sendEmailChangeOtpMutation.mutate();
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }
    verifyEmailChangeMutation.mutate();
  };

  const handleResendOtp = () => {
    if (resendCount >= 3) {
      toast.error("Maximum resend attempts reached");
      return;
    }
    if (isActive) return;
    sendEmailChangeOtpMutation.mutate();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetDialog();
      }}
    >
      <DialogTrigger aria-label={ariaLabel} onClick={() => setIsOpen(true)}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-medium">
            {step === "email" ? "Change email address" : "Verify new email"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {step === "email"
              ? "Enter the new email address. We will send an OTP to that address only."
              : `Enter the OTP sent to ${newEmail.trim()}.`}
          </DialogDescription>
        </DialogHeader>

        {step === "email" ? (
          <>
            <div className="flex flex-col gap-3 py-5">
              <Input
                type="email"
                placeholder="New email address"
                className={`bg-muted py-5 border-none placeholder:text-[#7fabd2] ${emailError ? "border-red-500 border" : ""}`}
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  if (emailError) setEmailError(undefined);
                }}
                autoComplete="email"
              />
              {emailError && (
                <p className="font-medium text-red-500 text-sm">{emailError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                className="w-full"
                onClick={handleSendOtp}
                disabled={sendEmailChangeOtpMutation.isPending}
              >
                {sendEmailChangeOtpMutation.isPending ? "Sending…" : "Send OTP"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-3 py-5">
              <SignInOtpInput
                otp={otp}
                setOtp={(e) => setOtp(e)}
                length={6}
              />
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button
                className="w-full"
                onClick={handleVerifyOtp}
                disabled={verifyEmailChangeMutation.isPending}
              >
                {verifyEmailChangeMutation.isPending
                  ? "Verifying…"
                  : "Verify & update email"}
              </Button>
              <Button
                variant="link"
                type="button"
                disabled={
                  sendEmailChangeOtpMutation.isPending ||
                  isActive ||
                  resendCount >= 3 ||
                  !allowResend
                }
                onClick={handleResendOtp}
              >
                {sendEmailChangeOtpMutation.isPending
                  ? "Sending…"
                  : isActive
                    ? `Resend OTP (${time})`
                    : "Resend OTP"}
              </Button>
              <Button
                variant="ghost"
                type="button"
                className="text-sm"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                }}
              >
                Change email address
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MobileNoVerify({
  profile,
  title,
}: {
  profile: GetCustomerResponseById["responseData"];
  title: string;
}) {
  const [openOtpPopup, setOpenOtpPopup] = useState(false);
  const [allowResend, setAllowResend] = useState(false);
  const { isActive, reset, start, time } = useTimer({
    duration: 180,
    onFinish() {
      setAllowResend(true);
    },
  });
  const [resendCount, setresendCount] = useState(0);

  const customerApi = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(
    apiClientCaller,
  );

  const [otp, setOtp] = useState("");

  const sendMobileOtpMutation = useMutation({
    mutationKey: ["profile-mobile-verify", profile.id, profile.phoneNo],
    mutationFn: async () => {
      return await customerApi.sendMobileVerifyOtp({
        mobile: profile.phoneNo || "",
      });
    },
    onSuccess: () => {
      toast.success("Otp Sent Successfully");
      setresendCount(resendCount + 1);
      setAllowResend(false);
      setOpenOtpPopup(true);
      reset();
      start();
      queryClient.invalidateQueries({
        queryKey: ["profile-page", profile.id],
      });
    },
    onError: () => {
      toast.error("Otp Send Failed");
    },
  });

  const verifyMobileOtpMutation = useMutation({
    mutationKey: [
      "profile-mobile-otp-verify",
      "profile-mobile-verify",
      profile.id,
      profile.phoneNo,
    ],
    mutationFn: async () => {
      return await customerApi.verifyMobileOtp({
        mobile: profile.phoneNo || "",
        otp: otp,
        token: sendMobileOtpMutation.data?.otpToken || "",
      });
    },
    onSuccess: () => {
      toast.success("Otp Verification Successful");
      setOpenOtpPopup(false);
      queryClient.invalidateQueries({
        queryKey: ["profile-page", profile.id],
      });
    },
    onError: () => {
      toast.error("Otp Verification Failed");
    },
  });

  const handelSubmitOtp = () => {
    if (otp.length != 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    verifyMobileOtpMutation.mutate();
  };

  return (
    <DataInfoLabel
      title={title}
      status={profile.utility.isPhoneVerified ? "SUCCESS" : undefined}
      showStatus={true}
      statusLabel={
        !profile.utility.isPhoneVerified ? (
          <button
            type="button"
            className="text-secondary underline cursor-pointer"
            onClick={() => sendMobileOtpMutation.mutate()}
          >
            {sendMobileOtpMutation.isPending ? "Sending.." : "Verify"}
          </button>
        ) : (
          ""
        )
      }
    >
      <p className="flex items-center gap-2 font-medium text-sm">
        {profile.phoneNo || "--"}{" "}
        {profile.kycStatus == "PENDING" && (
          <MobileNoUpdate profile={profile} aria-label="Change mobile number">
            <FaEdit aria-hidden="true" className="cursor-pointer" />
          </MobileNoUpdate>
        )}
      </p>

      <Dialog open={openOtpPopup} onOpenChange={setOpenOtpPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-medium">Enter OTP</DialogTitle>
            <DialogDescription className="text-gray-600">
              Please enter the OTP sent to your mobile number.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-5">
            <SignInOtpInput
              otp={otp}
              setOtp={(e) => {
                setOtp(e);
              }}
              length={6}
            />
          </div>

          <DialogFooter>
            <Button
              className="w-full"
              onClick={handelSubmitOtp}
              disabled={verifyMobileOtpMutation.isPending}
            >
              Verify OTP
            </Button>
          </DialogFooter>
          <Button
            variant={"link"}
            disabled={
              sendMobileOtpMutation.isPending ||
              isActive ||
              resendCount >= 3 ||
              !allowResend
            }
            onClick={() => {
              if (resendCount >= 3) {
                toast.error("Maximum resend attempts reached");
                return;
              }
              if (isActive) {
                return;
              }
              sendMobileOtpMutation.mutate();
            }}
          >
            {sendMobileOtpMutation.isPending
              ? "Sending..."
              : isActive
                ? `Resend OTP (${time})`
                : "Resend OTP"}
          </Button>
        </DialogContent>
      </Dialog>
    </DataInfoLabel>
  );
}

function MobileNoUpdate({
  children,
  profile,
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  profile: GetCustomerResponseById["responseData"];
  "aria-label"?: string;
}) {
  const [chcknewWhatsapp, setChcknewWhatsapp] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [errors, setErrors] = useState<{ mobile?: string; whatsapp?: string }>(
    {},
  );
  const [isOpen, setIsOpen] = useState(false);

  const customerApi = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(
    apiClientCaller,
  );

  const validateMobileNumber = (number: string): string | undefined => {
    if (!number) return "Mobile number is required";
    if (!/^\d{10}$/.test(number))
      return "Mobile number must be exactly 10 digits";
    return undefined;
  };

  const updateMobileNumberMutation = useMutation({
    mutationKey: ["profile-mobile-update", profile.id],
    mutationFn: async () => {
      return await customerApi.updateMobileNumber({
        mobile: "+91" + mobileNumber,
        newWhatsAppNo: chcknewWhatsapp ? "+91" + whatsappNumber : undefined,
      });
    },
    onSuccess: () => {
      toast.success("Mobile number updated successfully");
      setIsOpen(false);
      setMobileNumber("");
      setWhatsappNumber("");
      setChcknewWhatsapp(false);
      setErrors({});
      queryClient.invalidateQueries({
        queryKey: ["profile-page", profile.id],
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update mobile number",
      );
    },
  });

  const handleSubmit = () => {
    const newErrors: { mobile?: string; whatsapp?: string } = {};

    const mobileError = validateMobileNumber(mobileNumber);
    if (mobileError) newErrors.mobile = mobileError;

    if (chcknewWhatsapp) {
      const whatsappError = validateMobileNumber(whatsappNumber);
      if (whatsappError) newErrors.whatsapp = "Enter a valid WhatsApp number";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      updateMobileNumberMutation.mutate();
    }
  };

  const handleMobileChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, "").slice(0, 10);
    setMobileNumber(cleanValue);

    if (errors.mobile) {
      setErrors((prev) => ({ ...prev, mobile: undefined }));
    }
  };

  const handleWhatsappChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, "").slice(0, 10);
    setWhatsappNumber(cleanValue);

    if (errors.whatsapp) {
      setErrors((prev) => ({ ...prev, whatsapp: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger aria-label={ariaLabel} onClick={() => setIsOpen(true)}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-medium">Update Phone Number</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-5">
          <p>Enter 10-digit phone number</p>
          <div className="relative">
            <Input
              placeholder="Mobile No*"
              className={`peer bg-muted py-5 ps-11 pe-12 border-none placeholder:text-[#7fabd2] ${errors.mobile ? "border-red-500 border" : ""}`}
              type="text"
              value={mobileNumber}
              onChange={(e) => handleMobileChange(e.target.value)}
              maxLength={10}
            />
            <span className="absolute inset-y-0 flex items-center ps-3 font-medium text-gray-800 text-sm pointer-events-none start-0">
              +91
            </span>
          </div>
          {errors.mobile && (
            <p className="font-medium text-red-500 text-sm">{errors.mobile}</p>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={chcknewWhatsapp}
              onCheckedChange={() => {
                setChcknewWhatsapp(!chcknewWhatsapp);
                if (!chcknewWhatsapp) {
                  setWhatsappNumber("");
                }
                setErrors({});
              }}
            />
            I use a different mobile number for WhatsApp.
          </label>

          {chcknewWhatsapp && (
            <div className="relative">
              <Input
                placeholder="Whatsapp Number"
                className={`peer bg-muted py-5 ps-11 pe-12 border-none placeholder:text-[#7fabd2] ${errors.whatsapp ? "border-red-500 border" : ""}`}
                type="text"
                value={whatsappNumber}
                onChange={(e) => handleWhatsappChange(e.target.value)}
                maxLength={10}
              />
              <span className="absolute inset-y-0 flex items-center ps-3 font-medium text-gray-800 text-sm pointer-events-none start-0">
                +91
              </span>
            </div>
          )}
          {errors.whatsapp && (
            <p className="font-medium text-red-500 text-sm">
              {errors.whatsapp}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={updateMobileNumberMutation.isPending}
          >
            {updateMobileNumberMutation.isPending
              ? "Updating..."
              : "Update Number"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AllowWhatsAppNotification({
  profile,
}: {
  profile: GetCustomerResponseById["responseData"];
}) {
  const customerApi = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(
    apiClientCaller,
  );

  const toggleWhatsAppNotificationMutation = useMutation({
    mutationKey: ["profile-whatsapp-notification-toggle", profile.id],
    mutationFn: async (status: boolean) => {
      return await customerApi.toggleWhatsAppNotification(status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile-page", profile.id],
      });
      toast.success("WhatsApp Notification Updated Successfully");
    },
    onError: () => {
      toast.error("Failed to Update WhatsApp Notification");
    },
  });

  return (
    <DataInfoLabel title="WhatsApp Notification ">
      <label className="flex items-center gap-2 font-medium text-sm cursor-pointer">
        <Checkbox
          checked={profile.utility.whatsAppNotificationAllow}
          disabled={toggleWhatsAppNotificationMutation.isPending}
          onCheckedChange={() =>
            toggleWhatsAppNotificationMutation.mutate(
              !profile.utility.whatsAppNotificationAllow,
            )
          }
        />{" "}
        Allow Notification
      </label>
    </DataInfoLabel>
  );
}
