/**
 * NDML KRA code masters.
 *
 * Source: `packages/kyc-providers/src/kra/_docs/api/Sample Request and Response/
 *          status code/API Registration and Modification Individual  Non-Individual
 *          file format_1.6.xlsx`
 *
 * Centralising every code list NDML accepts/returns lets us:
 *   1. Map CRM payloads to the exact values NDML expects.
 *   2. Decode response codes (KYC status, rejection reasons, etc.) back to
 *      human-readable text on the CRM "KRA preview" page and in the logs.
 *
 * Whenever NDML updates the master, regenerate from the XLSX above.
 */

import { getKraStateCodeReferenceRows } from "@root/schema";

export interface CodeEntry {
  code: string;
  label: string;
  /** Optional aliases / older labels to make `findCode("Authorised Signatory")` work. */
  aliases?: string[];
}

function lookup(codes: CodeEntry[], value: string | null | undefined): CodeEntry | undefined {
  if (!value) return undefined;
  const needle = value.trim().toLowerCase();
  if (!needle) return undefined;
  return codes.find(
    (c) =>
      c.code.toLowerCase() === needle ||
      c.label.toLowerCase() === needle ||
      (c.aliases ?? []).some((a) => a.toLowerCase() === needle),
  );
}

// ─── 1. APP_IOP_FLG (KYC Update Type) ────────────────────────────────────────
//     Used at the SOAP-call level to indicate the type of action.
export const NDML_IOP_FLG: CodeEntry[] = [
  { code: "IE", label: "Intermediary Inquiry" },
  { code: "IS", label: "Intermediary Download/Fetch" },
  { code: "II", label: "Intermediary Modification" },
  { code: "RE", label: "Registrar Inquiry" },
  { code: "RS", label: "Registrar Download/Fetch" },
  { code: "RI", label: "Registrar Modification" },
];

// ─── 2. APP_ADDLDATA_UPDTFLG (Addl KYC Update Type) ──────────────────────────
export const NDML_ADDL_UPDT_FLG: CodeEntry[] = [
  { code: "01", label: "New" },
  { code: "02", label: "Modify with documents" },
  { code: "03", label: "Modify without documents" },
  { code: "04", label: "Delete" },
];

// ─── 3. APP_TYPE (Entity Type) ────────────────────────────────────────────────
export const NDML_ENTITY_TYPE: CodeEntry[] = [
  { code: "I", label: "Individual" },
  { code: "N", label: "Non-Individual" },
];

// ─── 4. APP_PAN_COPY / APP_IPV_FLAG (Yes/No) ──────────────────────────────────
export const NDML_YES_NO: CodeEntry[] = [
  { code: "Y", label: "Yes" },
  { code: "N", label: "No" },
];

// ─── 5. APP_EXMT_CAT (Exempt Category) ───────────────────────────────────────
export const NDML_EXEMPT_CATEGORY: CodeEntry[] = [
  { code: "01", label: "SIKKIM Resident" },
  { code: "02", label: "Transactions carried out on behalf of STATE GOVT" },
  { code: "03", label: "Transactions carried out on behalf of CENTRAL GOVT" },
  { code: "04", label: "COURT APPOINTED OFFICIALS" },
  { code: "05", label: "UN Entity/Multilateral agency exempt from paying tax in India" },
  { code: "06", label: "Official Liquidator" },
  { code: "07", label: "Court Receiver" },
  { code: "08", label: "SIP of Mutual Funds Upto Rs. 50,000/- p.a." },
];

// ─── 6. APP_DOC_PROOF (Document Submission Details) ──────────────────────────
export const NDML_DOC_PROOF: CodeEntry[] = [
  { code: "S", label: "Self Certified Copies Submitted (Originals Verified)" },
  { code: "T", label: "True Copies of Documents Received" },
];

// ─── 7. APP_DUMP_TYPE ────────────────────────────────────────────────────────
export const NDML_DUMP_TYPE: CodeEntry[] = [
  { code: "I", label: "Incremental" },
  { code: "F", label: "Full Download" },
  { code: "P", label: "Partial Download" },
  { code: "E", label: "EOD" },
  { code: "S", label: "Solicited" },
  { code: "U", label: "Unsolicited" },
];

