"use client";
import { addActivityLog } from "@/analytics/UserTrackingProvider";
import DataInfoLabel from "@/app/(account)/_components/cards/DataInfoLabel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dataMatcherUtils } from "@/global/utils/matcher";
import { genMediaUrl } from "@/global/utils/url.utils";
import dynamic from "next/dynamic";
import Image from "next/image";
import { IoMdArrowDropright } from "react-icons/io";
import Swal from "sweetalert2";
import { useKycDataProvider } from "../../../_context/KycDataProvider";
import { useKycDataStorage } from "../../../_store/useKycDataStorage";
import { FaDownload } from "react-icons/fa";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useEffect } from "react";
const RenderPdf = dynamic(() => import("@/components/custom/RenderPdf"), {
  ssr: false,
});
function IdentityValidationAadharInfo() {
  const genders = {
    M: "Male",
    F: "Female",
    O: "Others",
  };
  const { pushUserKycState, addAuditLog } = useKycDataProvider();
  const { state, nextLocalStep, setStep1PanData, setStep1NameMismatchDeclaration } = useKycDataStorage();

  const data = state.step_1.pan;

  const isNameMatched = dataMatcherUtils.areNamesMatched(
    dataMatcherUtils.splitFullName(data.response?.details.pan.name),
    {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
    }
  );

  const isDobMatched = dataMatcherUtils.areDatesMatched(
    data.response?.details.aadhaar.dob.replaceAll("/", "-").split("-").reverse().join("-"),
    data.dateOfBirth
  );

  useEffect(() => {
    setStep1NameMismatchDeclaration({
      isDownloaded: false,
      isConfirmed: false,
      mismatch: isNameMatched,
    });
  }, [isNameMatched]);

  const isAllowToContinue = () => {
    if (isNameMatched) {
      return true;
    }
    if (!state.step_1?.nameMismatchDeclaration?.isDownloaded) {
      return false;
    }
    if (!state.step_1?.nameMismatchDeclaration?.isConfirmed) {
      return false;
    }
    return true;
  }

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-medium">
          Confirm Aadhaar & Address Details
        </CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <div className="gap-10 grid ">
          <div className="flex flex-col gap-5 ">
            <DataInfoLabel
              title="Aadhaar Number (last 4-digits)"
              status="SUCCESS"
              statusLabel="Fetched"
              showStatus
            >
              <p className="font-medium">
                {data.response?.details.aadhaar.id_number}
              </p>
            </DataInfoLabel>
            <div className="gap-3 grid md:grid-cols-3">
              <DataInfoLabel
                title="Name"
                status={isNameMatched ? "SUCCESS" : "WARNING"}
                statusLabel={isNameMatched ? "Matched" : "Partially Matched with PAN"}
                showStatus
              >
                <p className="font-medium">
                  {data.response?.details.aadhaar.name}
                </p>
              </DataInfoLabel>
              <DataInfoLabel
                title="Date of Birth"
                status={isDobMatched ? "SUCCESS" : "ERROR"}
                statusLabel={isDobMatched ? "Matched" : "Not Matched"}
                showStatus
              >
                <p className="font-medium">
                  {data.response?.details.aadhaar.dob}
                </p>
              </DataInfoLabel>
              <DataInfoLabel
                title="Gender"
                status="SUCCESS"
                statusLabel="Fetched"
                showStatus
              >
                <p className="font-medium">
                  {genders[data.response?.details.aadhaar.gender as "M" | "F"] ||
                    "Others"}
                </p>
              </DataInfoLabel>
            </div>
            <DataInfoLabel
              title="Address"
              status="SUCCESS"
              statusLabel="Fetched"
              showStatus
              subtext={
                <>
                  <p className="text-gray-500 text-xs">
                    (will be used for future communications)
                  </p>
                </>
              }
            >
              <p className="font-medium text-wrap">
                {data.response?.details.aadhaar.current_address.replaceAll(
                  ",",
                  ", "
                )}
              </p>
            </DataInfoLabel>
          </div>
          <div className="md:col-span-3 grid md:grid-cols-4 gap-5">
            <div className="flex justify-center items-center">
              <Image
                src={genMediaUrl(data.response?.details.aadhaar.image)}
                alt="PAN Card"
                width={840}
                height={397}
                className="bg-gray-50 rounded-2xl w-48 object-cover aspect-3/4"
              />
            </div>
            <div className="col-span-3">
              <RenderPdf
                file={genMediaUrl(
                  data.response?.details.aadhaar.file_url || ""
                )}
                height={320}
              />
            </div>
          </div>

        </div>
        <div className="gap-5 grid md:grid-cols-3 md:mt-10 py-5 border-gray-200 md:border-t md:border-b">
          <DataInfoLabel title="City or District">
            <p className="font-medium">
              {
                data.response?.details.aadhaar.current_address_details.district_or_city
              }
            </p>
          </DataInfoLabel>
          <DataInfoLabel title="State">
            <p className="font-medium">
              {data.response?.details.aadhaar.current_address_details.state}
            </p>
          </DataInfoLabel>
          <DataInfoLabel title="Pincode">
            <p className="font-medium">
              {data.response?.details.aadhaar.current_address_details.pincode}
            </p>
          </DataInfoLabel>
        </div>
        {!isNameMatched && <div className="flex flex-col gap-5 mt-5">
          <div className="flex flex-col gap-3">
            <Link href="/docs/self_declaration_in_name_mismatch.pdf" target="_blank">
              <Button variant="defaultLight" className="flex items-center gap-3 px-14">
                Download Name Mismatch Declaration Form <FaDownload />
              </Button>
            </Link>
            <p className="mt-2">
              By continue:
            </p>
            <label className="flex items-start gap-2 ">
              <Checkbox checked={state.step_1?.nameMismatchDeclaration?.isConfirmed} onCheckedChange={() => {
                setStep1NameMismatchDeclaration({
                  ...state.step_1?.nameMismatchDeclaration,
                  isConfirmed: !state.step_1?.nameMismatchDeclaration?.isConfirmed,
                });
              }} className="mt-0.5" />
              <p>I confirm that the Aadhaar name refers to the same person as my PAN for KYC purposes.</p>
            </label>
            <label className="flex items-start gap-2 ">
              <Checkbox checked={state.step_1?.nameMismatchDeclaration?.isDownloaded} onCheckedChange={() => {

                setStep1NameMismatchDeclaration({
                  ...state.step_1?.nameMismatchDeclaration,
                  isDownloaded: !state.step_1?.nameMismatchDeclaration?.isDownloaded,
                });
              }} className="mt-0.5" />
              <p>I confirm that I have downloaded the declaration form provided on this page relating to name mismatch across my PAN and other documents, and I agree to duly complete, sign, and submit the same by email to <a href="mailto:support@meradhan.co" className="text-primary">support@meradhan.co</a>.</p>
            </label>
          </div>

        </div>}
        {isNameMatched && <div className="flex flex-col gap-1 mt-8 mb-3">
          <p className="font-semibold">We’re unable to fully match your name across documents.</p>
          <p >Please ensure that the Aadhaar details you’ve entered are correct and try again. If the issue persists, you may contact our support team for assistance.</p>
        </div>}

      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5">
        <Button
          className="flex items-center gap-1 w-full sm:w-auto"

          onClick={() => {
            setStep1PanData(
              "confirmAadhaarTimestamp",
              new Date().toISOString()
            );
            addAuditLog({
              type: "KYC_PROCESS_CONTINUED",
              desc: "User chose to continue the KYC process : Aadhaar and Address Validation step.",
            });
            addActivityLog({
              action: "CONFIRMED_AADHAAR_DETAILS",
              details: {
                step: "PAN and Identity Validation step - Confirmed Aadhaar Details",
                AadhaarNo: data.response?.details.aadhaar.id_number,
                DateOfBirth: data.response?.details.aadhaar.dob,
                Name: data.response?.details.aadhaar.name,
                Address: data.response?.details.aadhaar.current_address,
              },
              entityType: "KYC",
            });
            nextLocalStep();
            pushUserKycState();
          }}
          disabled={!isAllowToContinue()}
        >
          Confirm & Continue
          <div className="flex justify-center items-center p-0 h-full">
            <IoMdArrowDropright className="p-0 text-4xl" />
          </div>
        </Button>
        <Button
          variant={`link`}
          onClick={async () => {
            const result = await Swal.fire({
              text: "Are you sure you want to save and exit the KYC process?",
              imageUrl: "/images/icons/sad-emoji.svg",
              showCancelButton: true,
              confirmButtonText: "Save & Exit",
              cancelButtonText: "Cancel",
            });

            if (result.isConfirmed) {
              addAuditLog({
                type: "KYC_PROCESS_EXITED",
                desc: "User chose to save and exit the KYC process : Aadhaar and Address Validation step.",
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

export default IdentityValidationAadharInfo;
