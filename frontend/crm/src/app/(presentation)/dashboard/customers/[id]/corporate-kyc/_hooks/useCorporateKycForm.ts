"use client";

import { createCorporateKycSchema } from "@root/schema";
import type {
  CreateCorporateKycPayload,
  CorporateKycBankAccountPayload,
  CorporateKycDematAccountPayload,
  CorporateKycDirectorPayload,
  CorporateKycPromoterPayload,
  CorporateKycAuthorisedSignatoryPayload,
} from "@root/schema";
import { useCallback, useState } from "react";
import type { z } from "zod";

export type CorporateKycFormErrors = Partial<
  Record<keyof CreateCorporateKycPayload, string[]> & {
    bankAccounts?: string[][];
    dematAccounts?: string[][];
    directors?: string[][];
    promoters?: string[][];
    authorisedSignatories?: string[][];
  }
>;

const defaultBankAccount = (): CorporateKycBankAccountPayload => ({
  accountHolderName: "",
  accountNumber: "",
  branch: "",
  bankName: "",
  ifscCode: "",
  bankProofFileUrls: [],
  isPrimaryAccount: false,
});

const defaultDematAccount = (): CorporateKycDematAccountPayload => ({
  depository: "NSDL",
  accountType: "",
  dpId: "",
  clientId: "",
  accountHolderName: "",
  dematProofFileUrl: "",
  isPrimary: false,
});

const defaultDirector = (): CorporateKycDirectorPayload => ({
  fullName: "",
  pan: "",
  designation: "",
  din: "",
  email: "",
  mobile: "",
});

const defaultAuthorisedSignatory = (): CorporateKycAuthorisedSignatoryPayload => ({
  fullName: "",
  pan: "",
  designation: "",
  din: "",
  email: "",
  mobile: "",
});