// ─── 8. APP_STATUS (KYC Status) — used in NDML responses ─────────────────────
export const NDML_KYC_STATUS: CodeEntry[] = [
  { code: "01", label: "UNDER_PROCESS" },
  { code: "02", label: "KYC REGISTERED" },
  { code: "03", label: "ON HOLD" },
  { code: "04", label: "KYC REJECTED" },
  { code: "05", label: "NOT AVAILABLE" },
  { code: "06", label: "Deactivate" },
  { code: "07", label: "KYC Validated" },
  { code: "11", label: "UNDER_PROCESS" },
  { code: "12", label: "KYC REGISTERED" },
  { code: "13", label: "ON HOLD" },
  { code: "14", label: "KYC REJECTED" },
  { code: "21", label: "Mutual Fund under process" },
  { code: "22", label: "Mutual Fund verified" },
];

// ─── 9. APP_COMP_STATUS (Non-Individual) ─────────────────────────────────────
/**
 * NDML XML upload uses 2-digit codes. The "Webservice OKRA Code" column in
 * the master is what KRA's SOAP service `nonIndividualRegisterUploadKraXML`
 * actually consumes, so we map to that.
 *
 * Aliases include the labels users type in the CRM form and our internal
 * `EntityConstitutionType` enum values.
 */
export const NDML_COMP_STATUS: CodeEntry[] = [
  { code: "01", label: "Private Limited Co.", aliases: ["PRIVATE_LIMITED", "Private Ltd Company", "Private Limited", "PRIVATE_LTD"] },
  { code: "02", label: "Public Ltd. Co.", aliases: ["PUBLIC_LIMITED", "Public Ltd Company", "Public Limited"] },
  { code: "03", label: "Body Corporate", aliases: ["BODY_CORPORATE"] },
  { code: "04", label: "Partnership", aliases: ["PARTNERSHIP", "Partnership Firm"] },
  { code: "05", label: "Trust / Charities / NGOs", aliases: ["TRUST", "Trust", "Charities", "NGO", "NGOs"] },
  { code: "06", label: "FI", aliases: ["Financial Institution"] },
  { code: "07", label: "FII" },
  { code: "08", label: "HUF", aliases: ["HUF", "Hindu Undivided Family"] },
  { code: "09", label: "AOP", aliases: ["Association of Persons"] },
  { code: "10", label: "Bank" },
  { code: "11", label: "Government Body", aliases: ["Government"] },
  { code: "12", label: "Non-Government Organisation", aliases: ["NGO"] },
  { code: "13", label: "Defense Establishment" },
  { code: "14", label: "Body of Individuals", aliases: ["BOI"] },
  { code: "15", label: "Society" },
  { code: "16", label: "LLP", aliases: ["Limited Liability Partnership"] },
  { code: "19", label: "FPI - Category I" },
  { code: "20", label: "FPI - Category II" },
  { code: "21", label: "FPI - Category III" },
  { code: "99", label: "Others", aliases: ["OTHER", "Other"] },
];

// ─── 10. APP_INCOME (Gross Annual Income — Non Individual) ───────────────────
//     Official NDML / CVL KRA codes.
export const NDML_ANNUAL_INCOME_NON_INDIVIDUAL: CodeEntry[] = [
  { code: "01", label: "Below Rs. 1 Lac", aliases: ["Below Rs. 1  Lac", "Below 1 Lac", "<1L"] },
  { code: "02", label: "Btw Rs. 1 to Rs. 5 Lacs", aliases: ["1-5L", "Rs. 1 to Rs. 5 Lacs"] },
  { code: "03", label: "Btw Rs. 5 to Rs. 10 Lacs", aliases: ["5-10L"] },
  { code: "04", label: "Btw Rs. 10 to Rs. 25 Lacs", aliases: ["10-25L"] },
  { code: "05", label: "Btw Rs. 25 Lacs to Rs. 1 Crore", aliases: ["25L-1Cr", "Btw Rs. 25 Lacs to Rs. 1 Cr"] },
  { code: "06", label: "More than Rs. 1 Crore", aliases: [">1Cr", "Above 1 Crore"] },
];

