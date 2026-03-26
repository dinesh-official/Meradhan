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
import DematAccountView from "./_elements/DematAccountView";
import { addActivityLog } from "@/analytics/UserTrackingProvider";

function VerifyDematAccount() {
  const {
    state,
    setDefaultDepository,
    removeDepository,
    addDepository,
    prevLocalStep,
    setStepIndex,
    updateDepository,
  } = useKycDataStorage();

  const { pushUserKycState, addAuditLog } = useKycDataProvider();
  const { nextStep } = useKycStepStore();

  const isAllowToContinue = () => {
    const defaltSelcted = accounts.filter((item) => item.isDefault);
    const allValid = accounts.filter((item) => item.isVerified);
    return defaltSelcted.length !== 0 && allValid.length !== 0;
  };

  const accounts = state.step_4;

  const jumpNext = () => {
    addAuditLog({
      type: "DEMAT_KYC_STEP_COMPLETED",
      desc: "User completed the Demat Account Verification step during KYC process.",
    });
    addActivityLog({
      action: "ADD_DEMAT_ACCOUNT_CONFIRMED",
      details: {
        step: "Demat Account step",
        Reason: "User confirmed the Demat account details",
      },
      entityType: "KYC",
    });
    accounts.forEach((e, i) => {
      updateDepository(i, {
        ...e,
        confirmDematTimestamp: new Date().toISOString(),
      });
    });

    pushUserKycState();
    setStepIndex(0);
    nextStep();
  };

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-normal">Verify Demat Account</CardTitle>
      </CardHeader>
      <CardContent accountMode>
        {accounts.map((item, index) => {
          return (
            <DematAccountView
              key={index}
              account={item}
              myPan={state.step_1.pan.panCardNo}
              name={makeFullname({
                firstName: state.step_1.pan.firstName,
                middleName: state.step_1.pan.middleName,
                lastName: state.step_1.pan.lastName,
              })}
              setDefault={() => {
                addAuditLog({
                  type: "SET_DEFAULT_DEMAT_ACCOUNT",
                  desc: `User set a Demat account at index ${item.beneficiaryClientId} as default during KYC process.`,
                });
                setDefaultDepository(index);
              }}
              onDelete={() => {
                removeDepository(index);
                addAuditLog({
                  type: "REMOVE_DEMAT_ACCOUNT",
                  desc: `User removed a Demat account at index ${item.beneficiaryClientId} during KYC process.`,
                });
                if (accounts.length === 1) {
                  addDepository();
                }
                prevLocalStep();
                setTimeout(() => {
                  pushUserKycState();
                }, 500);
              }}
            />
          );
        })}
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
                  desc: "User chose to save and exit the KYC process : Demat Account Verification step.",
                });
                pushUserKycState({ exit: true });
              }
            }}
          >
            Save & Exit
          </Button>
        </div>
        {accounts.length < 5 && (
          <Button
            variant={`link`}
            onClick={() => {
              addAuditLog({
                type: "ADD_DEMAT_ACCOUNT",
                desc: "User added a new Demat account during KYC process.",
              });
              addActivityLog({
                action: "ADD_DEMAT_ACCOUNT",
                details: {
                  step: "Demat Account step",
                  Reason: "User added  a new Demat account button clicked",
                },
                entityType: "KYC",
              });
              addDepository();
              prevLocalStep();
            }}
          >
            <FaPlusSquare className="text-secondary text-xl" />
            Add Demat Account{" "}
            <span className="text-gray-500 text-xs">(max 5 accounts)</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default VerifyDematAccount;
