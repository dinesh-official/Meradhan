"use client";
import {
  KycDataStorage,
  useKycDataStorage,
} from "../../_store/useKycDataStorage";
import NewBankForm from "./_hooks/NewBankForm";
import { useAddBankAccountFormHook } from "./_hooks/useAddBankAccountFormHook";

function AddBankAccountForm() {
  const { error, handleBankAccountSubmit, fetchBankIfsc, isPending } =
    useAddBankAccountFormHook();
  const { updateBankAccount, state, removeBankAccount, nextLocalStep } =
    useKycDataStorage();
  const data = state.step_3[state.step_3.length - 1];

  const updateData = (
    key: keyof KycDataStorage["step_3"][number],
    data: string | boolean | unknown
  ) => {
    updateBankAccount(state.step_3.length - 1, {
      [key]: data,
    });
  };

  return (
    <NewBankForm
      data={data}
      updateData={updateData}
      error={error}
      fetchBankIfsc={() => {
        fetchBankIfsc.mutate();
      }}
      isPending={isPending}
      handleBankAccountSubmit={handleBankAccountSubmit}
      showCancel={state.step_3.length > 1}
      onCancel={() => {
        removeBankAccount(state.step_3.length - 1);
        nextLocalStep();
      }}
    />
  );
}

export default AddBankAccountForm;
