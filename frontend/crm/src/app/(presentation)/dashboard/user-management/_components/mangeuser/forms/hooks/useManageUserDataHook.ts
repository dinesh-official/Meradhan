"use client";

import { parseError } from "@/core/error/parseError";
import { ROLES } from "@/global/constants/role.constants";
import { appSchema } from "@root/schema";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";
import { userFormSchema } from "./manageUser.schema";
import { UserFormData } from "./userForm";
import { useUserManageApiHook } from "./useUserManageApiHook";

export const initUserData: UserFormData = {
  name: "",
  email: "",
  phoneNo: "",
  role: ROLES[0],
};

export const useManageUserDataHook = (initial: UserFormData = initUserData) => {
  const [data, setData] = useState<UserFormData>(initial);
  const [open, setOpen] = useState(false);

  const [errors, setErrors] = useState<
    Partial<Record<keyof UserFormData, string[]>>
  >({});
  const manageUserApi = useUserManageApiHook({
    onSuccess: () => {
      setOpen(false);
    },
  });
  const { createUserMutation, updateUserMutation } = manageUserApi;

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
      const fieldSchema = userFormSchema.shape[key];
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
  const validateAndCreateUserData = useCallback((): boolean => {
    try {
      userFormSchema.parse(data);
      setErrors({});
      const payload = appSchema.crm.user.createCRMUserSchema.parse(data);
      createUserMutation.mutate(payload);
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
  }, [data, createUserMutation]);

  /** ✅ Validate entire form (returns true if valid) */
  const validateAndUpdateUserData = useCallback(
    (id: number): boolean => {
      try {
        userFormSchema.parse(data);
        setErrors({});
        const payload = appSchema.crm.user.updateUserSchema.parse(data);
        updateUserMutation.mutate({ id, data: payload });
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
    },
    [data, updateUserMutation]
  );

  /** ✅ Reset form data and clear errors */
  const resetUserData = useCallback(() => {
    setData(initial ?? initUserData);
    setErrors({});
  }, [initial]);

  return {
    state: data,
    errors,
    popup: {
      setOpen,
      open,
    },
    createUserMutation,
    updateUserMutation,
    setUserData,
    resetUserData,
    validateField,
    validateAndCreateUserData,
    validateAndUpdateUserData,
  };
};
