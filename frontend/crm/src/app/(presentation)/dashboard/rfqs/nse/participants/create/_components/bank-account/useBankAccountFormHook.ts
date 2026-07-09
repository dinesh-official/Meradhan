"use client"

import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import { useState } from "react";
import { ZodError } from "zod";
import { BankAccountFormData, BankAccountsFormData, IBankAccountFormHook } from "./backAccount";
import { bankAccountSchema } from "./backAccount.schema";

export const createBlankBankAccount = (): BankAccountFormData => ({
  id: crypto.randomUUID(),
  bankname: "",
  ifsccode: "",
  accountnumber: "",
  isdefaultaccount: "No",
});
export const initBankAccountsData: BankAccountsFormData = [
  { ...createBlankBankAccount(), isdefaultaccount: "Yes" },
];

export const useBankAccountFormHook = (
  initial: BankAccountsFormData = initBankAccountsData
): IBankAccountFormHook => {
  const [state, setState] = useState<BankAccountsFormData>(initial);
  const [errors, setErrors] = useState<IBankAccountFormHook['errors']>([]);

  /** Add a new blank bank account */
  const addBankAccount = () => {
    setState((prev) => [...prev, createBlankBankAccount()]);
  };

  /** Remove an account and ensure one default remains */
  const removeBankAccount = (id: string) => {
    const index = state.findIndex((a) => a.id == id);
    setState((prev) => {
      const next = prev.filter((a) => a.id !== id);
      if (next.length && !next.some((a) => a.isdefaultaccount === "Yes")) {
        next[0].isdefaultaccount = "Yes";
      }
      return next;
    });

    setErrors((prev) => {

      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
  };

  /** Update a specific field in a specific account */
  const setBankAccountData = <K extends keyof BankAccountFormData>(
    id: string,
    key: K,
    value: BankAccountFormData[K]
  ) => {
    const index = state.findIndex((a) => a.id == id);

    setState((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [key]: value } : a))
    );

    // Clear that field’s error (if any)
    setErrors((prev) => {
      const copy = { ...prev };
      if (!copy[index]) return copy;
      const accErrs = { ...copy[index] };

      copy[index] = accErrs;
      return copy;
    });
  };

  /** Mark one account as default ("Yes"), rest as "No" */
  const setDefaultBankAccount = (id: string) => {
    setState((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, isdefaultaccount: "Yes" }
          : { ...a, isdefaultaccount: "No" }
      )
    );
  };

  /** Validate a single account and update its errors */
  const validateSingleBankAccount = (id: string): boolean => {
    const index = state.findIndex((a) => a.id == id);

    const account = state.find((a) => a.id === id);
    if (!account) return false;

    try {
      bankAccountSchema.parse(account);
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      });
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors = zodErrorToErrorMap(err);
        setErrors((prev) => ({ ...prev, [id]: fieldErrors }));
      }
      return false;
    }
  };

  /** Validate all accounts (using array schema) */
  const validateAllBankAccounts = (): boolean => {

    const errorsData: IBankAccountFormHook['errors'] = [];

    state.forEach((data) => {
      try {
        bankAccountSchema.parse(data);
      } catch (error) {
        const fieldErrors = zodErrorToErrorMap<ZodError>(error);
        errorsData.push(fieldErrors as IBankAccountFormHook['errors'][number])
      }
    })
    
    setErrors(errorsData)
    return false;
  };

  /** Reset everything */
  const resetBankAccounts = () => {
    setState(initial ?? initBankAccountsData);
    setErrors([]);
  };

  return {
    state,
    errors,
    addBankAccount,
    removeBankAccount,
    setBankAccountData,
    setDefaultBankAccount,
    validateSingleBankAccount,
    validateAllBankAccounts,
    resetBankAccounts,
  };
};
