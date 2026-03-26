import { z } from "zod";
import { addressInformationSchema } from "./addressForm.schema";

export type AddressInformationFormData = z.infer<
  typeof addressInformationSchema
>;

export interface IAddressInformationFormHook {
  state: AddressInformationFormData;

  errors: Partial<Record<keyof AddressInformationFormData, string[]>>;

  setAddressData: <K extends keyof AddressInformationFormData>(
    key: K,
    value: AddressInformationFormData[K]
  ) => void;

  resetAddressData: () => void;

  validateField: <K extends keyof AddressInformationFormData>(
    key: K,
    value: AddressInformationFormData[K]
  ) => void;

  validateAddressData: () => boolean;
}
