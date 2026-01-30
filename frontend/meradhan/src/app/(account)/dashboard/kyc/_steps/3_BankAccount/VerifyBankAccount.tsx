"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { makeFullname } from "@/global/utils/formate";
import { FaDownload, FaPlusSquare } from "react-icons/fa";
import { IoMdArrowDropright } from "react-icons/io";
import Swal from "sweetalert2";
import { useKycDataProvider } from "../../_context/KycDataProvider";
import { useKycDataStorage } from "../../_store/useKycDataStorage";
import { useKycStepStore } from "../../_store/useKycStepStore";
import BankViewCard from "./_elements/BankViewCard";
import { addActivityLog } from "@/analytics/UserTrackingProvider";
import { MatchResult } from "@/global/utils/match_name";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

function VerifyBankAccount() {
  const {
    setDefaultBankAccount,
    state,
    removeBankAccount,
    prevLocalStep,
    addBankAccount,
    setStepIndex,
    updateBankAccount,

    setNameMismatchDeclarationBank,
  } = useKycDataStorage();
  const data = state.step_3;
  const { pushUserKycState, addAuditLog } = useKycDataProvider();
  const { nextStep } = useKycStepStore();
  const [bankNameMatches, setBankNameMatches] = useState<Record<string, MatchResult["decision"]>>();
  const [isLoading, setIsLoading] = useState(true);

  const isAllowToContinue = () => {
    const defaltSelcted = data.filter((item) => item.isDefault);
    const allValid = data.filter((item) => item.isVerified);
    return defaltSelcted.length !== 0 && allValid.length !== 0;
  };

  const checkBankName = async (name1: string, name2: string) => {
    const response = await fetch("/api/kyc/check-name", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name1: name1,
        name2: name2,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to check bank name");
    }
    const data = await response.json();
    return data as MatchResult;
  };

  const checkAllBankNames = async () => {
    const results = await Promise.all(
      data.map(async (item) => {
        const result = await checkBankName(item.beneficiary_name, makeFullname({
          firstName: state.step_1.pan.firstName,
          middleName: state.step_1.pan.middleName,
          lastName: state.step_1.pan.lastName,
        }));
        return {
          account: item.accountNumber,
          result,
        };
      })
    );

    return results.reduce((acc, curr) => {
      acc[curr.account] = curr.result.decision;
      return acc;
    }, {} as Record<string, MatchResult["decision"]>);

  };

  useEffect(() => {
    setIsLoading(true);
    checkAllBankNames().then((results) => {
      setBankNameMatches(results);
    }).finally(() => {
      setIsLoading(false);
    });
  }, [data]);

  const jumpNext = () => {
    addAuditLog({
      type: "START_BANK_ACCOUNT_VERIFICATION",
      desc: "User added a bank account during KYC process.",
    });
    addActivityLog({
      action: "BANK_ACCOUNT_CONFIRMED",
      details: {
        step: "Bank Account step",
        Added: data.length + " account",
        Reason: "User confirmed the bank account details",

      },
      entityType: "KYC",
    });
    data.forEach((e, i) => {
      updateBankAccount(i, {
        ...e,
        confirmBankTimestamp: new Date().toISOString(),
      });
    });
    pushUserKycState();
    setStepIndex(0);
    nextStep();
  };

  const getStatus = (decision: MatchResult["decision"]) => {
    switch (decision) {
      case "MATCH_FULL":
        return "SUCCESS";
      case "MATCH_PARTIAL":
        return "WARNING";
      case "MATCH_FAIL":
        return "ERROR";
    }
  };

  const getStatusLabel = (decision: MatchResult["decision"]) => {
    switch (decision) {
      case "MATCH_FULL":
        return "Matched";
      case "MATCH_PARTIAL":
        return "Partially Matched : Confirmation Required";
      case "MATCH_FAIL":
        return "Unable to Match";
    }
  };

  // may be one mismatch or all matched or all partially matched
  const allowToContinue = () => {

    if (isLoading) {
      return undefined;
    }


    const countPartiallyMatched = data.filter((item) => {
      return bankNameMatches?.[item.accountNumber] === "MATCH_PARTIAL";
    }).length;

    const countFailed = data.filter((item) => {
      return bankNameMatches?.[item.accountNumber] === "MATCH_FAIL";
    }).length;

    if (countFailed > 0) {
      return "ERROR";
    }
    if (countPartiallyMatched != 0) {

      return "WARNING";
    }
    return "SUCCESS";
  };


  const isNameMismatchDeclarationCompleted = () => {
    if (allowToContinue() === "SUCCESS") {
      return true;
    }
    return state.nameMismatchDeclarationBank?.isDownloaded && state.nameMismatchDeclarationBank?.isConfirmed;
  }

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-normal">Verify Bank Account</CardTitle>
      </CardHeader>
      <CardContent accountMode>
        {data.map((item, index) => (
          <BankViewCard
            status={getStatus(bankNameMatches?.[item.accountNumber] || "MATCH_FAIL")}
            statusLabel={getStatusLabel(bankNameMatches?.[item.accountNumber] || "MATCH_FAIL")}
            bank={item}
            key={item.accountNumber}

            setDefault={() => {
              setDefaultBankAccount(index);
              addAuditLog({
                type: "SET_DEFAULT_BANK_ACCOUNT",
                desc: `User set bank account at index ${item.bankName}:${item.accountNumber}  as default during KYC process.`,
              });
            }}
            onDelete={() => {
              removeBankAccount(index);
              addAuditLog({
                type: "REMOVE_BANK_ACCOUNT",
                desc: `User removed bank account at index ${item.bankName}:${item.accountNumber} during KYC process.`,
              });
              if (data.length === 1) {
                addBankAccount();
              }
              prevLocalStep();
              setTimeout(() => {
                pushUserKycState();
              }, 500);
            }}
          />
        ))}

        {allowToContinue() == "WARNING" && (
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
                  checked={state.nameMismatchDeclarationBank?.isConfirmed}
                  onCheckedChange={() => {
                    setNameMismatchDeclarationBank({
                      isConfirmed: !state.nameMismatchDeclarationBank?.isConfirmed,
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
                  checked={state.nameMismatchDeclarationBank?.isDownloaded}
                  onCheckedChange={() => {
                    setNameMismatchDeclarationBank({
                      isDownloaded: !state.nameMismatchDeclarationBank?.isDownloaded,
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
        {allowToContinue() == "ERROR" && (
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

      </CardContent>
      <CardFooter
        accountMode
        className="flex sm:flex-row flex-col-reverse justify-center sm:justify-between items-center gap-5 sm:text-left text-center"
      >
        <div className="flex sm:flex-row flex-col gap-5 w-full">
          {isNameMismatchDeclarationCompleted() && allowToContinue() != "ERROR" && !isLoading && <Button
            className="flex items-center gap-1 w-full sm:w-auto"
            disabled={!isAllowToContinue() || !isNameMismatchDeclarationCompleted()}
            onClick={jumpNext}
          >
            Confirm & Continue{" "}
            <div className="flex justify-center items-center p-0 h-full">
              <IoMdArrowDropright className="p-0 text-4xl" />
            </div>
          </Button>}
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
                  desc: "User chose to save and exit the KYC process : Bank Account Verification step.",
                });
                pushUserKycState({ exit: true });
              }
            }}
          >
            Save & Exit
          </Button>
        </div>
        {data.length < 5 && (
          <Button
            variant={`link`}
            onClick={() => {
              addAuditLog({
                type: "ADD_BANK_ACCOUNT",
                desc: "User chose to add a new bank account during KYC process.",
              });
              addActivityLog({
                action: "ADD_BANK_ACCOUNT",
                details: {
                  step: "Bank Account step",
                  Reason: "User added a new bank account",
                },
                entityType: "KYC",
              });
              addBankAccount();
              prevLocalStep();
            }}
          >
            <FaPlusSquare className="text-secondary text-xl" />
            Add Bank Account{" "}
            <span className="text-gray-500 text-xs">(Max 5 accounts)</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default VerifyBankAccount;
