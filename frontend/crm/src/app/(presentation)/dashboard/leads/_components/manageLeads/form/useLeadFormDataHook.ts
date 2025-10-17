"use client";

import { useState, useCallback } from "react";
import { ZodError } from "zod";
import { leadFormDataSchema } from "./leadFormData.schema"; // ensure path/name matches your file
import { LeadFormData } from "./leadForm";
import {
  bonds,
  source,
} from "../../../../../../../../../../packages/schema/lib/crm/leads.schema";
import { useLeadFollowUpApiHook } from "./useLeadApiHook";
import { appSchema } from "@root/schema";
import { parseError } from "@/core/error/parseError";
import { toast } from "sonner";

export const initLeadData: LeadFormData = {
  fullName: "",
  emailAddress: "",
  phoneNo: "",
  companyName: "",
  leadSource: source[0],
  status: "NEW",
  assignTo: undefined,
  bondType: bonds[0],
  exInvestmentAmount: undefined,
  note: "",
};

export const useLeadFormDataHook = (initial: LeadFormData = initLeadData) => {
  const [data, setData] = useState<LeadFormData>(initial);
  const [errors, setErrors] = useState<
    Partial<Record<keyof LeadFormData, string[]>>
  >({});
  const leadsApi = useLeadFollowUpApiHook();
  const { createLeadMutation } = leadsApi;
  /** Update a single field and clear its error (if any) */
  const setLeadData = useCallback(
    <K extends keyof LeadFormData>(key: K, value: LeadFormData[K]) => {
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

  /** Validate a single field against the Zod schema */
  const validateField = useCallback(
    <K extends keyof LeadFormData>(key: K, value: LeadFormData[K]) => {
      const fieldSchema = leadFormDataSchema.pick({ [key]: true });
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

  /** Validate entire form; map errors for UI */
  const validateLeadData = useCallback((): boolean => {
    console.log("Validating lead data:", data);
    try {
      leadFormDataSchema.parse(data);
      setErrors({});
      const payload = appSchema.crm.leads.createNewLeadSchema.parse(data);
      createLeadMutation.mutate(payload);
      return true;
    } catch (error) {
     console.log("error hai in validateUserData", error);
      const err = parseError<ZodError>(error);
      if (err.issues.length) {
        toast.error(err.issues[0].message);
      } else {
        toast.error(err.message);
      }
      return false;
    }
  }, [data,createLeadMutation]);

  /** Reset state and errors */
  const resetLeadData = useCallback(() => {
    setData(initial ?? initLeadData);
    setErrors({});
  }, [initial]);

  return {
    state: data,
    errors,
    createLeadMutation,
    setLeadData,
    resetLeadData,
    validateField,
    validateLeadData,
  };
};
