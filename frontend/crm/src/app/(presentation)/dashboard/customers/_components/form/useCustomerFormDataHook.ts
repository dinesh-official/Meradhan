import { useState, useCallback } from "react";
import { ZodError } from "zod";
import { CustomerFormData, ICustomerDataFormHook } from "./customerForm";
import { customerFormDataSchema } from "./customerFormData.schema";
import { useCustomerApiHook } from "./useCustomerApiHook";
import { appSchema } from "@root/schema";
import { parseError } from "@/core/error/parseError";
import { toast } from "sonner";
import { gender } from "../../../../../../../../../packages/schema/lib/enums";

const initData: CustomerFormData = {
  firstName: "",
  middleName: "",
  lastName: "",
  emailId: "",
  phoneNo: "",
  whatsAppNo: "",
  userType: "",
  termsAccepted: false,
  whatsAppNotificationAllow: false,
  isEmailVerified: false,
  isPhoneVerified: false,
  kycStatus: "PENDING",
  status: "ACTIVE",
  gender:gender[0],
  relationshipManagerId: undefined,
  password: "",
};

export const useCustomerFromDataHook = (
  state: CustomerFormData = initData
): ICustomerDataFormHook => {
  const [data, setData] = useState(state);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CustomerFormData, string[]>>
  >({});
  const customerApi = useCustomerApiHook();
  const { createCustomerMutation } = customerApi;
  /** Update any field and clear its error */
  const setCustomerData = useCallback(
    <K extends keyof CustomerFormData>(key: K, value: CustomerFormData[K]) => {
      setData((prevData) => ({ ...prevData, [key]: value }));
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    },
    []
  );

  /** Validate a single field */
  const validateField = useCallback(
    <K extends keyof CustomerFormData>(key: K, value: CustomerFormData[K]) => {
      const fieldSchema = customerFormDataSchema.pick({ [key]: true });
      try {
        fieldSchema.parse({ [key]: value });
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
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

  /** Validate entire form */
  const validateCustomerData = useCallback((): boolean => {
    try {
      console.log('validateCustomerData',data)
      customerFormDataSchema.parse(data);
      setErrors({});
      const payload = appSchema.customer.createNewCustomerSchema.parse(data);
      createCustomerMutation.mutate(payload)
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
  }, [data,createCustomerMutation]);

  /** Reset form */
  const resetCustomerData = useCallback(() => {
    setData(initData);
    setErrors({});
  }, []);

  return {
    state: data,
    errors,
    createCustomerMutation,
    setCustomerData,
    resetCustomerData,
    validateField,
    validateCustomerData,
  };
};
