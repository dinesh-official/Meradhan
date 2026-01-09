"use client";

import { useState, useCallback } from "react";
import { ZodError } from "zod";
import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import {
  FollowUpNoteFormData,
  followUpNoteSchema,
} from "./leadFollowUpFormData.schema";
import { useFollowUpApiHook } from "./useFollowUpApiHook";

const initData: FollowUpNoteFormData = {
  text: "",
  nextFollowUpDate: "",
};

export const useFollowUpNoteFormHook = (
  leadId: number,
  initialState: FollowUpNoteFormData = initData
) => {
  const [data, setData] = useState<FollowUpNoteFormData>(initialState);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FollowUpNoteFormData, string[]>>
  >({});

  const followUpApi = useFollowUpApiHook();
  const { createFollowUpMutation } = followUpApi;
  /** Update a specific field */
  const setFollowUpNoteData = useCallback(
    <K extends keyof FollowUpNoteFormData>(
      key: K,
      value: FollowUpNoteFormData[K]
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

  /** Validate a single field */
  const validateField = useCallback(
    <K extends keyof FollowUpNoteFormData>(
      key: K,
      value: FollowUpNoteFormData[K]
    ) => {
      const fieldSchema = followUpNoteSchema.shape[key];
      try {
        fieldSchema.parse(value);
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

  /** Validate the entire form */
  const validateFollowUpNoteData = useCallback((): boolean => {
    try {
      const parsed = followUpNoteSchema.parse(data);
      setErrors({});
      createFollowUpMutation.mutate({ leadId, data: parsed });
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        setErrors(zodErrorToErrorMap(err));
      }
      return false;
    }
  }, [data, leadId, createFollowUpMutation]);

  /** Reset all fields and errors */
  const resetFollowUpNoteData = useCallback(() => {
    setData(initData);
    setErrors({});
  }, []);

  return {
    state: data,
    errors,
    setFollowUpNoteData,
    resetFollowUpNoteData,
    validateField,
    createFollowUpMutation,
    validateFollowUpNoteData,
  };
};
