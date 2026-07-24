/**
 * Pure (no DB / no SOAP) builder that turns a corporate KYC row + the
 * customer's signup profile into the exact CBRICS `unregisteredParticipant`
 * (REGISTER) and `updateUnregisteredParticipant` (MODIFY) payloads that
 * `ParticipantManager.registerCorporateParticipantFromCorporateKyc` and
 * any future corporate-modify flow would send to NSE.
 *
 * This helper exists so the live register/update code paths and the CRM
 * "CBRICS payload" preview tab share a single field-mapping definition.
 * If you change CBRICS field mapping (e.g. how state codes are resolved,
 * or how addresses are split), change it here.
 *
 * NOTE: a near-identical copy of the mapping currently lives inside
 * `cbrics_manager.service.ts` (`registerCorporateParticipantFromCorporateKyc`).
 * Until that service is refactored to call this builder, keep both in sync.
 */

import { getStateCode } from "@modules/RFQ/nse/values";
import type { UnregisteredParticipantRequest } from "@modules/RFQ/nse/cbrics.types";
import {
  removeLastCommaChunks,
  splitAddressInto3BalancedLines,
} from "@root/kyc-providers";
import { removeCountryCode } from "@utils/filters/convert";

/**
 * Numeric KRA state codes (API Download file format May 2025) → state
 * names accepted by `getStateCode()`. Some legacy corporate KYC rows
 * store state as a 3-digit KRA code; we need to normalise before
 * resolving the 2-letter CBRICS state code.
 *
 * Duplicated from `cbrics_manager.service.ts` — keep in sync.
 */
const KRA_STATE_CODE_TO_NAME: Record<string, string> = {
  "001": "Jammu and Kashmir",
  "002": "Himachal Pradesh",
  "003": "Punjab",
  "004": "Chandigarh",
  "005": "Uttarakhand",
  "006": "Haryana",
  "007": "Delhi",
  "008": "Rajasthan",
  "009": "Uttar Pradesh",
  "010": "Bihar",
  "011": "Sikkim",
  "012": "Arunachal Pradesh",
  "013": "Assam",
  "014": "Manipur",
  "015": "Mizoram",
  "016": "Tripura",
  "017": "Meghalaya",
  "018": "Nagaland",
  "019": "West Bengal",
  "020": "Jharkhand",
  "021": "Odisha",
  "022": "Chhattisgarh",
  "023": "Madhya Pradesh",
  "024": "Gujarat",
  "025": "Daman & Diu",
  "026": "Dadra and Nagar Haveli",
  "027": "Maharashtra",
  "028": "Andhra Pradesh",
  "029": "Karnataka",
  "030": "Goa",
  "031": "Lakshadweep",
  "032": "Kerala",
  "033": "Tamil Nadu",
  "034": "Puducherry",
  "035": "Andaman & Nicobar Islands",
  "036": "Ladakh",
  "037": "Telangana",
  "099": "IMPORT (Not Registered in India)",
};

function kraStateCodeToName(code: string | null | undefined): string {
  const raw = code == null ? "" : String(code).trim();
  if (!raw) return raw;
  if (/^\d+$/.test(raw)) {
    const key = String(parseInt(raw, 10)).padStart(3, "0");
    return KRA_STATE_CODE_TO_NAME[key] ?? raw;
  }
  return raw;
}

// ─── Inputs ────────────────────────────────────────────────────────────────

export interface CorporateCbricsInputCustomer {
  userName: string | null;
  emailAddress: string | null;
  phoneNo: string | null;
}

export interface CorporateCbricsInputBank {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  isPrimaryAccount: boolean | null;
}

export interface CorporateCbricsInputDemat {
  clientId: string;
  /** Prisma `DepositoryName` enum — narrowed to NSDL / CDSL on the model. */
  depository: "NSDL" | "CDSL" | string;
  dpId: string | null;
  isPrimary: boolean | null;
}

export interface CorporateCbricsInputSignatory {
  fullName: string | null;
  email: string | null;
  mobile: string | null;
}

export interface CorporateCbricsInputKyc {
  entityName: string | null;
  panNumber: string | null;
  dateOfIncorporation: Date | null;
  registeredFullAddress: string | null;
  correspondenceFullAddress: string | null;
  registeredLine1: string | null;
  registeredLine2: string | null;
  registeredLine3: string | null;
  registeredCity: string | null;
  registeredDistrict: string | null;
  registeredState: string | null;
  registeredPinCode: string | null;
  correspondenceState: string | null;
  authorisedSignatories: CorporateCbricsInputSignatory[];
  bankAccounts: CorporateCbricsInputBank[];
  dematAccounts: CorporateCbricsInputDemat[];
}

