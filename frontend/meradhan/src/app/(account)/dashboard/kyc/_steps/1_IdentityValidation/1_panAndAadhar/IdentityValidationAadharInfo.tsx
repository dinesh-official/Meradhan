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
import { Checkbox } from "@/components/ui/checkbox";
import type { MatchResult } from "@/global/utils/match_name";
import { dataMatcherUtils } from "@/global/utils/matcher";
import { genMediaUrl } from "@/global/utils/url.utils";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BiLoaderCircle } from "react-icons/bi";
import { FaDownload, FaRedo } from "react-icons/fa";
import { IoMdArrowDropright } from "react-icons/io";
import Swal from "sweetalert2";
import { useKycDataProvider } from "../../../_context/KycDataProvider";
import { useKycDataStorage } from "../../../_store/useKycDataStorage";
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
  const {
    state,
    nextLocalStep,
    setStep1PanData,
    setStep1NameMismatchDeclaration,
    prevLocalStep,
    incrementNameRetryCount,
    resetNameRetryCount,
  } = useKycDataStorage();

  const data = state.step_1.pan;

  const [isNameMatched, setisNameMatched] = useState<MatchResult | undefined>(
    undefined,
  );
  const [isCheckingName, setIsCheckingName] = useState(false);

  /**
   * Check name matching via API
   */
  const checkNameMatch = useCallback(async () => {
    const aadhaarName = data.response?.details?.aadhaar?.name || "";

    const panName = data.response?.details?.pan?.name || "";

    // Skip if names are not available
    if (!aadhaarName || !panName) {
      return;
    }

    setIsCheckingName(true);
    try {
      const response = await fetch("/api/kyc/check-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name1: aadhaarName,
          name2: panName,
          dob1: data.response?.details?.aadhaar?.dob || null,
          dob2: data.response?.details?.pan?.dob || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to check name match");
      }

      const result: MatchResult = await response.json();
      setisNameMatched({
        score: result.score,
        decision: result.decision,
        breakdown: result.breakdown,
      });

      // Reset retry count on successful match
      if (result.decision !== "MATCH_FAIL") {
        resetNameRetryCount();
      }
    } catch (error) {
      console.error("Error checking name match:", error);
      // Fallback to MATCH_FAIL on error
      setisNameMatched({
        score: 0,
        decision: "MATCH_FAIL",
        breakdown: {
          fuzzy: 0,
          tokenOverlap: 0,
          phonetic: 0,
          initialsMatch: false,
          lastNameExact: false,
          initialStyleDetected: false,
          dateOfBirthMatch: false,
        },
      });
    } finally {
      setIsCheckingName(false);
    }
  }, [
    data.response?.details?.aadhaar?.name,
    data.firstName,
    data.middleName,
    data.lastName,
    data.response?.details?.aadhaar?.dob,
    data.response?.details?.pan?.dob,
    resetNameRetryCount,
  ]);

  useEffect(() => {
    checkNameMatch();
  }, [checkNameMatch]);

  const isDobMatched = dataMatcherUtils.areDatesMatched(
    data.response?.details.aadhaar.dob
      .replaceAll("/", "-")
      .split("-")
      .reverse()
      .join("-"),
    data.response?.details?.pan?.dob
      .replaceAll("/", "-")
      .split("-")
      .reverse()
      .join("-"),
  );

  useEffect(() => {
    setStep1NameMismatchDeclaration({
      isDownloaded: false,
      isConfirmed: false,
      mismatch: isNameMatched?.decision != "MATCH_FAIL",
      score: isNameMatched?.score || 0,
      decision: isNameMatched?.decision || "MATCH_FAIL",
      retryCount: state.step_1.nameMismatchDeclaration.retryCount,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNameMatched]);
  const isGenderMatched =
    state.step_1?.gender == state.step_1.pan.response?.details?.aadhaar?.gender; // Aadhaar does not have

  const isAllowToContinue = () => {
    if (isCheckingName) {
      return false;
    }
    if (!isGenderMatched) {
      return false;
    }
    if (isNameMatched?.decision == "MATCH_FULL") {
      return true;
    }

    if (!state.step_1?.nameMismatchDeclaration?.isDownloaded) {
      return false;
    }

    if (!state.step_1?.nameMismatchDeclaration?.isConfirmed) {
      return false;
    }
    return true;
  };

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-medium">
          Confirm Aadhaar & Address Details
        </CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <div className="gap-10  w-full flex flex-col">
          <div className="flex flex-col  gap-5 w-full ">
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
            <div className="gap-3 grid md:grid-cols-3 w-full ">
              <DataInfoLabel
                title="Name"
                status={
                  isCheckingName
                    ? undefined
                    : isNameMatched?.decision == "MATCH_FULL"
                      ? "SUCCESS"
                      : isNameMatched?.decision == "MATCH_PARTIAL"
                        ? "WARNING"
                        : "ERROR"
                }
                statusLabel={
                  isCheckingName
                    ? "Checking..."
                    : isNameMatched?.decision == "MATCH_FULL"
                      ? "Matched"
                      : isNameMatched?.decision == "MATCH_PARTIAL"
                        ? "Partially Matched : Confirmation Required"
                        : "Doesn't Match with PAN"
                }
                showStatus
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium">
                    {data.response?.details.aadhaar.name}
                  </p>
                  {isCheckingName && (
                    <BiLoaderCircle
                      className="text-primary animate-spin"
                      size={20}
                    />
                  )}
                  {!isCheckingName &&
                    isNameMatched?.decision == "MATCH_FAIL" && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => {
                          incrementNameRetryCount();
                          prevLocalStep();
                        }}
                        disabled={
                          state.step_1.nameMismatchDeclaration.retryCount > 3
                        }
                        className="h-auto p-0 text-primary hover:text-primary/80 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Retry
                        <FaRedo className="w-3 h-3" size={10} />
                      </Button>
                    )}
                </div>
              </DataInfoLabel>
              <DataInfoLabel
                title="Date of Birth"
                status={isDobMatched ? "SUCCESS" : "ERROR"}
                statusLabel={
                  isDobMatched ? "Matched With PAN" : "Not Matched With PAN"
                }
                showStatus
              >
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {data.response?.details.aadhaar.dob}
                  </p>
                  {!isDobMatched && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        incrementNameRetryCount();
                        prevLocalStep();
                      }}
                      disabled={
                        state.step_1.nameMismatchDeclaration.retryCount > 3
                      }
                      className="h-auto p-0 text-primary hover:text-primary/80 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Retry
                      <FaRedo className="w-3 h-3" size={10} />
                    </Button>
                  )}
                </div>
              </DataInfoLabel>
              <DataInfoLabel
                title="Gender"
                status={isGenderMatched ? "SUCCESS" : "WARNING"}
                statusLabel={isGenderMatched ? "Matched" : "Not Matched"}
                showStatus
              >
                <p className="font-medium">
                  {genders[
                    data.response?.details?.aadhaar?.gender as "M" | "F"
                  ] || "Others"}
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
                  ", ",
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
                  data.response?.details.aadhaar.file_url || "",
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
                data.response?.details.aadhaar.current_address_details
                  .district_or_city
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
        {!isGenderMatched && (
          <p className="text-red-500">
            Your gender does not match the details on your Aadhaar card.
          </p>
        )}

        {isNameMatched?.decision == "MATCH_PARTIAL" && (
          <div className="flex flex-col gap-5 mt-5">
            <div className="flex flex-col gap-3">
              <Link
                href="/docs/self_declaration_in_name_mismatch.pdf"
                target="_blank"
                download
              >
                <Button
                  variant="defaultLight"
                  className="flex items-center gap-3 px-14"
                >
                  Download Name Mismatch Declaration Form <FaDownload />
                </Button>
              </Link>
              <p className="mt-2">By continue:</p>
              <label className="flex items-start gap-2 ">
                <Checkbox
                  checked={state.step_1?.nameMismatchDeclaration?.isConfirmed}
                  onCheckedChange={() => {
                    setStep1NameMismatchDeclaration({
                      ...state.step_1?.nameMismatchDeclaration,
                      isConfirmed:
                        !state.step_1?.nameMismatchDeclaration?.isConfirmed,
                    });
                  }}
                  className="mt-0.5"
                />
                <p>
                  I confirm that the Aadhaar name refers to the same person as
                  my PAN for KYC purposes.
                </p>
              </label>
              <label className="flex items-start gap-2 ">
                <Checkbox
                  checked={state.step_1?.nameMismatchDeclaration?.isDownloaded}
                  onCheckedChange={() => {
                    setStep1NameMismatchDeclaration({
                      ...state.step_1?.nameMismatchDeclaration,
                      isDownloaded:
                        !state.step_1?.nameMismatchDeclaration?.isDownloaded,
                    });
                  }}
                  className="mt-0.5"
                />
                <p>
                  I confirm that I have downloaded the declaration form provided
                  on this page relating to name mismatch across my PAN and other
                  documents, and I agree to duly complete, sign, and submit the
                  same by email to{" "}
                  <a href="mailto:support@meradhan.co" className="text-primary">
                    support@meradhan.co
                  </a>
                  .
                </p>
              </label>
            </div>
          </div>
        )}
        {/* Name Mismatch */}
        {isNameMatched?.decision == "MATCH_FAIL" && (
          <div className="flex flex-col gap-3 mt-8 mb-3">
            <div className="flex flex-col gap-1">
              <p className="font-semibold">
                We&apos;re unable to fully match your name across documents.
              </p>
              <p>
                Please ensure that the Aadhaar details you&apos;ve entered are
                correct and try again. If the issue persists, you may contact
                our support team for assistance.
              </p>
            </div>
          </div>
        )}
        {/* Date of Birth Mismatch */}
        {!isDobMatched && (
          <div className="flex flex-col gap-3 mt-8 mb-3">
            <div className="flex flex-col gap-1">
              <p className="font-semibold">Unable to Verify Details</p>
              <p>
                We couldn’t complete the verification due to a date of birth
                mismatch. Please ensure that the date of birth in both Aadhaar
                and PAN is the same. If you need any assistance, please reach
                out to our support team.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5">
        {isNameMatched?.decision != "MATCH_FAIL" && isDobMatched && (
          <Button
            className="flex items-center gap-1 w-full sm:w-auto"
            onClick={() => {
              setStep1PanData(
                "confirmAadhaarTimestamp",
                new Date().toISOString(),
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
        )}
        <Button
          variant={
            isNameMatched?.decision != "MATCH_FAIL" && isDobMatched
              ? `link`
              : `outline`
          }
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
