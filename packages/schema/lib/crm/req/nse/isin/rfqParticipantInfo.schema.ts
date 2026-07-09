// rfqParticipantInfo.schema.ts
//
// Zod schemas for the CRM-private NSE-RFQ participant enrichment table.
// NSE's `/participants/all` only returns `{ code, name }`; operators can
// attach contact, KYC, bank and demat details against each `code` here
// for internal lookup (settlement notes, etc.). Never pushed to NSE.

import { z } from "zod";

const NSE_DEPOSITORY_NAMES = ["NSDL", "CDSL"] as const;

const NON_EMPTY_TRIMMED = z
  .string()
  .trim()
  .min(1, "Required");

const OPTIONAL_NULLABLE_STRING = z
  .string()
  .trim()
  .transform((v) => (v.length === 0 ? null : v))
  .nullable()
  .optional();

const TRIMMED_STRING_LIST = z
  .array(z.string().trim().min(1))
  .max(20, "At most 20 entries");

/** Bank account row inside an upsert payload. */
export const NseRfqParticipantBankAccountInputZ = z.object({
  bankName: NON_EMPTY_TRIMMED.max(120),
  bankIFSC: NON_EMPTY_TRIMMED.max(20).transform((v) => v.toUpperCase()),
  bankAccountNo: NON_EMPTY_TRIMMED.max(40),
  isDefault: z.boolean().default(false),
});

export type NseRfqParticipantBankAccountInput = z.infer<
  typeof NseRfqParticipantBankAccountInputZ
>;

/** Demat (DP) account row inside an upsert payload. */
export const NseRfqParticipantDpAccountInputZ = z.object({
  dpType: z.enum(NSE_DEPOSITORY_NAMES),
  /// CDSL accounts use `benId` only and leave `dpId` empty.
  dpId: OPTIONAL_NULLABLE_STRING,
  benId: NON_EMPTY_TRIMMED.max(40),
  isDefault: z.boolean().default(false),
});

export type NseRfqParticipantDpAccountInput = z.infer<
  typeof NseRfqParticipantDpAccountInputZ
>;

/** Body of `PUT /crm/rfq/nse/rfq/participants/:code/info`. */
export const NseRfqParticipantInfoUpsertBodyZ = z.object({
  nameOverride: OPTIONAL_NULLABLE_STRING,

  contactPerson: OPTIONAL_NULLABLE_STRING,
  emailList: TRIMMED_STRING_LIST.default([]),
  mobileList: TRIMMED_STRING_LIST.default([]),
  telephone: OPTIONAL_NULLABLE_STRING,
  address: OPTIONAL_NULLABLE_STRING,
  address2: OPTIONAL_NULLABLE_STRING,
  address3: OPTIONAL_NULLABLE_STRING,
  stateCode: OPTIONAL_NULLABLE_STRING,

  panNo: OPTIONAL_NULLABLE_STRING,
  leiCode: OPTIONAL_NULLABLE_STRING,
  custodian: OPTIONAL_NULLABLE_STRING,
  dobDoi: OPTIONAL_NULLABLE_STRING,

  notes: OPTIONAL_NULLABLE_STRING,

  bankAccounts: z.array(NseRfqParticipantBankAccountInputZ).max(20),
  dematAccounts: z.array(NseRfqParticipantDpAccountInputZ).max(20),
});

export type NseRfqParticipantInfoUpsertBody = z.infer<
  typeof NseRfqParticipantInfoUpsertBodyZ
>;

/** Path param: `/participants/:code/info`. */
export const NseRfqParticipantCodeParamZ = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Participant code is required")
    .max(64, "Participant code is too long"),
});

export type NseRfqParticipantCodeParam = z.infer<
  typeof NseRfqParticipantCodeParamZ
>;
