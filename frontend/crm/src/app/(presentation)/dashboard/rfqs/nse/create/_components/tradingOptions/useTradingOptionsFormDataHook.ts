"use client";

import { useState } from "react";
import { ZodError } from "zod";
import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import { TradingOptionsSchema, ACCESS_TYPES } from "./tradingOptionsFormData.schema";
import { TradingOptionsFormData } from "./tradingOptionsFormData";

export const initTradingOptionsData: TradingOptionsFormData = {
  rfqValidTillMarketClose: false,
  rfqExpiryTime: "",
  quoteNegotiable: false,
  valueNegotiable: false,
  minimumValue: "",
  valueStepSize: "",
  accessType: ACCESS_TYPES[0],
  anonymous: false,
};

export const useTradingOptionsFormDataHook = (
  initial: TradingOptionsFormData = initTradingOptionsData
) => {
  const [data, setData] = useState<TradingOptionsFormData>(initial);
  const [errors, setErrors] = useState<
    Partial<Record<keyof TradingOptionsFormData, string[]>>
  >({});

  /** Update a single field and clear its error (if any) */
  const setTradingOptionsData = <K extends keyof TradingOptionsFormData>(
    key: K,
    value: TradingOptionsFormData[K]
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
  const validateField = <K extends keyof TradingOptionsFormData>(
    key: K,
    value: TradingOptionsFormData[K]
  ) => {
    const fieldSchema = TradingOptionsSchema.pick({ [key]: true });
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
  const validateTradingOptionsData = (): boolean => {
    console.log("Validating Trading Options Data:", data);
    try {
      TradingOptionsSchema.parse(data);
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
  const resetTradingOptionsData = () => {
    setData(initial ?? initTradingOptionsData);
    setErrors({});
  };

  return {
    state: data,
    errors,
    setTradingOptionsData,
    resetTradingOptionsData,
    validateField,
    validateTradingOptionsData,
  };
};
