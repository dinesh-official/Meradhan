"use client";

import { useState } from "react";
import { ZodError } from "zod";
import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import { AddressInformationFormData } from "./addressFormData";
import { addressInformationSchema } from "./addressForm.schema";

/** Default initial Address Information form values */
export const initAddressData: AddressInformationFormData = {
  addressLine1: "",
  addressLine2: "",
  addressLine3: "",
  stateCode: "",
  registeredAddress: "",
};

/** Hook for Address Information form management */
export const useAddressFormDataHook = (
  initial: AddressInformationFormData = initAddressData
) => {
  const [data, setData] = useState<AddressInformationFormData>(initial);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AddressInformationFormData, string[]>>
  >({});

  /** Update a single field and clear its error (if any) */
  const setAddressData = <K extends keyof AddressInformationFormData>(
    key: K,
    value: AddressInformationFormData[K]
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
  const validateField = <K extends keyof AddressInformationFormData>(
    key: K,
    value: AddressInformationFormData[K]
  ) => {
    const fieldSchema = addressInformationSchema.shape[key];
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

  /** Validate the entire Address form */
  const validateAddressData = (): boolean => {
    try {
      addressInformationSchema.parse(data);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        setErrors(zodErrorToErrorMap(err));
      }
      return false;
    }
  };

  /** Reset Address form to initial state */
  const resetAddressData = () => {
    setData(initial ?? initAddressData);
    setErrors({});
  };

  return {
    state: data,
    errors,
    setAddressData,
    resetAddressData,
    validateField,
    validateAddressData,
  };
};