// ─── 11. APP_OCC (Occupation — Individual; non-ind usually leaves blank) ─────
export const NDML_OCCUPATION: CodeEntry[] = [
  { code: "01", label: "Private Sector", aliases: ["Private Sector Service"] },
  { code: "10", label: "Government Service", aliases: ["Government Sector"] },
  { code: "03", label: "Business" },
  { code: "04", label: "Professional" },
  { code: "05", label: "Agriculturist" },
  { code: "06", label: "Retired" },
  { code: "07", label: "Housewife" },
  { code: "08", label: "Student" },
  { code: "99", label: "Others" },
];

// ─── 12. APP_POL_CONN (PEP) ──────────────────────────────────────────────────
export const NDML_POLITICAL_CONNECTION: CodeEntry[] = [
  { code: "RPEP", label: "Related to a PEP", aliases: ["RELATED PEP"] },
  { code: "PEP", label: "Politically Exposed Person" },
  { code: "NA", label: "Not Applicable", aliases: ["NONE"] },
];

// ─── 13. APP_ADDLDATA_RELATIONSHIP — Relationship to Applicant ───────────────
export const NDML_RELATIONSHIP: CodeEntry[] = [
  { code: "01", label: "Promoter" },
  { code: "06", label: "Partner" },
  { code: "03", label: "Karta" },
  { code: "04", label: "Trustee" },
  { code: "02", label: "Whole Time Director", aliases: ["Director", "WHOLE_TIME_DIRECTOR"] },
  { code: "05", label: "Authorised Signatory", aliases: ["AUTHORISED_SIGNATORY", "SIGNATORY", "Authorized Signatory"] },
  { code: "07", label: "Beneficial Owner" },
  { code: "08", label: "Promoter & Beneficial Owner" },
  { code: "09", label: "Whole Time Director & Beneficial Owner" },
  { code: "10", label: "Trustee & Beneficial Owner" },
  { code: "11", label: "Authorised Signatory & Beneficial Owner" },
  { code: "12", label: "Partner & Beneficial Owner" },
  { code: "13", label: "Director & Beneficial Owner" },
];

