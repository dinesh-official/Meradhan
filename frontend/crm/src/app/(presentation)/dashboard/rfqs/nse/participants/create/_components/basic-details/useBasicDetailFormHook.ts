"use client";

import { useState } from "react";
import { ZodError } from "zod";
import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import { BasicDetailsFormData } from "./basicDetails";
import { basicDetailsSchema } from "./basicDetails.schema";

/** Default initial Basic Details form values */
export const initBasicData: BasicDetailsFormData = {
  loginId: "",
  firstName: "",
  panNumber: "",
  custodian: "",
  contactPerson: "",
  telephone: "",
  fax: "",
};

/** Hook for Basic Details form management */
export const useBasicFormDataHook = (
  initial: BasicDetailsFormData = initBasicData
) => {
  const [data, setData] = useState<BasicDetailsFormData>(initial);
  const [errors, setErrors] = useState<
    Partial<Record<keyof BasicDetailsFormData, string[]>>
  >({});

  /** Update a single field and clear its error (if any) */
  const setBasicData = <K extends keyof BasicDetailsFormData>(
    key: K,
    value: BasicDetailsFormData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));

    // Clear existing error for this field (if any)
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  /** Validate a single field using its Zod schema */
  const validateField = <K extends keyof BasicDetailsFormData>(
    key: K,
    value: BasicDetailsFormData[K]
  ) => {
    const fieldSchema = basicDetailsSchema.shape[key];
    try {
      fieldSchema.parse({ [key]: value });
      // If valid → clear error
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

  /** Validate the entire Basic Details form */
  const validateBasicData = (): boolean => {
    try {
      basicDetailsSchema.parse(data);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        setErrors(zodErrorToErrorMap(err));
      }
      return false;
    }
  };

  /** Reset Basic Details form to initial state */
  const resetBasicData = () => {
    setData(initial ?? initBasicData);
    setErrors({});
  };

  return {
    state: data,
    errors,
    setBasicData,
    resetBasicData,
    validateField,
    validateBasicData,
  };
};
