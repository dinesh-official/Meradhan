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

export type NestedFieldErrors = Array<Record<string, string[]>>;

/** Keys that hold nested array-of-records errors (not string[]) */
const NESTED_ERROR_KEYS = [
  "bankAccounts",
  "dematAccounts",
  "directors",
  "promoters",
  "authorisedSignatories",
] as const;

export type CorporateKycFormErrors = Partial<
  Record<Exclude<keyof CreateCorporateKycPayload, (typeof NESTED_ERROR_KEYS)[number]>, string[]>
> & {
  bankAccounts?: NestedFieldErrors;
  dematAccounts?: NestedFieldErrors;
  directors?: NestedFieldErrors;
  promoters?: NestedFieldErrors;
  authorisedSignatories?: NestedFieldErrors;
};

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
      setErrors((e) => {
        const arr = [...(e.bankAccounts ?? [])];
        if (arr[index]) arr[index] = {} as Record<string, string[]>;
        return { ...e, bankAccounts: arr.length ? arr : undefined };
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
      setErrors((e) => {
        const arr = [...(e.dematAccounts ?? [])];
        if (arr[index]) arr[index] = {} as Record<string, string[]>;
        return { ...e, dematAccounts: arr.length ? arr : undefined };
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
      setErrors((e) => {
        const arr = [...(e.directors ?? [])];
        if (arr[index]) arr[index] = {} as Record<string, string[]>;
        return { ...e, directors: arr.length ? arr : undefined };
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
      setErrors((e) => {
        const arr = [...(e.promoters ?? [])];
        if (arr[index]) arr[index] = {} as Record<string, string[]>;
        return { ...e, promoters: arr.length ? arr : undefined };
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
      setErrors((e) => {
        const arr = [...(e.authorisedSignatories ?? [])];
        if (arr[index]) arr[index] = {} as Record<string, string[]>;
        return { ...e, authorisedSignatories: arr.length ? arr : undefined };
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
    const flat = result.error.flatten();
    const fieldErrors = flat.fieldErrors as Record<
      string,
      string[] | Array<Record<string, string[]>>
    >;
    const next: CorporateKycFormErrors = {};
    type FlatErrorKey = Exclude<keyof CreateCorporateKycPayload, (typeof NESTED_ERROR_KEYS)[number]>;
    for (const key of Object.keys(fieldErrors) as (keyof CreateCorporateKycPayload)[]) {
      const val = fieldErrors[key];
      if (NESTED_ERROR_KEYS.includes(key as (typeof NESTED_ERROR_KEYS)[number])) {
        const arr = val as Array<Record<string, string[]>> | undefined;
        if (Array.isArray(arr)) next[key as (typeof NESTED_ERROR_KEYS)[number]] = arr;
      } else if (Array.isArray(val)) {
        // Flat field errors from Zod are string[]; nested keys handled above
        (next as Record<FlatErrorKey, string[] | undefined>)[key as FlatErrorKey] = val as string[];
      }
    }
    setErrors(next);
    return false;
  }, [form]);

  const reset = useCallback((payload: CreateCorporateKycPayload) => {
    setForm(payload);
    setErrors({});
  }, []);

  const getAllErrorMessages = useCallback((): string[] => {
    const list: string[] = [];
    const add = (msg: string) => msg && list.push(msg);
    const addMessages = (msgs: string[] | string | undefined) => {
      if (msgs == null) return;
      if (Array.isArray(msgs)) msgs.forEach(add);
      else if (typeof msgs === "string") add(msgs);
    };
    Object.entries(errors).forEach(([key, val]) => {
      if (NESTED_ERROR_KEYS.includes(key as (typeof NESTED_ERROR_KEYS)[number])) {
        const arr = val as NestedFieldErrors | undefined;
        arr?.forEach((row) => {
          Object.values(row || {}).forEach(addMessages);
        });
      } else {
        addMessages(val as string[] | string | undefined);
      }
    });
    return list;
  }, [errors]);

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
    getAllErrorMessages,
    getPayload: (): CreateCorporateKycPayload => form,
  };
}

export type CorporateKycFormHook = ReturnType<typeof useCorporateKycForm>;
