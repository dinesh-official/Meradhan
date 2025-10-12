import { NseRFQFormData } from "./nseRfqFormData.schema";


export interface INseRFQFormHook {
  state: NseRFQFormData;
  errors: Partial<Record<keyof NseRFQFormData, string[]>>;

  setRFQData: <K extends keyof NseRFQFormData>(
    key: K,
    value: NseRFQFormData[K]
  ) => void;

  resetRFQData: () => void;

  validateField: <K extends keyof NseRFQFormData>(
    key: K,
    value: NseRFQFormData[K]
  ) => void;

  validateRFQData: () => boolean;
}