export function useCorporateKycForm(initial: CreateCorporateKycPayload) {
  const [form, setForm] = useState<CreateCorporateKycPayload>(initial);
  const [errors, setErrors] = useState<CorporateKycFormErrors>({});

  const setField = useCallback(
    <K extends keyof CreateCorporateKycPayload>(
      key: K,
      value: CreateCorporateKycPayload[K]
    ) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    },
    [errors]
  );

  const setBankAccount = useCallback(
    (index: number, data: Partial<CorporateKycBankAccountPayload>) => {
      setForm((prev: CreateCorporateKycPayload) => {
        const list = [...(prev.bankAccounts ?? [])];
        list[index] = { ...defaultBankAccount(), ...list[index], ...data };
        return { ...prev, bankAccounts: list };
      });
    },
    []
  );

  const addBankAccount = useCallback(() => {
    setForm((prev: CreateCorporateKycPayload) => ({
      ...prev,
      bankAccounts: [...(prev.bankAccounts ?? []), defaultBankAccount()],
    }));
  }, []);

  const removeBankAccount = useCallback((index: number) => {
    setForm((prev: CreateCorporateKycPayload) => ({
      ...prev,
      bankAccounts: (prev.bankAccounts ?? []).filter(
        (_: CorporateKycBankAccountPayload, i: number) => i !== index
      ),
    }));
  }, []);

  const setDematAccount = useCallback(
    (index: number, data: Partial<CorporateKycDematAccountPayload>) => {
      setForm((prev: CreateCorporateKycPayload) => {
        const list = [...(prev.dematAccounts ?? [])];
        list[index] = { ...defaultDematAccount(), ...list[index], ...data };
        return { ...prev, dematAccounts: list };
      });
    },
    []
  );

  const addDematAccount = useCallback(() => {
    setForm((prev: CreateCorporateKycPayload) => ({
      ...prev,
      dematAccounts: [...(prev.dematAccounts ?? []), defaultDematAccount()],
    }));
  }, []);

  const removeDematAccount = useCallback((index: number) => {
    setForm((prev: CreateCorporateKycPayload) => ({
      ...prev,
      dematAccounts: (prev.dematAccounts ?? []).filter(
        (_: CorporateKycDematAccountPayload, i: number) => i !== index
      ),
    }));
  }, []);

  const setDirector = useCallback(
    (index: number, data: Partial<CorporateKycDirectorPayload>) => {
      setForm((prev: CreateCorporateKycPayload) => {
        const list = [...(prev.directors ?? [])];
        list[index] = { ...defaultDirector(), ...list[index], ...data };
        return { ...prev, directors: list };
      });
    },
    []
  );

  const addDirector = useCallback(() => {
    setForm((prev: CreateCorporateKycPayload) => ({
      ...prev,
      directors: [...(prev.directors ?? []), defaultDirector()],
    }));
  }, []);

  const removeDirector = useCallback((index: number) => {
    setForm((prev: CreateCorporateKycPayload) => ({
      ...prev,
      directors: (prev.directors ?? []).filter(
        (_: CorporateKycDirectorPayload, i: number) => i !== index
      ),
    }));
  }, []);

  const setPromoter = useCallback(
    (index: number, data: Partial<CorporateKycPromoterPayload>) => {
      setForm((prev: CreateCorporateKycPayload) => {
        const list = [...(prev.promoters ?? [])];
        list[index] = { ...defaultDirector(), ...list[index], ...data };
        return { ...prev, promoters: list };
      });
    },
    []
  );

  const addPromoter = useCallback(() => {
    setForm((prev: CreateCorporateKycPayload) => ({
      ...prev,
      promoters: [...(prev.promoters ?? []), defaultDirector()],
    }));
  }, []);

  const removePromoter = useCallback((index: number) => {
    setForm((prev: CreateCorporateKycPayload) => ({
      ...prev,
      promoters: (prev.promoters ?? []).filter(
        (_: CorporateKycDirectorPayload, i: number) => i !== index
      ),
    }));
  }, []);

  const setAuthorisedSignatory = useCallback(
    (
      index: number,
      data: Partial<CorporateKycAuthorisedSignatoryPayload>
    ) => {
      setForm((prev: CreateCorporateKycPayload) => {
        const list = [...(prev.authorisedSignatories ?? [])];
        list[index] = {
          ...defaultAuthorisedSignatory(),
          ...list[index],
          ...data,
        };
        return { ...prev, authorisedSignatories: list };
      });
    },
    []
  );

  const addAuthorisedSignatory = useCallback(() => {
    setForm((prev: CreateCorporateKycPayload) => ({
      ...prev,
      authorisedSignatories: [
        ...(prev.authorisedSignatories ?? []),
        defaultAuthorisedSignatory(),
      ],
    }));
  }, []);

  const removeAuthorisedSignatory = useCallback((index: number) => {
    setForm((prev: CreateCorporateKycPayload) => ({
      ...prev,
      authorisedSignatories: (prev.authorisedSignatories ?? []).filter(
        (_: CorporateKycAuthorisedSignatoryPayload, i: number) => i !== index
      ),
    }));
  }, []);

  const validate = useCallback((): boolean => {
    const result = createCorporateKycSchema.safeParse(form);
    if (result.success) {
      setErrors({});
      return true;
    }
    const zodErrors = result.error.flatten();
    const fieldErrors = zodErrors.fieldErrors as Record<
      keyof CreateCorporateKycPayload,
      string[] | undefined
    >;
    setErrors(fieldErrors as CorporateKycFormErrors);
    return false;
  }, [form]);

  const reset = useCallback((payload: CreateCorporateKycPayload) => {
    setForm(payload);
    setErrors({});
  }, []);

  return {
    form,
    errors,
    setField,
    setBankAccount,
    addBankAccount,
    removeBankAccount,
    setDematAccount,
    addDematAccount,
    removeDematAccount,
    setDirector,
    addDirector,
    removeDirector,
    setPromoter,
    addPromoter,
    removePromoter,
    setAuthorisedSignatory,
    addAuthorisedSignatory,
    removeAuthorisedSignatory,
    validate,
    reset,
    getPayload: (): CreateCorporateKycPayload => form,
  };
}

export type CorporateKycFormHook = ReturnType<typeof useCorporateKycForm>;
