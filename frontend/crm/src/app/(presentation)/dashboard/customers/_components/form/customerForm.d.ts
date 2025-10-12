import z from "zod";
import { customerFormDataSchema } from "./customerFormData.schema";

export type CustomerFormData = z.infer<typeof customerFormDataSchema>;

export interface ICustomerDataFormHook {
    state: CustomerFormData;
    errors: Partial<Record<keyof CustomerFormData, string[]>>;

    /** Update a specific field */
    setCustomerData: <K extends keyof CustomerFormData>(
        key: K,
        value: CustomerFormData[K]
    ) => void;

    /** Reset all form fields and errors */
    resetCustomerData: () => void;

    /** Validate a single field and update errors */
    validateField: <K extends keyof CustomerFormData>(
        key: K,
        value: CustomerFormData[K]
    ) => void;

    /** Validate entire form, returns true if valid */
    validateCustomerData: () => boolean;
}