// ─── 14. APP_COR_ADD_PROOF / APP_PER_ADD_PROOF — Proof of Address ───────────
//     Official NDML / CVL KRA codes. `lookup()` matches code, label, or any
//     alias case-insensitively, so legacy stored values (whether as code or
//     label) still resolve to the correct NDML code on submission.
export const NDML_ADDRESS_PROOF: CodeEntry[] = [
  { code: "01", label: "Passport" },
  { code: "02", label: "Voter Identity Card", aliases: ["Voter ID", "Voter ID Card"] },
  { code: "03", label: "Ration Card" },
  { code: "04", label: "Registered Lease / Sale Agreement of Residence" },
  { code: "05", label: "Driving License" },
  { code: "06", label: "Flat Maintenance Bill" },
  { code: "07", label: "Insurance copy" },
  {
    code: "08",
    label: "Latest Land Line Telephone / Electricity / Gas Bill",
    aliases: [
      "Latest Land Line Telephone Bill",
      "Latest Electricity Bill",
      "Gas Bill",
      "Telephone Bill",
      "Electricity Bill",
    ],
  },
  {
    code: "09",
    label: "Latest Bank Passbook / Account Statement",
    aliases: [
      "Latest Bank Passbook",
      "Latest Bank Account Statement",
      "Bank Statement",
    ],
  },
  { code: "10", label: "Self Declaration by High Court / Supreme Court Judge" },
  {
    code: "11",
    label:
      "Proof of Address by Scheduled Commercial / Co-operative / Multinational Foreign Banks",
    aliases: [
      "Proof of Address issued by Scheduled Commercial/Co-operative/Multinational Foreign banks",
    ],
  },
  {
    code: "12",
    label: "Proof of Address by Gazetted Officer",
    aliases: ["Proof of Address issued by Gazetted Officer"],
  },
  {
    code: "13",
    label: "Proof of Address by Notary Public",
    aliases: ["Proof of Address issued by Notary Public"],
  },
  {
    code: "14",
    label: "Proof of Address by Elected representatives to the Legislative Assembly",
    aliases: [
      "Proof of Address issued by Elected representatives to the Legislative Assembly",
    ],
  },
  {
    code: "15",
    label: "Proof of Address by Parliament",
    aliases: ["Proof of Address issued by Parliament"],
  },
  {
    code: "16",
    label:
      "Shops & Establishments Registration Certificate / Govt or Statutory Authority address proof",
    aliases: [
      "Registration Certificate issued under Shops and Establishments Act",
      "Proof of Address issued by any Government / Statutory Authority",
    ],
  },
  {
    code: "17",
    label: "ID Card with address by Central / State Government",
    aliases: ["ID Card with address issued by Central / State Government"],
  },
  {
    code: "18",
    label: "ID Card with address by Statutory / Regulatory Authorities",
    aliases: ["ID Card with address issued by Statutory / Regulatory Authorities"],
  },
  {
    code: "19",
    label: "ID Card with address by Public Sector Undertakings",
    aliases: ["ID Card with address issued by Public Sector Undertakings"],
  },
  {
    code: "20",
    label: "ID Card with address by Scheduled Commercial Banks",
    aliases: ["ID Card with address issued by Scheduled Commercial Banks"],
  },
  {
    code: "21",
    label: "ID Card with address by Public Financial Institutions",
    aliases: ["ID Card with address issued by Public Financial Institutions"],
  },
  {
    code: "22",
    label: "ID Card with address by Colleges affiliated to universities",
    aliases: ["ID Card with address issued by Colleges affiliated to universities"],
  },
  {
    code: "23",
    label: "ID Card by Professional Bodies (ICAI / ICWAI / ICSI / Bar Council, etc.)",
    aliases: [
      "ID Card issued by Professional Bodies (ICAI/ICWAI/ICSI/Bar Council etc.) to members",
    ],
  },
  {
    code: "24",
    label:
      "Power of Attorney given by FII / sub-account to Custodian (notarised / apostiled)",
    aliases: [
      "Power of Attorney given by FII/sub-account to Custodian (registered address)",
    ],
  },
  { code: "25", label: "Proof of address in the name of the spouse" },
  {
    code: "26",
    label: "Aadhaar / UID (Unique Identification Number)",
    aliases: ["Aadhaar / UID", "Aadhaar", "UID", "AADHAAR"],
  },
  { code: "27", label: "NAREGA Job Card" },
  { code: "30", label: "NPR (National Population Register)", aliases: ["NPR"] },
  { code: "99", label: "Others", aliases: ["OTHER", "Other"] },
  { code: "NA", label: "Latest Demat Account Statement" },
];

// ─── 15. APP_EXMT_ID_PROOF — Proof of Identity ───────────────────────────────
export const NDML_ID_PROOF: CodeEntry[] = [
  { code: "02", label: "Unique Identification Number (Aadhaar)", aliases: ["UID", "AADHAAR"] },
  { code: "03", label: "Passport" },
  { code: "05", label: "Voter ID Card" },
  { code: "04", label: "Driving License" },
  { code: "01", label: "PAN Card with Photograph", aliases: ["PAN"] },
  { code: "06", label: "ID Card issued by Central / State Govt" },
  { code: "07", label: "ID Card issued by Statutory/Regulatory Authorities" },
  { code: "08", label: "ID Card issued by PSUs" },
  { code: "09", label: "ID Card issued by Scheduled Commercial Banks" },
  { code: "10", label: "ID Card issued by Public Financial Institutions" },
  { code: "11", label: "ID Card issued by Colleges affiliated to Universities" },
  { code: "12", label: "ID Card issued by Professional Bodies (ICAI, ICWAI, ICSI, Bar Council …)" },
  { code: "13", label: "Credit / Debit cards issued by Banks" },
];

