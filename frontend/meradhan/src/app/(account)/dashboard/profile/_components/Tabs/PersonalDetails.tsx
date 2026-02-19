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
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { useTimer } from "@/hooks/useTimer";
import apiGateway, { GetCustomerResponseById } from "@root/apiGateway";
import { useMutation } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import toast from "react-hot-toast";
import { FaCheckSquare, FaEdit } from "react-icons/fa";
function PersonalDetails({
  profile,
}: {
  profile: GetCustomerResponseById["responseData"];
}) {
  const showAddress =
    profile.kycStatus == "VERIFIED" ||
    profile.kycStatus == "RE_KYC" ||
    profile.kycStatus == "UNDER_REVIEW";
  const getAddressNotes = (value?: string | null) => {
    if (!showAddress) return "--";
    return value || "--";
  };

  return (
    <>
      <div className="gap-5 grid md:grid-cols-3 mt-5">
        <DataInfoLabel title="First Name">
          <p className="font-medium text-sm uppercase">{profile.firstName}</p>
        </DataInfoLabel>
        <DataInfoLabel title="Middle Name">
          <p className="font-medium text-sm uppercase">
            {profile.middleName || "--"}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="Last Name">
          <p className="font-medium text-sm uppercase">
            {profile.lastName || "--"}
          </p>
        </DataInfoLabel>
        <MobileNoVerify profile={profile} />
        <EmailVerification profile={profile} />
        <AllowWhatsAppNotification profile={profile} />
        <FullKycInfo profile={profile} />
      </div>
      <div className="gap-5 grid md:grid-cols-3 mt-6 pt-6 border-gray-200 border-t">
        {showAddress && (
          <div className="md:col-span-3">
            <h4 className="flex items-center gap-2">
              Communication Address (as per Aadhar){" "}
              {(profile.kycStatus == "VERIFIED" ||
                profile.kycStatus == "RE_KYC") && (
                <FaCheckSquare className="text-green-600" />
              )}
            </h4>
          </div>
        )}

        <DataInfoLabel title="Line 1" className="md:col-span-3">
          <p className="font-medium text-sm">
            {getAddressNotes(profile.permanentAddress?.line1)}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="Line 2" className="md:col-span-3">
          <p className="font-medium text-sm">
            {getAddressNotes(profile.permanentAddress?.line2)}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="Line 3" className="md:col-span-3">
          <p className="font-medium text-sm">
            {getAddressNotes(profile.permanentAddress?.line3)}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="City / Town / Village">
          <p className="font-medium text-sm">
            {getAddressNotes(profile.permanentAddress?.cityOrDistrict)}
          </p>
        </DataInfoLabel>

        <DataInfoLabel title="District">
          <p className="font-medium text-sm">
            {getAddressNotes(profile.permanentAddress?.cityOrDistrict)}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="State">
          <p className="font-medium text-sm">
            {getAddressNotes(profile.permanentAddress?.state)}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="Pincode ">
          <p className="font-medium text-sm">
            {getAddressNotes(profile.permanentAddress?.pinCode)}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="Country ">
          <p className="font-medium text-sm">India</p>
        </DataInfoLabel>
      </div>
    </>
  );
}

export default PersonalDetails;

function EmailVerification({
  profile,
}: {
  profile: GetCustomerResponseById["responseData"];
}) {
  const customerApi = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(
    apiClientCaller
  );
  const verifyEmailMutation = useMutation({
    mutationKey: ["profile-email-verify", profile.id],
    mutationFn: async () => {
      return await customerApi.sendEmailVerifyLink();
    },
    onSuccess: () => {
      toast.success("Email Send Successfully");
    },
    onError: () => {
      toast.error("Verification Email Send Failed");
    },
  });
  return (
    <DataInfoLabel
      title="Email"
      status={profile.utility.isEmailVerified ? "SUCCESS" : undefined}
      showStatus={true}
      statusLabel={
        !profile.utility.isEmailVerified ? (
          <span
            className="text-secondary underline cursor-pointer"
            onClick={() => verifyEmailMutation.mutate()}
          >
            {verifyEmailMutation.isPending ? "Sending.." : "Verify"}
          </span>
        ) : (
          ""
        )
      }
    >
      <p className="flex items-center gap-2 font-medium text-sm">
        {profile.emailAddress || "--"}
      </p>
    </DataInfoLabel>
  );
}

