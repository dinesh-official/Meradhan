"use client";

import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import { useState } from "react";
import { ZodError } from "zod";
import { AdditionalOptionsFormData } from "./additionalFormaData";
import { AdditionalOptionsSchema, RATINGS, SECTORS } from "./addtionalFormaData.schema";

export const initAdditionalOptionsData: AdditionalOptionsFormData = {
  sector: SECTORS[0],
  rating: RATINGS[0],
  notes: "",
};

export const useAdditionalOptionsFormDataHook = (
  initial: AdditionalOptionsFormData = initAdditionalOptionsData
) => {
  const [data, setData] = useState<AdditionalOptionsFormData>(initial);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AdditionalOptionsFormData, string[]>>
  >({});

  /** Update a single field and clear its error (if any) */
  const setAdditionalOptionsData = <K extends keyof AdditionalOptionsFormData>(
    key: K,
    value: AdditionalOptionsFormData[K]
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
  const validateField = <K extends keyof AdditionalOptionsFormData>(
    key: K,
    value: AdditionalOptionsFormData[K]
  ) => {
    const fieldSchema = AdditionalOptionsSchema.pick({ [key]: true });
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
  const validateAdditionalOptionsData = (): boolean => {
    console.log("Validating Additional Options Data:", data);
    try {
      AdditionalOptionsSchema.parse(data);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        setErrors(zodErrorToErrorMap(err));
      }
      return false;
    }
  };

  /** Reset all fields and errors */
  const resetAdditionalOptionsData = () => {
    setData(initial ?? initAdditionalOptionsData);
    setErrors({});
  };

  return {
    state: data,
    errors,
    setAdditionalOptionsData,
    resetAdditionalOptionsData,
    validateField,
    validateAdditionalOptionsData,
  };
};