// ─── 16. APP_FATCA_TAX_IDENTIFICATION_TYPE ───────────────────────────────────
export const NDML_TIN_TYPE: CodeEntry[] = [
  { code: "TIN", label: "Tax ID Number" },
  { code: "GIIN", label: "Global ID Number" },
  { code: "CIN", label: "Company ID Number" },
  { code: "TINEQ", label: "Other Equivalent ID Number" },
  { code: "TNA", label: "No TIN / TIN Equivalent" },
];

// ─── 17. APP_FATCA_TAX_EXEMPT_REASON ─────────────────────────────────────────
export const NDML_TIN_EXEMPT_REASON: CodeEntry[] = [
  { code: "01", label: "Student (Individual)" },
  { code: "02", label: "Home-maker (Individual)" },
  { code: "03", label: "House-Wife (Individual)" },
  { code: "04", label: "Retired (Individual)" },
  { code: "05", label: "Diplomat (Individual)" },
  { code: "06", label: "TIN Not Eligible as of now NA. (Individual)" },
  { code: "07", label: "Entity's Country of Incorporation / Tax Residence is US but Entity is not a Specified US person" },
  { code: "08", label: "FFI - GIIN Application Pending" },
  { code: "09", label: "NFFE - GIIN Application Pending" },
  { code: "10", label: "FFI - GIIN Not Required" },
  { code: "11", label: "NFFE - GIIN Not Required" },
  { code: "12", label: "Non-Participating FFI" },
  { code: "13", label: "FATCA Exempt NFFE" },
  { code: "14", label: "Others" },
];

// ─── 18. APP_FATCA_OTHER_SERVICES ────────────────────────────────────────────
export const NDML_FATCA_OTHER_SERVICES: CodeEntry[] = [
  { code: "CAT1", label: "Foreign Exchange / Money Changer Services" },
  { code: "CAT2", label: "Gaming / Gambling / Lottery Services" },
  { code: "CAT3", label: "Money Laundering / Pawning" },
  { code: "CT12", label: "Foreign Exchange + Gaming / Gambling / Lottery" },
  { code: "CT23", label: "Gaming / Gambling / Lottery + Money Laundering" },
  { code: "CT13", label: "Foreign Exchange + Money Laundering / Pawning" },
  { code: "CALL", label: "All three categories" },
];

