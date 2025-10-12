import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import { useState } from "react";
import { ZodError } from "zod";
import { CustomerFormData, ICustomerDataFormHook } from "./customerForm";
import { customerFormDataSchema } from "./customerFormData.schema";

const initData: CustomerFormData = {
    firstName: "",
    middleName: "",
    lastName: "",
    emailId: "",
    mobileNo: "",
    whatsAppNumber: "",
    userType: "",
    userName: "",
    termsAccept: false,
    whatsAppNotificationAccept: false,
    emailConfirmed: false,
    mobileConfirm: false,
    kycStatus: "PENDING",
    status: "ACTIVE",
    relationshipManagerId: undefined,
    totalInvestment: 0,
    password: ""
};

export const useCustomerFromDataHook = (state: CustomerFormData = initData): ICustomerDataFormHook => {
    const [data, setData] = useState(state);
    const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string[]>>>({});

    // Function to update any field dynamically
    const setCustomerData = <K extends keyof CustomerFormData>(
        key: K,
        value: CustomerFormData[K]
    ) => {
        setData((prevData) => ({
            ...prevData,
            [key]: value,
        }));
        setErrors(prev => {
            if (!prev[key]) return prev;
            const newErrors = { ...prev };
            delete newErrors[key];
            return newErrors;
        });
    };

    const validateField = <K extends keyof CustomerFormData>(key: K, value: CustomerFormData[K]) => {
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
    };

    const validateCustomerData = (): boolean => {
        try {
            customerFormDataSchema.parse(data);
            setErrors({});
            return true;
        } catch (err) {
            if (err instanceof ZodError) {
                setErrors(zodErrorToErrorMap(err));
            }
            return false;
        }
    };

    const resetCustomerData = () => {
        setData(initData);
        setErrors({});
    }

    return {
        state: data,
        errors,
        setCustomerData,
        resetCustomerData,
        validateField,
        validateCustomerData,
    };

}