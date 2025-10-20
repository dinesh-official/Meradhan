import { z } from "zod";
import { basicDetailsSchema } from "./basicDetails.schema";

export type BasicDetailsFormData = z.infer<typeof basicDetailsSchema>;

export interface IBasicDetailsFormHook {
  state: BasicDetailsFormData;
  errors: Partial<Record<keyof BasicDetailsFormData, string[]>>;
  setBasicData: <K extends keyof BasicDetailsFormData>(
    key: K,
    value: BasicDetailsFormData[K]
  ) => void;

  resetBasicData: () => void;

  validateField: <K extends keyof BasicDetailsFormData>(
    key: K,
    value: BasicDetailsFormData[K]
  ) => void;

  validateBasicData: () => boolean;
}