// ─── 19. APP_ERROR_DESC — full NDML rejection-reason dictionary ──────────────
export const NDML_REJECTION_REASONS: Record<string, string> = {
  "ERR-00001": "ADDRESS ON APPLICATION NOT MATCHING WITH THE ADDRESS PROOF SUBMITTED",
  "ERR-00002": "ADDRESS PROOF SUBMITTED NOT CURRENT",
  "ERR-00003": "APPLICANT HAS NOT SIGNED ON THE APPLICATION FORM",
  "ERR-00004": "APPLICANT PHOTO MISSING ON THE APPLICATION FORM",
  "ERR-00005": "APPLICATION FORM INCOMPLETE",
  "ERR-00006": "APPLICATION FORM NOT IN PRESCRIBED FORMAT",
  "ERR-00007": "DOC NOT RECEIVED FROM POS",
  "ERR-00008": "INVALID APPLICATION FORM FORMAT (FORM NOT AS PER AMFI FORMAT)",
  "ERR-00009": "INVALID PAN",
  "ERR-00010": "MINOR PAN CARD COPY SUBMITTED",
  "ERR-00011": "MOBILE BILL SUBMITTED AS A ADDRESS PROOF",
  "ERR-00012": "NAME ON PAN DOES NOT MATCH WITH THE NAME ON APPLICATION FORM",
  "ERR-00013": "OTHERS",
  "ERR-00014": "PAN CARD COPY NOT LEGIBLE",
  "ERR-00015": "PAN CARD COPY NOT SUBMITTED",
  "ERR-00016": "POS HAS NOT VERIFIED THE DOCUMENTS WITH THE ORIGINAL",
  "ERR-00017": "PROOF OF ADDRESS NOT SUBMITTED",
  "ERR-00018": "PROOF OF ADDRESS NOT VALID",
  "ERR-00019": "PROOF OF ADDRESS NOT IN THE NAME OF APPLICANT",
  "ERR-00020": "PROOF OF CORRESPONDENCE ADDRESS NOT PROPER",
  "ERR-00021": "PROOF OF IDENTITY NOT AVAILABLE / IMPROPER",
  "ERR-00022": "PROOF OF PERMANENT ADDRESS NOT PROPER",
  "ERR-00023": "VALIDITY PAGE OF DRIVING LICENSE NOT SUBMITTED",
  "ERR-00024": "VALIDITY PAGE OF PASSPORT COPY NOT SUBMITTED",
  "ERR-90001": "KYC DATA NOT MATCHING THE FOOTER COUNT CONTROL",
  "ERR-90002": "KYC ADDITIONAL DATA NOT MATCHING THE FOOTER COUNT CONTROL",
  "ERR-90003": "INVALID UPDATE FLAG",
  "ERR-90004": "INVALID ENTITY TYPE",
  "ERR-90005": "INVALID EXEMPTION TYPE",
  "ERR-90006": "INVALID EXEMPTION CATEGORY",
  "ERR-90007": "INVALID ID PROOF",
  "ERR-90008": "INVALID IN-PERSON VERIFICATION FLAG",
  "ERR-90009": "INVALID IN-PERSON VERIFICATION DATE",
  "ERR-90010": "INVALID GENDER / IN-PERSON VERIFICATION DATE",
  "ERR-90011": "APPLICANT NAME IS MANDATORY & SHOULD BE LESS THAN 100 CHARS",
  "ERR-90012": "FATHER / SPOUSE NAME IS MANDATORY & SHOULD BE LESS THAN 100 CHARS",
  "ERR-90013": "INVALID DATE OF BIRTH / INCORPORATION DATE",
  "ERR-90014": "INVALID COMMENCEMENT DATE",
  "ERR-90015": "INVALID NATIONALITY",
  "ERR-90016": "INVALID NATIONALITY - OTHERS",
  "ERR-90017": "INVALID COMPANY STATUS",
  "ERR-90018": "INVALID COMPANY STATUS - OTHERS",
  "ERR-90019": "INVALID RESIDENCE STATUS",
  "ERR-90020": "INVALID RESIDENCE PROOF - FOR NON RESIDENTS",
  "ERR-90021": "INVALID PAN NO",
  "ERR-90022": "INVALID PAN COPY ATTACHMENT FLAG",
  "ERR-90023": "CORRESPONDENCE ADDRESS1 IS MANDATORY",
  "ERR-90024": "CORRESPONDENCE CITY IS MANDATORY",
  "ERR-90025": "CORRESPONDENCE STATE IS MANDATORY",
  "ERR-90026": "INVALID CORRESPONDENCE PIN CODE",
  "ERR-90027": "INVALID CORRESPONDENCE COUNTRY",
  "ERR-90028": "INVALID EMAIL ADDRESS",
  "ERR-90029": "INVALID CORRESPONDENCE ADDRESS PROOF",
  "ERR-90030": "INVALID CORRESPONDENCE ADDRESS PROOF ID",
  "ERR-90031": "INVALID CORRESPONDENCE ADDRESS PROOF DATE",
  "ERR-90032": "INVALID PERMANENT ADDRESS FLAG",
  "ERR-90033": "REGD / PERMANENT / FOREIGN ADDRESS1 IS MANDATORY",
  "ERR-90034": "REGD / PERMANENT / FOREIGN CITY IS MANDATORY",
  "ERR-90035": "REGD / PERMANENT / FOREIGN STATE IS MANDATORY",
  "ERR-90036": "INVALID REGD / PERMANENT / FOREIGN PIN CODE",
  "ERR-90037": "INVALID REGD / PERMANENT / FOREIGN COUNTRY",
  "ERR-90038": "INVALID REGD / PERMANENT / FOREIGN ADDRESS PROOF",
  "ERR-90039": "INVALID REGD / PERMANENT / FOREIGN ADDRESS PROOF ID",
  "ERR-90040": "INVALID REGD / PERMANENT / FOREIGN ADDRESS PROOF DATE",
  "ERR-90041": "INVALID INCOME DETAILS",
  "ERR-90042": "INVALID OCCUPATION DETAILS",
  "ERR-90043": "INVALID OCCUPATION DETAILS - OTHERS",
  "ERR-90044": "INVALID POLITICAL CONNECTION INFO",
  "ERR-90045": "INVALID DOCUMENT PROOF TYPE",
  "ERR-90046": "INVALID MARITAL STATUS",
  "ERR-90047": "INVALID INCORPORATION CITY",
  "ERR-90048": "INVALID NETWORTH DETAIL",
  "ERR-90049": "INVALID NETWORTH DATE",
  "ERR-90050": "EITHER (NETWORTH & DATE) OR INCOME DETAIL IS MANDATORY",
  "ERR-90051": "BOTH NETWORTH, NETWORTH DATE AND INCOME DETAIL ARE MANDATORY",
  "ERR-90052": "INVALID ADDITIONAL DATA UPDATE FLAG",
  "ERR-90053": "INVALID ADDITIONAL DATA ENTITY PAN",
  "ERR-90054": "INVALID ADDITIONAL DATA DIRECTOR'S PAN",
  "ERR-90055": "DIRECTOR / KARTA / PARTNER NAME IS MANDATORY & SHOULD BE LESS THAN 100 CHARS",
  "ERR-90056": "DIRECTOR / KARTA / PARTNER DIN / UID IS MANDATORY & SHOULD BE LESS THAN 20 CHARS",
  "ERR-90057": "DIRECTOR / KARTA / PARTNER RELATIONSHIP IS INVALID",
  "ERR-90058": "DIRECTOR / KARTA / PARTNER POLITICAL CONNECTION FLAG IS INVALID",
  "ERR-90059": "REGISTRATION NO IS MANDATORY & LESS THAN 30 CHARS",
  "ERR-90060": "INVALID REGISTRATION NO.",
  "ERR-90061": "KYC DATA ALREADY EXISTS FOR THE PAN",
  "ERR-90062": "COMPANY CODE IN HEADER DOES NOT MATCH YOUR COMPANY CODE",
  "ERR-90063": "POS CODE IN DATA DOES NOT MATCH YOUR ELIGIBLE POS CODES",
  "ERR-99999": "KYC DATA PRESENT IN OTHER KRA",
};

