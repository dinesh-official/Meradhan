// @ts-check
import z from "zod";
import { bankAccountSchema } from "./backAccount.schema";

export type BankAccountFormData = z.infer<typeof bankAccountSchema>;
export type BankAccountsFormData = BankAccountFormData[];



export interface IBankAccountFormHook {
  state: BankAccountsFormData;

  errors: Partial<Record<keyof BankAccountFormData, string[]>>[];

  addBankAccount: () => void;
  removeBankAccount: (id: string) => void;
  setBankAccountData: <K extends keyof BankAccountFormData>(
    id: string,
    key: K,
    value: BankAccountFormData[K]
  ) => void;
  setDefaultBankAccount: (id: string) => void;
  validateSingleBankAccount: (id: string) => boolean;
  validateAllBankAccounts: () => boolean;
  resetBankAccounts: () => void;
}
