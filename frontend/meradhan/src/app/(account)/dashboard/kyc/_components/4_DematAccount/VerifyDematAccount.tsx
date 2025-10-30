"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { AiFillPlusSquare } from "react-icons/ai";
import { MdOutlineArrowRight } from "react-icons/md";
import DematAccountView from "./_elements/DematAccountView";
import { useKycDataStorage } from "../../_store/useKycDataStorage";
import { useKycDataProvider } from "../../_context/KycDataProvider";
import { useKycStepStore } from "../../_store/useKycStepStore";

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
        <CardTitle className="font-medium">Verify Demat Account</CardTitle>
      </CardHeader>
      <CardContent accountMode>
        {accounts.map((item, index) => {
          return (
            <DematAccountView
              key={index}
              account={item}
              myPan={state.step_1.pan.panCardNo}
              name={
                state.step_1.pan.firstName +
                " " +
                state.step_1.pan.middleName +
                " " +
                state.step_1.pan.lastName
              }
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
        {accounts.length < 5 && (
          <Button
            variant={`link`}
            onClick={() => {
              addDepository();
              prevLocalStep();
            }}
          >
            <AiFillPlusSquare className="text-secondary text-xl" />
            Add Demat Account{" "}
            <span className="text-gray-500 text-xs">(max 5 accounts)</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default VerifyDematAccount;