// ─── Field-length caps (varchar widths from "Non Individual - Request" sheet) ─
/**
 * Hard length caps NDML's validator enforces on the Non-Individual request.
 * Values exceeding these widths trigger `ERR-9001x` family rejections.
 */
export const NDML_FIELD_LENGTHS = {
  APP_NAME: 105,
  APP_F_NAME: 105,
  APP_PAN_NO: 10,
  APP_REGNO: 50,
  APP_COR_ADD1: 120,
  APP_COR_ADD2: 120,
  APP_COR_ADD3: 120,
  APP_COR_CITY: 30,
  APP_COR_PINCD: 10,
  APP_COR_STATE: 20,
  APP_COR_CTRY: 3,
  APP_PER_ADD1: 120,
  APP_PER_ADD2: 120,
  APP_PER_ADD3: 120,
  APP_PER_CITY: 30,
  APP_PER_PINCD: 10,
  APP_PER_STATE: 20,
  APP_PER_CTRY: 3,
  APP_EMAIL: 100,
  APP_INCORP_PLC: 100,
  APP_OTHERINFO: 100,
  APP_OTH_COMP_STATUS: 100,
  APP_ADDLDATA_NAME: 105,
  APP_ADDLDATA_DIN: 12,
  APP_ADDLDATA_UID: 12,
  APP_ADDLDATA_PAN: 20,
  APP_ENTITY_PAN: 20,
  APP_ADDLDATA_RESADD1: 36,
  APP_ADDLDATA_RESADD2: 36,
  APP_ADDLDATA_RESADD3: 36,
  APP_ADDLDATA_RESCITY: 36,
  APP_ADDLDATA_RESPINCD: 10,
  APP_ADDLDATA_RESSTATE: 2,
  APP_ADDLDATA_RESCOUNTRY: 3,
} as const;

