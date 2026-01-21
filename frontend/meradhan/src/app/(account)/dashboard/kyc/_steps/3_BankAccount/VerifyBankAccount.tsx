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
import { FaPlusSquare } from "react-icons/fa";
import { IoMdArrowDropright } from "react-icons/io";
import Swal from "sweetalert2";
import { useKycDataProvider } from "../../_context/KycDataProvider";
import { useKycDataStorage } from "../../_store/useKycDataStorage";
import { useKycStepStore } from "../../_store/useKycStepStore";
import BankViewCard from "./_elements/BankViewCard";
import { addActivityLog } from "@/analytics/UserTrackingProvider";

function VerifyBankAccount() {
  const {
    setDefaultBankAccount,
    state,
    removeBankAccount,
    prevLocalStep,
    addBankAccount,
    setStepIndex,
    updateBankAccount,
  } = useKycDataStorage();
  const data = state.step_3;
  const { pushUserKycState, addAuditLog } = useKycDataProvider();
  const { nextStep } = useKycStepStore();

  const isAllowToContinue = () => {
    const defaltSelcted = data.filter((item) => item.isDefault);
    const allValid = data.filter((item) => item.isVerified);
    return defaltSelcted.length !== 0 && allValid.length !== 0;
  };

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

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-normal">Verify Bank Account</CardTitle>
      </CardHeader>
      <CardContent accountMode>
        {data.map((item, index) => (
          <BankViewCard
            bank={item}
            key={item.accountNumber}
            name={makeFullname({
              firstName: state.step_1.pan.firstName,
              middleName: state.step_1.pan.middleName,
              lastName: state.step_1.pan.lastName,
            })}
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
      </CardContent>
      <CardFooter
        accountMode
        className="flex sm:flex-row flex-col-reverse justify-center sm:justify-between items-center gap-5 sm:text-left text-center"
      >
        <div className="flex sm:flex-row flex-col gap-5 w-full">
          <Button
            className="flex items-center gap-1 w-full sm:w-auto"
            disabled={!isAllowToContinue()}
            onClick={jumpNext}
          >
            Confirm & Continue{" "}
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
