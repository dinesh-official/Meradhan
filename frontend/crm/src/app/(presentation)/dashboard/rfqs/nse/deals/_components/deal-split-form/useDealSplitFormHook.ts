"use client";

import { useState, useCallback } from "react";
import { ZodError } from "zod";
import { zodErrorToErrorMap } from "@/global/utils/validation.utils";

import {
  calculationMethods,
  settlementOptions,
  goodTillDays,
  dealTypes,
  dealSplitFormSchema,
} from "./dealSplitFormData.schema";
import { DealSplitFormData, IDealSplitFormHook } from "./dealSplitFormData";

const initDealSplitData: DealSplitFormData = {
  value: "",
  yield: "",
  calculationMethod: calculationMethods[0],
  priceTriggeredDate: "",
  price: "",
  totalAccruedInterest: "",
  settlementDate: settlementOptions[0],
  quantity: "",
  goodTillDay: goodTillDays[0],
  endTime: "",
  stampDuty: "",
  dealType: dealTypes[0],
  clientCode: "",
  institution: false,
  notes: "",
};

export const useDealSplitFormHook = (
  initialState: DealSplitFormData = initDealSplitData
): IDealSplitFormHook & {
  /** Convenience helpers for UI */
  getError: <K extends keyof DealSplitFormData>(key: K) => string | undefined;
  hasError: <K extends keyof DealSplitFormData>(key: K) => boolean;
} => {
  const [data, setData] = useState<DealSplitFormData>(initialState);
  const [errors, setErrors] =
    useState<Partial<Record<keyof DealSplitFormData, string[]>>>({});

  const setDealSplitData = useCallback(
    <K extends keyof DealSplitFormData>(key: K, value: DealSplitFormData[K]) => {
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

  const validateField = useCallback(
    <K extends keyof DealSplitFormData>(key: K, value: DealSplitFormData[K]) => {
      const fieldSchema = dealSplitFormSchema.pick({ [key]: true } as any);
      try {
        fieldSchema.parse({ [key]: value } as any);
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

  const validateDealSplitData = useCallback((): boolean => {
    try {
      dealSplitFormSchema.parse(data);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        setErrors(zodErrorToErrorMap(err));
      }
      return false;
    }
  }, [data]);

  const resetDealSplitData = useCallback(() => {
    setData(initDealSplitData);
    setErrors({});
  }, []);

  const getError = useCallback(
    <K extends keyof DealSplitFormData>(key: K) => errors[key]?.[0],
    [errors]
  );
  const hasError = useCallback(
    <K extends keyof DealSplitFormData>(key: K) => !!errors[key]?.length,
    [errors]
  );

  return {
    state: data,
    errors,
    setDealSplitData,
    resetDealSplitData,
    validateField,
    validateDealSplitData,
    getError,
    hasError,
  };
};
