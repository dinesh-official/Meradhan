"use client";
import { addActivityLog } from "@/analytics/UserTrackingProvider";
import LabelInput from "@/app/(account)/_components/wrapper/LableInput";
import DatePicker from "@/components/picker/DatePicker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import {
  convertUTCtoIST,
  formatDateCustom,
} from "@/global/utils/datetime.utils";
import useAppCookie from "@/hooks/useAppCookie.hook";
import { IoMdArrowDropright } from "react-icons/io";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useKycDataProvider } from "../../../_context/KycDataProvider";
import { useKycDataStorage } from "../../../_store/useKycDataStorage";
import { usePanCardVerifyHook } from "./_hooks/usePanCardVerifyHook";

function IdentityValidationForm() {
  const { setStep1PanData, state } = useKycDataStorage();
  const data = state.step_1.pan;
  const { pushUserKycState, addAuditLog } = useKycDataProvider();
  const { handelPanVerification, isPending, error } = usePanCardVerifyHook();
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const { cookies } = useAppCookie();
  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller);

  const profileQuery = useQuery({
    queryKey: ["getProfileDataForKyc"],
    queryFn: async () => {
      const response = await customerApi.customerInfoById(Number(cookies.userId));
      return response.data.responseData;
    },
  });
  const profile = profileQuery.data;
  const isRekyc = profile?.kycStatus === "RE_KYC";
  const existingPan = profile?.panCard?.panCardNo ?? "";

  useEffect(() => {
    setDateOfBirth(
      data.dateOfBirth ? new Date(formatDateCustom(data.dateOfBirth)) : null,
    );
  }, []);

  // Re-KYC: prefill PAN from last verified KYC and keep it locked
  useEffect(() => {
    if (isRekyc && existingPan) {
      setStep1PanData("panCardNo", existingPan);
    }
  }, [isRekyc, existingPan, setStep1PanData]);

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-normal">Enter PAN Details</CardTitle>
      </CardHeader>

      <CardContent accountMode>
        {/* PAN and DOB */}
        <div className="flex flex-col gap-3 md:gap-5">
          <div className="gap-3 grid md:grid-cols-2">
            <LabelInput
              label="PAN Number"
              required
              error={error?.panCardNo?.[0]}
            >
              <Input
                type="text"
                value={isRekyc ? (existingPan || data.panCardNo) : data.panCardNo}
                onChange={(e) =>
                  !isRekyc &&
                  setStep1PanData("panCardNo", e.target.value.toUpperCase())
                }
                placeholder="Enter your PAN number"
                disabled={isRekyc}
                readOnly={isRekyc}
                className={isRekyc ? "bg-muted cursor-not-allowed" : ""}
              />
              {isRekyc && (
                <p className="text-muted-foreground text-xs mt-1">
                  Re-KYC: Using your previously verified PAN.
                </p>
              )}
            </LabelInput>

            <LabelInput
              label="Date of Birth"
              required
              error={error?.dateOfBirth?.[0]}
            >

              <DatePicker
                containerStyles={{
                  border: "1px solid #e6e6e6",
                  padding: "6px",
                  paddingLeft: "13px",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                inputStyles={{
                  border: "none",
                  padding: "0",
                  fontSize: "14px",
                }}
                value={dateOfBirth}
                onChange={(e) => {
                  setDateOfBirth(e);
                  setStep1PanData(
                    "dateOfBirth",
                    convertUTCtoIST(e?.toISOString())?.split("T")[0],
                  );
                  console.log(e);
                }}
              />
            </LabelInput>
          </div>

          {/* Name Fields */}
          <div className="gap-3 grid md:grid-cols-3">
            <LabelInput
              label="First Name"
              required
              error={error?.firstName?.[0]}
            >
              <Input
                type="text"
                value={data.firstName}
                onChange={(e) =>
                  setStep1PanData("firstName", e.target.value.toUpperCase())
                }
                placeholder="Enter first name"
              />
            </LabelInput>

            <LabelInput label="Middle Name" error={error?.middleName?.[0]}>
              <Input
                type="text"
                value={data.middleName}
                onChange={(e) =>
                  setStep1PanData("middleName", e.target.value.toUpperCase())
                }
                placeholder="Enter middle name"
              />
            </LabelInput>

            <LabelInput label="Last Name" error={error?.lastName?.[0]}>
              <Input
                type="text"
                value={data.lastName}
                onChange={(e) =>
                  setStep1PanData("lastName", e.target.value.toUpperCase())
                }
                placeholder="Enter last name"
              />
            </LabelInput>
          </div>
        </div>

        <p className="mt-2 text-gray-500 text-xs">
          * Your full name (First, Middle, and Last together) must match exactly
          as it appears on your PAN Card.
        </p>

        {/* Terms & Declarations */}
        <div className="flex flex-col gap-3 mt-5">
          <div>
            <label className="flex gap-3 text-sm">
              <Checkbox
                checked={data.checkTerms1}
                onCheckedChange={(val) => setStep1PanData("checkTerms1", val)}
                checkClass="text-white"
                className="mt-0.5 border border-gray-200"
              />
              I hereby confirm that I am not a Politically Exposed Person (PEP)
              nor related to any PEP
            </label>
            <small className="text-red-600 text-[10px]">
              {error?.checkTerms1?.[0]}
            </small>
          </div>
          <div>
            <label className="flex items-start gap-3 text-sm">
              <Checkbox
                checked={data.checkTerms2}
                onCheckedChange={(val) => setStep1PanData("checkTerms2", val)}
                checkClass="text-white"
                className="mt-0.5 border border-gray-200"
              />
              I hereby confirm that I am not a person and/or entity debarred
              from accessing the securities market or dealing in securities, as
              per directions or orders issued by the Securities and Exchange
              Board of India (SEBI), any recognized stock exchange, or other
              competent regulatory authorities from time to time.
            </label>
            <small className="text-red-600 text-[10px]">
              {error?.checkTerms2?.[0]}
            </small>
          </div>

          <div>
            <label className="flex items-start gap-3 text-sm">
              <Checkbox
                checked={data.isFatca}
                onCheckedChange={(val) => setStep1PanData("isFatca", val)}
                checkClass="text-white"
                className="mt-0.5 border border-gray-200"
              />
              I confirm that I am an Indian citizen and solely a tax resident of
              India, not of any other country (FATCA)
            </label>
            <small className="text-red-600 text-[10px]">
              {error?.isFatca?.[0]}
            </small>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <label className="flex items-start gap-3 ">
                <Checkbox
                  className="mt-0.5"
                  checked={data.checkKycKraConsent}
                  onCheckedChange={(val) =>
                    setStep1PanData("checkKycKraConsent", val)
                  }
                />{" "}
                By clicking Continue to Verify, I hereby agree to and provide
                consent for the following:
              </label>
              <small className="text-red-600 text-[10px]">
                {error?.checkKycKraConsent?.[0]}
              </small>
            </div>
            <ul className="list-disc ml-10 flex flex-col gap-2">
              <li>
                I hereby declare that I am a resident individual as per the
                applicable laws of India and not a Non-Resident Indian (NRI).
              </li>
              <li>
                I authorize MeraDhan to access and verify my PAN details from
                authorized government or regulatory sources for SEBI-compliant
                KYC purposes. I understand that my information will be used only
                for regulatory compliance and handled securely as per applicable
                laws.
              </li>
              <li>
                I hereby provide my consent to MeraDhan to collect, use, store,
                and process my personal data for Know Your Customer (KYC)
                purposes in compliance with SEBI regulations. This includes
                retrieval of KYC records from KYC Registration Agencies (KRAs),
                as may be required, and share my details with KYC registration
                agencies.
              </li>
            </ul>
          </div>
        </div>
      </CardContent>

      <CardFooter accountMode className="sm:flex-row flex-col gap-5">
        <Button
          className="flex items-center gap-1 w-full sm:w-auto"
          onClick={handelPanVerification}
          disabled={isPending}
        >
          Continue to Verify
          <div className="flex justify-center items-center p-0 h-full">
            <IoMdArrowDropright className="p-0 text-4xl" />
          </div>
        </Button>

        <Button
          variant="link"
          onClick={async () => {
            const result = await Swal.fire({
              text: "Are you sure you want to save and exit the KYC process?",
              imageUrl: "/images/icons/sad-emoji.svg",
              showCancelButton: true,
              confirmButtonText: "Save & Exit",
              cancelButtonText: "Cancel",
            });

            if (result.isConfirmed) {
              addActivityLog({
                action: "KYC_PROCESS_EXITED",
                details: {
                  step: "PAN and Identity Validation step",
                },
                entityType: "KYC",
              });
              addAuditLog({
                type: "KYC_PROCESS_EXITED",
                desc: "User chose to save and exit the KYC process : PAN and Identity Validation step.",
              });
              pushUserKycState({ exit: true });
            }
          }}
        >
          Save & Exit
        </Button>
      </CardFooter>
    </Card>
  );
}

export default IdentityValidationForm;
