"use client"

import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import { useState } from "react";
import { ZodError } from "zod";
import { BankAccountFormData, BankAccountsFormData, IBankAccountFormHook } from "./backAccount";
import { bankAccountSchema, bankAccountsSchema } from "./backAccount.schema";

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
  const [errors, setErrors] = useState<
    Record<string, Partial<Record<keyof BankAccountFormData, string[]>>>
  >({});

  /** Add a new blank bank account */
  const addBankAccount = () => {
    setState((prev) => [...prev, createBlankBankAccount()]);
  };

  /** Remove an account and ensure one default remains */
  const removeBankAccount = (id: string) => {
    setState((prev) => {
      const next = prev.filter((a) => a.id !== id);
      if (next.length && !next.some((a) => a.isdefaultaccount === "Yes")) {
        next[0].isdefaultaccount = "Yes";
      }
      return next;
    });

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  /** Update a specific field in a specific account */
  const setBankAccountData = <K extends keyof BankAccountFormData>(
    id: string,
    key: K,
    value: BankAccountFormData[K]
  ) => {
    setState((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [key]: value } : a))
    );

    // Clear that field’s error (if any)
    setErrors((prev) => {
      const copy = { ...prev };
      if (!copy[id]) return copy;
      const accErrs = { ...copy[id] };
      delete accErrs[key];
      copy[id] = accErrs;
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
    const account = state.find((a) => a.id === id);
    if (!account) return false;

    try {
      bankAccountSchema.parse(account);
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[id];
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
    try {
      bankAccountsSchema.parse(state);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors = zodErrorToErrorMap(err);
        // Optional: You could group errors per account here
        console.error("Bank account validation failed:", fieldErrors);
      }
      return false;
    }
  };

  /** Reset everything */
  const resetBankAccounts = () => {
    setState(initial ?? initBankAccountsData);
    setErrors({});
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
