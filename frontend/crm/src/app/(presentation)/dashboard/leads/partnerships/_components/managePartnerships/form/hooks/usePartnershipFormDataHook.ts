"use client";

import { parseError } from "@/core/error/parseError";
import { CrmUsersProfile } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";

import { PartnershipFormData } from "./partnershipFormData.schema";
import { partnershipFormDataSchema } from "./partnershipFormData.schema";
import { usePartnershipApiHook } from "./usePartnershipApiHook";

export const initPartnershipData: PartnershipFormData = {
  organizationName: "",
  organizationType: "",
  city: "",
  state: "",
  website: "",
  fullName: "",
  designation: "",
  emailAddress: "",
  mobileNumber: "",
  partnershipModel: appSchema.crm.partnership.partnershipModels[0],
  clientBase: "",
  message: "",
  status: appSchema.crm.partnership.partnershipStatus[0],
  assignTo: undefined,
};

export const usePartnershipFormDataHook = (
  initial: PartnershipFormData = initPartnershipData,
  {
    onComplete,
    goBackOnSuccess,
    partnershipId,
  }: {
    onComplete?: () => void;
    goBackOnSuccess?: boolean;
    partnershipId?: number;
  } = {}
) => {
  const [data, setData] = useState<PartnershipFormData>(initial);
  const [errors, setErrors] = useState<
    Partial<Record<keyof PartnershipFormData, string[]>>
  >({});

  const [relationManager, setRelationManager] = useState<
    CrmUsersProfile | undefined
  >(undefined);

  const partnershipApi = usePartnershipApiHook({
    goBackOnSuccess,
    onComplete,
    partnershipId,
  });
  const { createPartnershipMutation, updatePartnershipMutation } =
    partnershipApi;

  const setPartnershipData = useCallback(
    <K extends keyof PartnershipFormData>(
      key: K,
      value: PartnershipFormData[K]
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

  const setPartnershipDataMany = useCallback(
    (patch: Partial<PartnershipFormData>) => {
      setData((prev) => ({ ...prev, ...patch }));
      setErrors((prev) => {
        const copy = { ...prev };
        (Object.keys(patch) as (keyof PartnershipFormData)[]).forEach((k) => {
          if (copy[k]) delete copy[k];
        });
        return copy;
      });
    },
    []
  );

  const validateField = useCallback(
    <K extends keyof PartnershipFormData>(
      key: K,
      value: PartnershipFormData[K]
    ) => {
      const fieldSchema = partnershipFormDataSchema.shape[key];
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

  const validatePartnershipData = useCallback((): boolean => {
    try {
      partnershipFormDataSchema.parse(data);
      setErrors({});
      if (partnershipId) {
        const payload =
          appSchema.crm.partnership.updatePartnershipSchema.parse(data);
        updatePartnershipMutation.mutate(payload);
      } else {
        const payload =
          appSchema.crm.partnership.createPartnershipSchema.parse(data);
        createPartnershipMutation.mutate(payload as PartnershipFormData);
      }
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
  }, [
    data,
    createPartnershipMutation,
    updatePartnershipMutation,
    partnershipId,
  ]);

  const resetPartnershipData = useCallback(() => {
    setData(initial ?? initPartnershipData);
    setErrors({});
  }, [initial]);

  return {
    state: data,
    errors,
    setPartnershipDataMany,
    createPartnershipMutation,
    updatePartnershipMutation,
    setPartnershipData,
    resetPartnershipData,
    validateField,
    validatePartnershipData,
    relationManager: {
      relationManager,
      setRelationManager,
    },
  };
};
