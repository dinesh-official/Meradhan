import { z } from "zod";
import { leiInformationSchema } from "./leiInformationForm.schema";

export type LEIInformationFormData = z.infer<typeof leiInformationSchema>;

export interface ILEIInformationFormHook {
  state: LEIInformationFormData;
  errors: Partial<Record<keyof LEIInformationFormData, string[]>>;
  setLEIData: <K extends keyof LEIInformationFormData>(
    key: K,
    value: LEIInformationFormData[K]
  ) => void;
  resetLEIData: () => void;

  validateField: <K extends keyof LEIInformationFormData>(
    key: K,
    value: LEIInformationFormData[K]
  ) => void;

  validateLEIData: () => boolean;
}
