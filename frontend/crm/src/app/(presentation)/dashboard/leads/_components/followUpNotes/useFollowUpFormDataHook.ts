"use client";

import { useState, useCallback } from "react";
import { ZodError } from "zod";
import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import { FollowUpNoteFormData, IFollowUpNoteFormHook } from "./followUpFormData";
import { followUpNoteSchema } from "./leadFollowUpFormData.schema";

const initData: FollowUpNoteFormData = {
  notes: "",
  nextFollowUpDate: "",
};

export const useFollowUpNoteFormHook = (
  initialState: FollowUpNoteFormData = initData
): IFollowUpNoteFormHook => {
  const [data, setData] = useState<FollowUpNoteFormData>(initialState);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FollowUpNoteFormData, string[]>>
  >({});

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
      const fieldSchema = followUpNoteSchema.pick({ [key]: true });
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

  /** Validate the entire form */
  const validateFollowUpNoteData = useCallback((): boolean => {
    console.log('validateFollowUpNoteData', data)
    try {
      followUpNoteSchema.parse(data);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        setErrors(zodErrorToErrorMap(err));
      }
      return false;
    }
  }, [data]);

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
    validateFollowUpNoteData,
  };
};
