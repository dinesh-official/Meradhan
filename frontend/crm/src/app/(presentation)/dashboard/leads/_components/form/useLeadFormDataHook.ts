"use client";

import { useState } from "react";
import { ZodError } from "zod";
import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import { BOND_TYPES, leadFormDataSchema } from "./leadfFormData.schema"; // ensure path/name matches your file
import { LeadFormData } from "./leadForm";

export const initLeadData: LeadFormData = {
  fullName: "",
  emailId: "",
  phoneNumber: "",
  company: "",
  leadSource: "Website",
  status: "New",
  assignTo: undefined,
  bondTypeInterest: BOND_TYPES[0],
  expectedInvestmentAmount: undefined,
  notes: "",
};

export const useLeadFormDataHook = (initial: LeadFormData = initLeadData) => {
  const [data, setData] = useState<LeadFormData>(initial);
  const [errors, setErrors] = useState<
    Partial<Record<keyof LeadFormData, string[]>>
  >({});

  /** Update a single field and clear its error (if any) */
  const setLeadData = <K extends keyof LeadFormData>(
    key: K,
    value: LeadFormData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  /** Validate a single field against the Zod schema */
  const validateField = <K extends keyof LeadFormData>(
    key: K,
    value: LeadFormData[K]
  ) => {
    const fieldSchema = leadFormDataSchema.pick({ [key]: true });
    try {
      fieldSchema.parse({ [key]: value });
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.issues.map((e) => e.message);
        setErrors((prev) => ({ ...prev, [key]: messages }));
      }
    }
  };

  /** Validate entire form; map errors for UI */
  const validateLeadData = (): boolean => {
    console.log("Validating lead data:", data);
    try {
      leadFormDataSchema.parse(data);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        setErrors(zodErrorToErrorMap(err));
      }
      return false;
    }
  };

  /** Reset state and errors */
  const resetLeadData = () => {
    setData(initial ?? initLeadData);
    setErrors({});
  };

  return {
    state: data,
    errors,
    setLeadData,
    resetLeadData,
    validateField,
    validateLeadData,
  };
};
