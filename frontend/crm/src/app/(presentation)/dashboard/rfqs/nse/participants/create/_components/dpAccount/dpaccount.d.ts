import z from "zod";
import { dpAccountSchema, dpAccountsSchema } from "./dpAccount.schema";

export type DPAccountFormData = z.infer<typeof dpAccountSchema>;
export type DPAccountsFormData = z.infer<typeof dpAccountsSchema>;

export interface IDPAccountFormHook {
  state: DPAccountsFormData;
  errors: Record<string, Partial<Record<keyof DPAccountFormData, string[]>>>;

  addDPAccount: () => void;
  removeDPAccount: (id: string) => void;
  setDPAccountData: <K extends keyof DPAccountFormData>(
    id: string,
    key: K,
    value: DPAccountFormData[K]
  ) => void;
  setDefaultDPAccount: (id: string) => void;
  validateSingleDPAccount: (id: string) => boolean;
  validateAllDPAccounts: () => boolean;
  resetDPAccounts: () => void;
}
