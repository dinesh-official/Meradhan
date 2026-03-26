"use client";

import { parseError } from "@/core/error/parseError";
import { CrmUsersProfile } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";
import {
  bonds,
  source,
} from "../../../../../../../../../../../packages/schema/lib/crm/leads.schema";
import { LeadFormData } from "./leadForm";
import { leadFormDataSchema } from "./leadFormData.schema"; // ensure path/name matches your file
import { useLeadFollowUpApiHook } from "./useLeadApiHook";

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

export const useLeadFormDataHook = (
  initial: LeadFormData = initLeadData,
  {
    onComplete,
    goBackOnSuccess,
  }: { onComplete?: () => void; goBackOnSuccess?: boolean }
) => {
  const [data, setData] = useState<LeadFormData>(initial);
  const [errors, setErrors] = useState<
    Partial<Record<keyof LeadFormData, string[]>>
  >({});

  const [relationManager, setRelationManager] = useState<
    CrmUsersProfile | undefined
  >(undefined);

  const leadsApi = useLeadFollowUpApiHook({ goBackOnSuccess, onComplete });
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
  const setLeadDataMany = useCallback((patch: Partial<LeadFormData>) => {
    setData((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const copy = { ...prev };
      (Object.keys(patch) as (keyof LeadFormData)[]).forEach((k) => {
        if (copy[k]) delete copy[k];
      });
      return copy;
    });
  }, []);

  /** Validate a single field against the Zod schema */
  const validateField = useCallback(
    <K extends keyof LeadFormData>(key: K, value: LeadFormData[K]) => {
      const fieldSchema = leadFormDataSchema.shape[key];
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

  /** Validate entire form; map errors for UI */
  const validateLeadData = useCallback((): boolean => {
    try {
      leadFormDataSchema.parse(data);
      setErrors({});
      const payload = appSchema.crm.leads.createNewLeadSchema.parse(data);
      createLeadMutation.mutate(payload);
      return true;
    } catch (error) {
      const err = parseError<ZodError>(error);
      if (err.issues.length) {
        toast.error(err.issues[0].message);
      } else {
        toast.error(err.message);
      }
      return false;
    }
  }, [data, createLeadMutation]);

  /** Reset state and errors */
  const resetLeadData = useCallback(() => {
    setData(initial ?? initLeadData);
    setErrors({});
  }, [initial]);

  return {
    state: data,
    errors,
    setLeadDataMany,
    createLeadMutation,
    setLeadData,
    resetLeadData,
    validateField,
    validateLeadData,
    relationManager: {
      relationManager,
      setRelationManager,
    },
  };
};