export interface BuildCorporateCbricsPayloadInput {
  corporateKyc: CorporateCbricsInputKyc;
  customer: CorporateCbricsInputCustomer;
  /**
   * Existing NSE CBRICS participant id, if the customer has been registered
   * before. Used as the `id` for the MODIFY payload. `null` for first-time
   * customers — preview still renders the modify payload so operators see
   * the shape that *would* be sent post-registration.
   */
  existingParticipantId: number | null;
}

// ─── Outputs ───────────────────────────────────────────────────────────────

export interface CorporateCbricsValidationIssue {
  field: string;
  severity: "ERROR" | "WARN";
  message: string;
}

/**
 * The MODIFY shape mirrors `NseCBRICS.updateUnregisteredParticipant` —
 * same payload as REGISTER minus `loginId`, with `id` (NSE participant id)
 * and `actualStatus: 4` injected by the SDK. We pre-bake `actualStatus`
 * in the preview so the JSON the operator sees is the literal POST body.
 */
export type CorporateCbricsModifyPayload = Omit<
  UnregisteredParticipantRequest,
  "loginId"
> & {
  /** `null` when the corporate hasn't been registered on CBRICS yet. */
  id: number | null;
  actualStatus: 4;
};

export interface CorporateCbricsPreview {
  register: UnregisteredParticipantRequest;
  modify: CorporateCbricsModifyPayload;
  validation: {
    errors: CorporateCbricsValidationIssue[];
    warnings: CorporateCbricsValidationIssue[];
  };
  participantId: number | null;
  /** REST paths that the SDK posts to — surfaced so the preview UI can label each block. */
  endpoint: {
    register: string;
    modify: string;
  };
}

// ─── Builder ───────────────────────────────────────────────────────────────

