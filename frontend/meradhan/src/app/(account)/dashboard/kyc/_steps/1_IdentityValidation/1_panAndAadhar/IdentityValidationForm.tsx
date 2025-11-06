"use client";
import LabelInput from "@/app/(account)/_components/wrapper/LableInput";
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
import React from "react";
import { MdOutlineArrowRight } from "react-icons/md";
import { useKycDataStorage } from "../../../_store/useKycDataStorage";
import { useKycDataProvider } from "../../../_context/KycDataProvider";
import { usePanCardVerifyHook } from "./_hooks/usePanCardVerifyHook";
import { DatePicker } from "@/components/custom/DatePicker";
import { dateTimeUtils } from "@/global/utils/datetime.utils";

function IdentityValidationForm() {
  const { setStep1PanData, state } = useKycDataStorage();
  const data = state.step_1.pan;
  const { pushUserKycState } = useKycDataProvider();
  const { handelPanVerification, isPending, error } = usePanCardVerifyHook();
  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-normal">Enter PAN Details</CardTitle>
      </CardHeader>

      <CardContent accountMode>
        {/* PAN and DOB */}
        <div className="gap-3 md:gap-5 grid lg:grid-cols-3">
          <div className="gap-3 md:gap-5 grid lg:grid-cols-2 lg:col-span-3">
            <LabelInput
              label="PAN Number"
              required
              error={error?.panCardNo?.[0]}
            >
              <Input
                type="text"
                value={data.panCardNo}
                onChange={(e) =>
                  setStep1PanData("panCardNo", e.target.value.toUpperCase())
                }
                placeholder="Enter your PAN number"
              />
            </LabelInput>

            <LabelInput
              label="Date of Birth"
              required
              error={error?.dateOfBirth?.[0]}
            >
              {/* // fix date formatting issue */}
              <DatePicker
                value={
                  data.dateOfBirth
                    ? dateTimeUtils.formatDateTime(
                        data.dateOfBirth,
                        "DD/MM/YYYY"
                      )
                    : ""
                }
                onChange={(e) =>
                  setStep1PanData(
                    "dateOfBirth",
                    dateTimeUtils.formatDateTime(e.target.value, "YYYY-MM-DD")
                  )
                }
              />
            </LabelInput>
          </div>

          {/* Name Fields */}
          <LabelInput label="First Name" required error={error?.firstName?.[0]}>
            <Input
              type="text"
              value={data.firstName}
              onChange={(e) => setStep1PanData("firstName", e.target.value)}
              placeholder="Enter first name"
            />
          </LabelInput>

          <LabelInput label="Middle Name" error={error?.middleName?.[0]}>
            <Input
              type="text"
              value={data.middleName}
              onChange={(e) => setStep1PanData("middleName", e.target.value)}
              placeholder="Enter middle name"
            />
          </LabelInput>

          <LabelInput label="Last Name" required error={error?.lastName?.[0]}>
            <Input
              type="text"
              value={data.lastName}
              onChange={(e) => setStep1PanData("lastName", e.target.value)}
              placeholder="Enter last name"
            />
          </LabelInput>
        </div>

        <p className="mt-2 text-gray-500 text-xs">
          * Full name must match exactly as on your PAN Card.
        </p>

        {/* Terms & Declarations */}
        <div className="flex flex-col gap-3 mt-5">
          <label className="flex gap-3 text-sm">
            <Checkbox
              checked={data.checkTerms1}
              onCheckedChange={(val) => setStep1PanData("checkTerms1", val)}
              checkClass="text-white"
              className="mt-0.5 border border-gray-200"
            />
            I hereby confirm that I am not a Politically Exposed Person (PEP)
            nor related to any PEP.
          </label>
          <small className="text-red-600">{error?.checkTerms1?.[0]}</small>
          <label className="flex items-start gap-3 text-sm">
            <Checkbox
              checked={data.checkTerms2}
              onCheckedChange={(val) => setStep1PanData("checkTerms2", val)}
              checkClass="text-white"
              className="mt-[2px] border border-gray-200"
            />
            I hereby confirm that I am not a person and/or entity debarred from
            accessing the securities market or dealing in securities, as per
            directions or orders issued by the Securities and Exchange Board of
            India (SEBI), any recognized stock exchange, or other competent
            regulatory authorities from time to time.
          </label>
          <small className="text-red-600">{error?.checkTerms2?.[0]}</small>

          <div className="space-y-3 text-sm">
            <p>By continue:</p>
            <p>
              I hereby declare that I am a resident individual as per the
              applicable laws of India and not a Non-Resident Indian (NRI).
            </p>
            <p>
              I hereby confirm to authorize MeraDhan to access and retrieve my
              PAN and Aadhaar card details from DigiLocker for the purpose of
              conducting SEBI-compliant KYC verification. I understand that this
              information will be used solely for regulatory compliance and will
              be securely stored in accordance with applicable laws and SEBI
              guidelines.
            </p>
            <p>
              I hereby provide my consent to MeraDhan to collect, use, store,
              and process my personal data for Know Your Customer (KYC) purposes
              in compliance with SEBI regulations. This includes retrieval of
              KYC records from KYC Registration Agencies (KRAs), as may be
              required, and share my details with KYC registration agencies.{" "}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter accountMode className="sm:flex-row flex-col gap-5">
        <Button
          className="flex items-center gap-2 w-full sm:w-auto"
          onClick={handelPanVerification}
          disabled={isPending}
        >
          Continue to verify <MdOutlineArrowRight />
        </Button>
        <Button
          variant="link"
          onClick={() => {
            const ask = window.confirm(
              "Are you sure you want to exit kyc process?"
            );
            if (ask) pushUserKycState({ exit: true });
          }}
        >
          Save & Exit
        </Button>
      </CardFooter>
    </Card>
  );
}

export default IdentityValidationForm;
