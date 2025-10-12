import { z } from "zod";
import { AdditionalOptionsSchema } from "./addtionalFormaData.schema";

export type AdditionalOptionsFormData = z.infer<typeof AdditionalOptionsSchema>;

export interface ITradingOptionsFormHook {
  state: AdditionalOptionsFormData;
  errors: Partial<Record<keyof AdditionalOptionsFormData, string[]>>;

  setAdditionalOptionsData: <K extends keyof AdditionalOptionsFormData>(
    key: K,
    value: AdditionalOptionsFormData[K]
  ) => void;

  resetAdditionalOptionsData: () => void;

  validateField: <K extends keyof AdditionalOptionsFormData>(
    key: K,
    value: AdditionalOptionsFormData[K]
  ) => void;

  validateAdditionalOptionsData: () => boolean;
}