export function buildCorporateCbricsPayload(
  input: BuildCorporateCbricsPayloadInput,
): CorporateCbricsPreview {
  const errors: CorporateCbricsValidationIssue[] = [];
  const warnings: CorporateCbricsValidationIssue[] = [];

  const { corporateKyc, customer, existingParticipantId } = input;
  const signatory = corporateKyc.authorisedSignatories?.[0];

  // ── Identity / contact ─────────────────────────────────────────────
  const contactPerson =
    signatory?.fullName?.trim() ||
    corporateKyc.entityName?.trim() ||
    "CORPORATE";

  // CBRICS contact channel mirrors KRA's APP_EMAIL / APP_MOB_NO — i.e.
  // the customer's signup profile, with the signatory as a fallback only
  // when the profile is somehow blank.
  const email = (customer.emailAddress ?? signatory?.email ?? "").trim();
  const mobile = (customer.phoneNo ?? signatory?.mobile ?? "").trim();
  const loginId = (customer.userName ?? "").trim();

  if (!loginId) {
    errors.push({
      field: "loginId",
      severity: "ERROR",
      message: "Customer userName is required as the CBRICS loginId.",
    });
  }
  if (!email) {
    errors.push({
      field: "emailList",
      severity: "ERROR",
      message: "Customer email is required for CBRICS registration.",
    });
  }
  if (!mobile) {
    errors.push({
      field: "mobileList",
      severity: "ERROR",
      message: "Customer mobile is required for CBRICS registration.",
    });
  }

  // ── Entity ─────────────────────────────────────────────────────────
  const entityName = corporateKyc.entityName?.trim() ?? "";
  if (!entityName) {
    errors.push({
      field: "firstName",
      severity: "ERROR",
      message: "Entity name is required.",
    });
  }

  const panNo = corporateKyc.panNumber?.trim() ?? "";
  if (!panNo) {
    errors.push({
      field: "panNo",
      severity: "ERROR",
      message: "PAN is required.",
    });
  }

  // ── Address ────────────────────────────────────────────────────────
  const fullAddress =
    corporateKyc.registeredFullAddress?.trim() ||
    corporateKyc.correspondenceFullAddress?.trim() ||
    [
      corporateKyc.registeredLine1,
      corporateKyc.registeredLine2,
      corporateKyc.registeredLine3,
      corporateKyc.registeredCity,
      corporateKyc.registeredDistrict,
      corporateKyc.registeredState,
      corporateKyc.registeredPinCode,
    ]
      .filter(Boolean)
      .join(", ");

  if (!fullAddress.trim()) {
    errors.push({
      field: "regAddress",
      severity: "ERROR",
      message:
        "Registered address is empty — at least one of registeredFullAddress / correspondenceFullAddress / registered* lines is required.",
    });
  }

  const address = splitAddressInto3BalancedLines(
    removeLastCommaChunks(fullAddress, 3),
  );

  // ── State code ─────────────────────────────────────────────────────
  const stateRaw =
    corporateKyc.registeredState?.trim() ||
    corporateKyc.correspondenceState?.trim() ||
    "";
  const stateNameForCb = kraStateCodeToName(stateRaw);
  const importFallback = getStateCode("IMPORT (Not Registered in India)");
  const resolvedStateCode = getStateCode(stateNameForCb);
  const stateCode = resolvedStateCode ?? importFallback ?? "";

  if (!stateCode) {
    errors.push({
      field: "stateCode",
      severity: "ERROR",
      message: "State code could not be resolved (no fallback available).",
    });
  } else if (!resolvedStateCode) {
    warnings.push({
      field: "stateCode",
      severity: "WARN",
      message: `State '${stateRaw || "(empty)"}' could not be resolved — falling back to 'IMPORT (Not Registered in India)' (${stateCode}).`,
    });
  }

  // ── Date of incorporation (CBRICS expects DD-MM-YYYY) ──────────────
  const dobDoi = corporateKyc.dateOfIncorporation
    ? corporateKyc.dateOfIncorporation
        .toISOString()
        .slice(0, 10)
        .split("-")
        .reverse()
        .join("-")
    : "";

  if (!dobDoi) {
    warnings.push({
      field: "dobDoi",
      severity: "WARN",
      message:
        "Date of incorporation is missing — dobDoi will be sent as an empty string.",
    });
  }

  // ── Bank / DP accounts ─────────────────────────────────────────────
  const bankAccounts = corporateKyc.bankAccounts ?? [];
  const dematAccounts = corporateKyc.dematAccounts ?? [];

  if (bankAccounts.length === 0) {
    errors.push({
      field: "bankAccountList",
      severity: "ERROR",
      message:
        "No bank accounts on this corporate KYC — CBRICS registration requires at least one bank account.",
    });
  }
  if (dematAccounts.length === 0) {
    errors.push({
      field: "dpAccountList",
      severity: "ERROR",
      message:
        "No demat accounts on this corporate KYC — CBRICS registration requires at least one demat account.",
    });
  }

  const bankAccountList = bankAccounts.map((e) => ({
    bankAccountNo: e.accountNumber,
    bankIFSC: e.ifscCode,
    bankName: e.bankName,
    isDefault: (e.isPrimaryAccount ? "Y" : "N") as "Y" | "N",
    status: "A" as const,
  }));

  const dpAccountList = dematAccounts.map((e) => {
    const dpType = (e.depository as "NSDL" | "CDSL");
    return {
      benId: e.clientId,
      dpType,
      // CBRICS requires `dpId` only for NSDL. CDSL participants encode
      // the DP in the 16-char client id so `dpId` must be omitted.
      dpId: dpType === "NSDL" ? (e.dpId ?? undefined) : undefined,
      isDefault: (e.isPrimary ? "Y" : "N") as "Y" | "N",
      status: "A" as const,
    };
  });

  // ── Build REGISTER ─────────────────────────────────────────────────
  const register: UnregisteredParticipantRequest = {
    address: address?.line1 || "",
    address2: address?.line2 || undefined,
    address3: address?.line3 || undefined,
    contactPerson,
    firstName: entityName,
    loginId,
    mobileList: mobile ? [removeCountryCode(mobile)] : [],
    panNo,
    emailList: email ? [email] : [],
    stateCode,
    regAddress: fullAddress,
    dobDoi,
    telephone: mobile ? removeCountryCode(mobile) : "",
    expiryDate: null,
    leiCode: null,
    custodian: null,
    bankAccountList,
    dpAccountList,
  };

  // ── Build MODIFY (same payload sans loginId + id + actualStatus) ──
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { loginId: _omitLogin, ...registerWithoutLogin } = register;
  const modify: CorporateCbricsModifyPayload = {
    ...registerWithoutLogin,
    id: existingParticipantId,
    actualStatus: 4,
  };

  if (existingParticipantId == null) {
    warnings.push({
      field: "modify.id",
      severity: "WARN",
      message:
        "Customer is not yet registered on CBRICS — `id` will be filled in by the SDK after the first registration.",
    });
  }

  return {
    register,
    modify,
    validation: { errors, warnings },
    participantId: existingParticipantId,
    endpoint: {
      register: "/rest/v1/unreg",
      modify: "/rest/v1/unreg/update",
    },
  };
}
