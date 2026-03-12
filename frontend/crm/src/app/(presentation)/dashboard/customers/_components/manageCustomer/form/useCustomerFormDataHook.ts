import { parseError } from "@/core/error/parseError";
import { CrmUsersProfile } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";
import { gender } from "../../../../../../../../../../packages/schema/lib/enums";
import { CustomerFormData, ICustomerDataFormHook } from "./customerForm";
import { customerFormDataSchema } from "./customerFormData.schema";
import { useCustomerApiHook } from "./useCustomerApiHook";

const initData: CustomerFormData = {
  firstName: "",
  middleName: "",
  lastName: "",
  emailId: "",
  phoneNo: "",
  whatsAppNo: "",
  userType: "INDIVIDUAL",
  userName: "",
  legalEntityName: "",
  termsAccepted: false,
  whatsAppNotificationAllow: false,
  isEmailVerified: false,
  isPhoneVerified: false,
  kycStatus: "PENDING",
  status: "ACTIVE",
  gender: gender[0],
  relationshipManagerId: undefined,
  password: "",
};

export const useCustomerFromDataHook = (
  state: CustomerFormData = initData,
  backOnDone: boolean = true,
  onCustomerCreated?: () => void
): ICustomerDataFormHook => {
  const [relationManager, setRelationManager] = useState<
    CrmUsersProfile | undefined
  >(undefined);

  const [data, setData] = useState(state);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CustomerFormData, string[]>>
  >({});
  const customerApi = useCustomerApiHook({ backOnDone, onCustomerCreated });
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
      // Build a single-field schema without triggering the pick mask type issue
      const fieldSchema = customerFormDataSchema.shape[key];
      try {
        fieldSchema.parse(value);
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
      customerFormDataSchema.parse(data);
      setErrors({});
      const payload = appSchema.customer.createNewCustomerSchema.parse(data);

      createCustomerMutation.mutate({
        ...payload,
        relationshipManagerId: relationManager?.id,
      });
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
  }, [data, createCustomerMutation, relationManager]);

  /** Reset form */
  const resetCustomerData = useCallback(() => {
    setData(initData);
    setErrors({});
    setRelationManager(undefined);
  }, []);

  return {
    state: data,
    setData,
    errors,
    createCustomerMutation,
    setCustomerData,
    resetCustomerData,
    validateField,
    validateCustomerData,
    relationManager: {
      relationManager: relationManager,
      setRelationManager,
    },
  };
};
