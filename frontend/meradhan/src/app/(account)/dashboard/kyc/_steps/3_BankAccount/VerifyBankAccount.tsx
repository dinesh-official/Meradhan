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
import BankViewCard from "./_elements/BankViewCard";
import { makeFullname } from "@/global/utils/formate";

function VerifyBankAccount() {
  const {
    setDefaultBankAccount,
    state,
    removeBankAccount,
    prevLocalStep,
    addBankAccount,
    setStepIndex,
  } = useKycDataStorage();
  const data = state.step_3;
  const { pushUserKycState } = useKycDataProvider();
  const { nextStep } = useKycStepStore();

  const isAllowToContinue = () => {
    const defaltSelcted = data.filter((item) => !item.isDefault);
    const allValid = data.filter((item) => !item.isVerified);

    return defaltSelcted.length === 0 && allValid.length === 0;
  };

  const jumpNext = () => {
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
            }}
            onDelete={() => {
              removeBankAccount(index);
              if (data.length === 1) {
                addBankAccount();
                prevLocalStep();
              }
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
            className="w-full sm:w-auto"
            disabled={!isAllowToContinue()}
            onClick={jumpNext}
          >
            Confirm & Continue <MdOutlineArrowRight />
          </Button>
          <Button
            variant={`link`}
            onClick={() => {
              const ask = window.confirm(
                "Are you sure you want to exit kyc process?"
              );
              if (ask) pushUserKycState({ exit: true });
            }}
          >
            Save & Exit
          </Button>
        </div>
        {data.length < 5 && (
          <Button
            variant={`link`}
            onClick={() => {
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
