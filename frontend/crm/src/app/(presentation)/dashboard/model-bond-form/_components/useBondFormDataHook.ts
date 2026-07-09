"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";
import { BondFormData } from "./bondForm";
import { bondSchema } from "./bondFormData.schema";

// 🧩 Initial form state
export const initBondData: BondFormData = {
  isin: "",
  bondName: "",
  instrumentName: "",
  description: "",
  issuePrice: 0,
  faceValue: 0,
  couponRate: 0,
  interestPaymentFrequency: "",
  putCallOptionDetails: "",
  certificateNumbers: "",
  totalIssueSize: 0,
  registrarDetails: "",
  physicalSecurityAddress: "",
  defaultedInRedemption: "",
  debentureTrustee: "",
  creditRatingInfo: "",
  remarks: "",
  taxStatus: "UNKNOWN",
  creditRating: "UnRated",
  interestPaymentMode: "UNKNOWN",
  isListed: "UNKNOWN",
  ratingAgencyName: "",
  ratingDate: undefined,
  categories: [],
  sectorName: "",
  dateOfAllotment: undefined,
  redemptionDate: undefined,
  maturityDate: undefined,
};

// 🪄 Hook definition
export const useBondFormDataHook = (initial: BondFormData = initBondData) => {
  const [data, setData] = useState<BondFormData>(initial);
  const [errors, setErrors] = useState<
    Partial<Record<keyof BondFormData, string[]>>
  >({});

  /** ✅ Update single field */
  const setBondData = useCallback(
    <K extends keyof BondFormData>(key: K, value: BondFormData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    },
    []
  );

  /** ✅ Update multiple fields */
  const setBondDataMany = useCallback((patch: Partial<BondFormData>) => {
    setData((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const copy = { ...prev };
      (Object.keys(patch) as (keyof BondFormData)[]).forEach((k) => {
        if (copy[k]) delete copy[k];
      });
      return copy;
    });
  }, []);

  /** 🧭 Validate one field */
  const validateField = useCallback(
    <K extends keyof BondFormData>(key: K, value: BondFormData[K]) => {
      const fieldSchema = bondSchema.shape[key];
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
    },
    []
  );

  /** 🧩 Validate entire form */
  const validateBondData = useCallback((): boolean => {
    try {
      bondSchema.parse(data);
      setErrors({});
      toast.success("Bond data validated successfully");
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.issues[0]?.message || "Validation failed";
        toast.error(firstError);
        const fieldErrors: Partial<Record<keyof BondFormData, string[]>> = {};
        error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof BondFormData;
          fieldErrors[path] = [issue.message];
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  }, [data]);

  /** 🔄 Reset form */
  const resetBondData = useCallback(() => {
    setData(initial ?? initBondData);
    setErrors({});
  }, [initial]);

  return {
    state: data,
    errors,
    setBondData,
    setBondDataMany,
    validateField,
    validateBondData,
    resetBondData,
  };
};
