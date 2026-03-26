"use client";

import { useState } from "react";
import { ZodError } from "zod";
import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import { DP_TYPE, dpAccountSchema, dpAccountsSchema } from "./dpAccount.schema";
import { DPAccountFormData, DPAccountsFormData, IDPAccountFormHook } from "./dpaccount";

// ✅ adjust paths to your structure


/** Create a fresh blank DP account row */
export const createBlankDPAccount = (): DPAccountFormData => ({
  id: crypto.randomUUID(),
  dptype: DP_TYPE[0],      // default to "NSDL"
  dpid: "",
  beneficiaryid: "Self",
  isdefaultaccount: "No",
});

/** Initialize with one default account */
export const initDPAccountsData: DPAccountsFormData = [
  { ...createBlankDPAccount(), isdefaultaccount: "Yes" },
];

export const useDPAccountFormHook = (
  initial: DPAccountsFormData = initDPAccountsData
): IDPAccountFormHook => {
  const [state, setState] = useState<DPAccountsFormData>(initial);
  const [errors, setErrors] = useState<
    Record<string, Partial<Record<keyof DPAccountFormData, string[]>>>
  >({});

  /** Add a new blank DP account */
  const addDPAccount = () => {
    setState((prev: DPAccountsFormData) => [...prev, createBlankDPAccount()]);
  };

  /** Remove a DP account and ensure exactly one default remains */
  const removeDPAccount = (id: string) => {
    setState((prev: DPAccountsFormData) => {
      const next = prev.filter((a) => a.id !== id);
      if (next.length && !next.some((a) => a.isdefaultaccount === "Yes")) {
        next[0].isdefaultaccount = "Yes";
      }
      return next;
    });

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  /** Update a specific field in a specific DP account */
  const setDPAccountData = <K extends keyof DPAccountFormData>(
    id: string,
    key: K,
    value: DPAccountFormData[K]
  ) => {
    setState((prev: DPAccountsFormData) =>
      prev.map((a) => (a.id === id ? { ...a, [key]: value } : a))
    );

    // Clear field error (if present)
    setErrors((prev) => {
      const copy = { ...prev };
      if (!copy[id]) return copy;
      const accErrs = { ...copy[id] };
      delete accErrs[key];
      copy[id] = accErrs;
      return copy;
    });
  };

  /** Mark one account as default ("Yes"), all others as "No" */
  const setDefaultDPAccount = (id: string) => {
    setState((prev: DPAccountsFormData) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, isdefaultaccount: "Yes" }
          : { ...a, isdefaultaccount: "No" }
      )
    );
  };

  /** Validate a single DP account and store its field errors */
  const validateSingleDPAccount = (id: string): boolean => {
    const account = state.find((a) => a.id === id);
    if (!account) return false;

    try {
      dpAccountSchema.parse(account);
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

  /** Validate all accounts (array-level rules, incl. single default) */
  const validateAllDPAccounts = (): boolean => {
    try {
      dpAccountsSchema.parse(state);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        // You can enhance to group by account.id if needed
      }
      return false;
    }
  };

  /** Reset everything */
  const resetDPAccounts = () => {
    setState(initial ?? initDPAccountsData);
    setErrors({});
  };

  return {
    state,
    errors,
    addDPAccount,
    removeDPAccount,
    setDPAccountData,
    setDefaultDPAccount,
    validateSingleDPAccount,
    validateAllDPAccounts,
    resetDPAccounts,
  };
};