// ─── Public helpers ──────────────────────────────────────────────────────────

/** Find a code entry by either code, label, or alias. Case-insensitive. */
export function findCode(table: CodeEntry[], value: string | null | undefined): CodeEntry | undefined {
  return lookup(table, value);
}

export function decodeKycStatus(code: string | null | undefined): string | undefined {
  if (!code) return undefined;
  return NDML_KYC_STATUS.find((c) => c.code === String(code).trim())?.label;
}

export function decodeRejectionReason(code: string | null | undefined): string | undefined {
  if (!code) return undefined;
  return NDML_REJECTION_REASONS[String(code).trim().toUpperCase()];
}

export function decodeRelationship(code: string | null | undefined): string | undefined {
  if (!code) return undefined;
  return NDML_RELATIONSHIP.find((c) => c.code === String(code).trim())?.label;
}

export function decodeCompStatus(code: string | null | undefined): string | undefined {
  if (!code) return undefined;
  return NDML_COMP_STATUS.find((c) => c.code === String(code).trim())?.label;
}

/** Best-effort mapping of free-text/annual-income strings to NDML income codes. */
export function mapAnnualIncomeToNdml(value: string | null | undefined): { code: string; label: string } | undefined {
  if (!value) return undefined;
  const hit = lookup(NDML_ANNUAL_INCOME_NON_INDIVIDUAL, value);
  if (hit) return { code: hit.code, label: hit.label };
  // numeric fallbacks
  const num = Number(String(value).replace(/[^\d.]/g, ""));
  if (Number.isFinite(num) && num > 0) {
    if (num < 1e5) return { code: "01", label: "Below Rs. 1 Lac" };
    if (num <= 5e5) return { code: "02", label: "Btw Rs. 1 to Rs. 5 Lacs" };
    if (num <= 1e6) return { code: "03", label: "Btw Rs. 5 to Rs. 10 Lacs" };
    if (num <= 2.5e6) return { code: "04", label: "Btw Rs. 10 to Rs. 25 Lacs" };
    if (num <= 1e7) return { code: "05", label: "Btw Rs. 25 Lacs to Rs. 1 Crore" };
    return { code: "06", label: "More than Rs. 1 Crore" };
  }
  return undefined;
}

/** Best-effort mapping of entity-constitution to NDML company-status code. */
export function mapCompStatusToNdml(value: string | null | undefined): { code: string; label: string } | undefined {
  if (!value) return undefined;
  const hit = lookup(NDML_COMP_STATUS, value);
  if (hit) return { code: hit.code, label: hit.label };
  return undefined;
}

/** Best-effort mapping of an address-proof label/code to the NDML code. */
export function mapAddressProofToNdml(value: string | null | undefined): { code: string; label: string } | undefined {
  if (!value) return undefined;
  const hit = lookup(NDML_ADDRESS_PROOF, value);
  if (hit) return { code: hit.code, label: hit.label };
  return undefined;
}

/** Compact subset of code tables that's safe to embed in the CRM preview API. */
export const NDML_CODE_REFERENCE = {
  iopFlag: NDML_IOP_FLG,
  addlUpdateFlag: NDML_ADDL_UPDT_FLG,
  entityType: NDML_ENTITY_TYPE,
  yesNo: NDML_YES_NO,
  docProof: NDML_DOC_PROOF,
  dumpType: NDML_DUMP_TYPE,
  kycStatus: NDML_KYC_STATUS,
  companyStatus: NDML_COMP_STATUS,
  annualIncome: NDML_ANNUAL_INCOME_NON_INDIVIDUAL,
  occupation: NDML_OCCUPATION,
  politicalConnection: NDML_POLITICAL_CONNECTION,
  relationship: NDML_RELATIONSHIP,
  addressProof: NDML_ADDRESS_PROOF,
  idProof: NDML_ID_PROOF,
  tinType: NDML_TIN_TYPE,
  tinExemptReason: NDML_TIN_EXEMPT_REASON,
  fatcaOtherServices: NDML_FATCA_OTHER_SERVICES,
  states: getKraStateCodeReferenceRows(),
} as const;
