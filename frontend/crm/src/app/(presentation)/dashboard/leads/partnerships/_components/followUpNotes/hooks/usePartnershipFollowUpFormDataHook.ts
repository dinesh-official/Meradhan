"use client";

import { useState, useCallback } from "react";
import { ZodError } from "zod";
import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import {
  PartnershipFollowUpNoteFormData,
  partnershipFollowUpNoteSchema,
} from "./partnershipFollowUpFormData.schema";
import { usePartnershipFollowUpApiHook } from "./usePartnershipFollowUpApiHook";

const initData: PartnershipFollowUpNoteFormData = {
  text: "",
  nextFollowUpDate: "",
};

export interface IFollowUpNoteFormHook {
  state: PartnershipFollowUpNoteFormData;
  errors: Partial<Record<keyof PartnershipFollowUpNoteFormData, string[]>>;
  setFollowUpNoteData: <K extends keyof PartnershipFollowUpNoteFormData>(
    key: K,
    value: PartnershipFollowUpNoteFormData[K]
  ) => void;
  validateFollowUpNoteData: () => void;
  resetFollowUpNoteData: () => void;
}

export const usePartnershipFollowUpNoteFormHook = (
  partnershipId: number,
  initialState: PartnershipFollowUpNoteFormData = initData
) => {
  const [data, setData] =
    useState<PartnershipFollowUpNoteFormData>(initialState);
  const [errors, setErrors] = useState<
    Partial<Record<keyof PartnershipFollowUpNoteFormData, string[]>>
  >({});

  const followUpApi = usePartnershipFollowUpApiHook({ partnershipId });
  const { createFollowUpMutation } = followUpApi;

  const setFollowUpNoteData = useCallback(
    <K extends keyof PartnershipFollowUpNoteFormData>(
      key: K,
      value: PartnershipFollowUpNoteFormData[K]
    ) => {
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

  const validateFollowUpNoteData = useCallback((): void => {
    try {
      const parsed = partnershipFollowUpNoteSchema.parse(data);
      setErrors({});
      createFollowUpMutation.mutate({ partnershipId, data: parsed });
      setData(initData); // Reset form after successful submission
    } catch (err) {
      if (err instanceof ZodError) {
        setErrors(zodErrorToErrorMap(err));
      }
    }
  }, [data, partnershipId, createFollowUpMutation]);

  const resetFollowUpNoteData = useCallback(() => {
    setData(initData);
    setErrors({});
  }, []);

  return {
    state: data,
    errors,
    setFollowUpNoteData,
    resetFollowUpNoteData,
    validateFollowUpNoteData,
  };
};

