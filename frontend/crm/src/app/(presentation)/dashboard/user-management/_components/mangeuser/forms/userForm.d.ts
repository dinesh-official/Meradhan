import z from "zod";
import { userFormSchema } from "./manageUser.schema"; // adjust path as needed

export type UserFormData = z.infer<typeof userFormSchema>;

export interface IUserDataFormHook {
  state: UserFormData;
  errors: Partial<Record<keyof UserFormData, string[]>>;

  /** Update a specific field */
  setUserData: <K extends keyof UserFormData>(
    key: K,
    value: UserFormData[K]
  ) => void;

  /** Reset all form fields and errors */
  resetUserData: () => void;

  /** Validate a single field and update errors */
  validateField: <K extends keyof UserFormData>(
    key: K,
    value: UserFormData[K]
  ) => void;

  /** Validate entire form, returns true if valid */
  validateAndCreateUserData: () => boolean;

  createUserMutation: UseMutationResult;
}