function MobileNoVerify({
  profile,
}: {
  profile: GetCustomerResponseById["responseData"];
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
    apiClientCaller
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
      reset(); // Reset and start the timer
      start(); // Start the countdown
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
        otp: otp, // OTP should be passed here
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
      title="Mobile"
      status={profile.utility.isPhoneVerified ? "SUCCESS" : undefined}
      showStatus={true}
      statusLabel={
        !profile.utility.isPhoneVerified ? (
          <span
            className="text-secondary underline cursor-pointer"
            onClick={() => sendMobileOtpMutation.mutate()}
          >
            {sendMobileOtpMutation.isPending ? "Sending.." : "Verify"}
          </span>
        ) : (
          ""
        )
      }
    >
      <p className="flex items-center gap-2 font-medium text-sm">
        {profile.phoneNo || "--"}{" "}
        {profile.kycStatus == "PENDING" && <MobileNoUpdate profile={profile}>
          <FaEdit className="cursor-pointer" />
        </MobileNoUpdate>}
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
              // max 3 resend
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
}: {
  children: ReactNode;
  profile: GetCustomerResponseById["responseData"];
}) {
  const [chcknewWhatsapp, setChcknewWhatsapp] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [errors, setErrors] = useState<{ mobile?: string; whatsapp?: string }>(
    {}
  );
  const [isOpen, setIsOpen] = useState(false);

  const customerApi = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(
    apiClientCaller
  );

  // Validation function
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
      // Reset form
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
        error?.response?.data?.message || "Failed to update mobile number"
      );
    },
  });

  const handleSubmit = () => {
    const newErrors: { mobile?: string; whatsapp?: string } = {};

    // Validate mobile number
    const mobileError = validateMobileNumber(mobileNumber);
    if (mobileError) newErrors.mobile = mobileError;

    // Validate WhatsApp number if provided
    if (chcknewWhatsapp) {
      const whatsappError = validateMobileNumber(whatsappNumber);
      if (whatsappError) newErrors.whatsapp = "Enter a valid WhatsApp number";
    }

    setErrors(newErrors);

    // If no errors, submit the form
    if (Object.keys(newErrors).length === 0) {
      updateMobileNumberMutation.mutate();
    }
  };

  const handleMobileChange = (value: string) => {
    // Only allow digits and limit to 10 characters
    const cleanValue = value.replace(/\D/g, "").slice(0, 10);
    setMobileNumber(cleanValue);

    // Clear error when user starts typing
    if (errors.mobile) {
      setErrors((prev) => ({ ...prev, mobile: undefined }));
    }
  };

  const handleWhatsappChange = (value: string) => {
    // Only allow digits and limit to 10 characters
    const cleanValue = value.replace(/\D/g, "").slice(0, 10);
    setWhatsappNumber(cleanValue);

    // Clear error when user starts typing
    if (errors.whatsapp) {
      setErrors((prev) => ({ ...prev, whatsapp: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger onClick={() => setIsOpen(true)}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-medium">Update Phone Number</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-5">
          <p>Enter 10-digit phone number</p>
          <div className="relative">
            <Input
              placeholder="Mobile No*"
              className={`peer bg-muted py-5 ps-11 pe-12 border-none placeholder:text-[#7fabd2] ${errors.mobile ? "border-red-500 border" : ""
                }`}
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
                className={`peer bg-muted py-5 ps-11 pe-12 border-none placeholder:text-[#7fabd2] ${errors.whatsapp ? "border-red-500 border" : ""
                  }`}
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
    apiClientCaller
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
              !profile.utility.whatsAppNotificationAllow
            )
          }
        />{" "}
        Allow Notification
      </label>
    </DataInfoLabel>
  );
}

function FullKycInfo({
  profile,
}: {
  profile: GetCustomerResponseById["responseData"];
}) {
  if (profile.kycStatus != "VERIFIED") {
    return null;
  }
  return (
    <>
      <DataInfoLabel title="PAN">
        <p className="font-medium text-sm">
          {profile.panCard?.panCardNo || "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Aadhaar">
        <p className="font-medium text-sm">
          {profile.aadhaarCard?.aadhaarNo || "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Date of Birth">
        <p className="font-medium text-sm">
          {profile.personalInformation?.dateOfBirth
            ? dateTimeUtils.formatDateTime(
              profile.personalInformation?.dateOfBirth,
              "DD MMM YYYY"
            )
            : "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Gender">
        <p className="font-medium text-sm">{profile.gender || "--"}</p>
      </DataInfoLabel>
      <DataInfoLabel title="Marital Status">
        <p className="font-medium text-sm">
          {profile.personalInformation?.maritalStatus || "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Occupation Type">
        <p className="font-medium text-sm">
          {profile.personalInformation?.occupationType || "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Father/Spouse Name">
        <p className="font-medium text-sm">
          {profile.personalInformation?.fatherOrSpouseName || "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Mother’s Name">
        <p className="font-medium text-sm">
          {profile.personalInformation?.mothersName || "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Maiden Name">
        <p className="font-medium text-sm">
          {profile.personalInformation?.maidenName || "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Qualification">
        <p className="font-medium text-sm">
          {profile.personalInformation?.qualification || "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Residential Status">
        <p className="font-medium text-sm">
          {profile.personalInformation?.residentialStatus || "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Nationality">
        <p className="font-medium text-sm">
          {profile.personalInformation?.nationality || "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Income Range">
        <p className="font-medium text-sm">
          {profile.personalInformation?.annualGrossIncome || "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Politically Exposed Person">
        <p className="font-medium text-sm">
          {profile.personalInformation?.politicallyExposedPerson || "--"}
        </p>
      </DataInfoLabel>
    </>
  );
}
