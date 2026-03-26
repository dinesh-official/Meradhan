"use client";

import { useState } from "react";
import { ZodError } from "zod";
import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import { leiInformationSchema } from "./leiInformationForm.schema";
import { LEIInformationFormData } from "./leiInformationForm";

/** Default initial LEI form values */
export const initLEIData: LEIInformationFormData = {
  leicode: "",
  expirydate: "",
};

/** Hook for LEI Information form management */
export const useLEIInformationFormHook = (
  initial: LEIInformationFormData = initLEIData
) => {
  const [data, setData] = useState<LEIInformationFormData>(initial);
  const [errors, setErrors] = useState<
    Partial<Record<keyof LEIInformationFormData, string[]>>
  >({});

  /** Update a single field and clear its error (if any) */
  const setLEIData = <K extends keyof LEIInformationFormData>(
    key: K,
    value: LEIInformationFormData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));

    // Clear error for the updated field
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  /** Validate a single field */
  const validateField = <K extends keyof LEIInformationFormData>(
    key: K,
    value: LEIInformationFormData[K]
  ) => {
    const fieldSchema = leiInformationSchema.shape[key];
    try {
      fieldSchema.parse({ [key]: value });
      // If valid, clear error
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

  /** Validate the entire LEI form */
  const validateLEIData = (): boolean => {
    try {
      leiInformationSchema.parse(data);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        setErrors(zodErrorToErrorMap(err));
      }
      return false;
    }
  };

  /** Reset form and errors */
  const resetLEIData = () => {
    setData(initial ?? initLEIData);
    setErrors({});
  };

  return {
    state: data,
    errors,
    setLEIData,
    resetLEIData,
    validateField,
    validateLEIData,
  };
};
