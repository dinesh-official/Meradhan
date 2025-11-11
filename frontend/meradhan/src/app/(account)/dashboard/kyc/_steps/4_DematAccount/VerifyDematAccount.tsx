"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaPlusSquare } from "react-icons/fa";
import { MdOutlineArrowRight } from "react-icons/md";
import { useKycDataProvider } from "../../_context/KycDataProvider";
import { useKycDataStorage } from "../../_store/useKycDataStorage";
import { useKycStepStore } from "../../_store/useKycStepStore";
import DematAccountView from "./_elements/DematAccountView";
import { makeFullname } from "@/global/utils/formate";
import Swal from "sweetalert2";

function VerifyDematAccount() {
  const {
    state,
    setDefaultDepository,
    removeDepository,
    addDepository,
    prevLocalStep,
    setStepIndex,
  } = useKycDataStorage();

  const { pushUserKycState } = useKycDataProvider();
  const { nextStep } = useKycStepStore();

  const isAllowToContinue = () => {
    const defaltSelcted = accounts.filter((item) => !item.isDefault);
    const allValid = accounts.filter((item) => !item.isVerified);

    return defaltSelcted.length === 0 && allValid.length === 0;
  };

  const jumpNext = () => {
    pushUserKycState();
    setStepIndex(0);
    nextStep();
  };

  const accounts = state.step_4;
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
                setDefaultDepository(index);
              }}
              onDelete={() => {
                removeDepository(index);
                if (accounts.length === 1) {
                  addDepository();
                  prevLocalStep();
                }
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
            className="w-full sm:w-auto"
            disabled={!isAllowToContinue()}
            onClick={jumpNext}
          >
            Confirm & Continue <MdOutlineArrowRight />
          </Button>
          <Button
            variant={`link`}
            onClick={async () => {

              const result = await Swal.fire({
                text: "Are you sure you want to save and exit the KYC process?",
                imageUrl: "/images/icons/sad-emoji.svg",
                showCancelButton: true,
                confirmButtonText: "Yes, Exit",
                cancelButtonText: "Cancel",
              });
              
              if (result.isConfirmed) {
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
