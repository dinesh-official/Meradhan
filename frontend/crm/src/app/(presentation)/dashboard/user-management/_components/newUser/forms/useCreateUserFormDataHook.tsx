"use client";

import { useCallback, useState } from "react";
import { ZodError } from "zod";
import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import { userFormSchema } from "./newUser.schema";
import { UserFormData } from "./userForm";
import { ROLES } from "@/global/constants/role.constants";
import { useUserCreateApiHook } from "./useCreateUserApiHook";
import { parseError } from "@/core/error/parseError";
import { toast } from "sonner";
import { appSchema } from "@root/schema";

export const initUserData: UserFormData = {
  name: "",
  email: "",
  phoneNo: "",
  role: ROLES[0],
};

export const useCreateUserDataHook = (initial: UserFormData = initUserData) => {
  const [data, setData] = useState<UserFormData>(initial);
    const [open, setOpen] = useState(false);
  
  const [errors, setErrors] = useState<
    Partial<Record<keyof UserFormData, string[]>>
  >({});
  const createUserApi = useUserCreateApiHook({
    onSuccess:()=>{
      setOpen(false)
    }
  });
  const { createUserMutation } = createUserApi;

  /** ✅ Update a single field and clear its error */
  const setUserData = useCallback(
    <K extends keyof UserFormData>(key: K, value: UserFormData[K]) => {
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

  /** ✅ Validate a single field using Zod schema */
  const validateField = useCallback(
    <K extends keyof UserFormData>(key: K, value: UserFormData[K]) => {
      const fieldSchema = userFormSchema.pick({ [key]: true });
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

  /** ✅ Validate entire form (returns true if valid) */
  const validateUserData = useCallback((): boolean => {
    console.log("Validating user data:", data);
    try {
      userFormSchema.parse(data);
      setErrors({});
      const payload = appSchema.crm.user.createCRMUserSchema.parse(data);
      createUserMutation.mutate(payload);
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
  }, [data]);

  /** ✅ Reset form data and clear errors */
  const resetUserData = useCallback(() => {
    setData(initial ?? initUserData);
    setErrors({});
  }, [initial]);

  return {
    state: data,
    errors,
    popup:{
      setOpen,
      open
    },
    createUserMutation,
    setUserData,
    resetUserData,
    validateField,
    validateUserData,
  };
};
