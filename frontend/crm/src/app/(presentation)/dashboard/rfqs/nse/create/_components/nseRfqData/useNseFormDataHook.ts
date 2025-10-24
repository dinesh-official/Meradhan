"use client";

import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import { ParticipantData } from "@root/apiGateway";
import { useState } from "react";
import { ZodError } from "zod";
import {
  BUY_SELL,
  CALC_METHODS,
  DEAL_TYPES,
  NseRFQFormData,
  nseRFQFormDataSchema,
  QUOTE_TYPES,
  SEGMENTS,
  SETTLEMENT_TYPES,
  YIELD_TYPES
} from "./nseRfqFormData.schema";

export const initNseRFQData: NseRFQFormData = {
  isin: "",
  segment: SEGMENTS[0],
  buySell: BUY_SELL[0],
  quoteType: QUOTE_TYPES[0],
  clientCode: "",
  dealType: DEAL_TYPES[0],
  rfqSize: "",
  settlementType: SETTLEMENT_TYPES[0],
  quantity: "",
  yieldType: YIELD_TYPES[0],
  yield: "",
  calcMethod: CALC_METHODS[0],
  price: "",
  particempt: undefined
};

export const useRFQFormDataHook = (initial: NseRFQFormData = initNseRFQData) => {
  const [participant, setParticipant] = useState<ParticipantData | undefined>(undefined);

  const [data, setData] = useState<NseRFQFormData>(initial);
  const [errors, setErrors] = useState<
    Partial<Record<keyof NseRFQFormData, string[]>>
  >({});

  const setRFQData = <K extends keyof NseRFQFormData>(
    key: K,
    value: NseRFQFormData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const validateField = <K extends keyof NseRFQFormData>(
    key: K,
    value: NseRFQFormData[K]
  ) => {
    const fieldSchema = nseRFQFormDataSchema.pick({ [key]: true });
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

  const validateRFQData = (): boolean => {
    console.log("Validating RFQ Data:", data);
    try {
      nseRFQFormDataSchema.parse(data);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        setErrors(zodErrorToErrorMap(err));
      }
      return false;
    }
  };

  const resetRFQData = () => {
    setData(initial ?? initNseRFQData);
    setErrors({});
  };

  return {
    state: data,
    errors,
    setRFQData,
    resetRFQData,
    validateField,
    validateRFQData,
    participant: {
      participant,
      setParticipant
    }
  };
};
