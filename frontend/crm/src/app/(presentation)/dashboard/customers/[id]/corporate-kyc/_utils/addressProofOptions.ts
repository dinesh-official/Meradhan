import type { SelectOption } from "@/global/elements/inputs/SelectField";

/**
 * Official NDML / CVL KRA address-proof code list.
 *
 * Values are the 2-digit (or 2-char) codes that NDML expects in
 * `APP_COR_ADD_PROOF` and `APP_PER_ADD_PROOF` on the non-individual /
 * individual KRA payloads.
 *
 * Some codes are shared by multiple acceptable proofs in NDML's master
 * (08 — utility bills; 09 — bank proofs; 16 — registration cert / govt
 * authority; 24 — POA variants). Radix Select doesn't allow duplicate
 * values, so those rows are merged into a single dropdown entry whose
 * label lists the equivalents separated by "/".
 *
 * Source: NDML address-proof codes table provided by the integration.
 */
export const addressProofOptions: SelectOption[] = [
  { label: "Passport", value: "01" },
  { label: "Voter Identity Card", value: "02" },
  { label: "Ration Card", value: "03" },
  { label: "Registered Lease / Sale Agreement of Residence", value: "04" },
  { label: "Driving License", value: "05" },
  { label: "Flat Maintenance Bill", value: "06" },
  { label: "Insurance copy", value: "07" },
  {
    label: "Latest Land Line Telephone / Electricity / Gas Bill",
    value: "08",
  },
  { label: "Latest Bank Passbook / Account Statement", value: "09" },
  {
    label: "Self Declaration by High Court / Supreme Court Judge",
    value: "10",
  },
  {
    label:
      "Proof of Address by Scheduled Commercial / Co-operative / Multinational Foreign Banks",
    value: "11",
  },
  { label: "Proof of Address by Gazetted Officer", value: "12" },
  { label: "Proof of Address by Notary Public", value: "13" },
  {
    label: "Proof of Address by Elected representatives to the Legislative Assembly",
    value: "14",
  },
  { label: "Proof of Address by Parliament", value: "15" },
  {
    label:
      "Shops & Establishments Registration Certificate / Govt or Statutory Authority address proof",
    value: "16",
  },
  {
    label: "ID Card with address by Central / State Government",
    value: "17",
  },
  {
    label: "ID Card with address by Statutory / Regulatory Authorities",
    value: "18",
  },
  {
    label: "ID Card with address by Public Sector Undertakings",
    value: "19",
  },
  {
    label: "ID Card with address by Scheduled Commercial Banks",
    value: "20",
  },
  {
    label: "ID Card with address by Public Financial Institutions",
    value: "21",
  },
  {
    label: "ID Card with address by Colleges affiliated to universities",
    value: "22",
  },
  {
    label:
      "ID Card by Professional Bodies (ICAI / ICWAI / ICSI / Bar Council, etc.)",
    value: "23",
  },
  {
    label:
      "Power of Attorney given by FII / sub-account to Custodian (notarised / apostiled)",
    value: "24",
  },
  { label: "Proof of address in the name of the spouse", value: "25" },
  { label: "Aadhaar / UID (Unique Identification Number)", value: "26" },
  { label: "NAREGA Job Card", value: "27" },
  { label: "NPR (National Population Register)", value: "30" },
  { label: "Others", value: "99" },
  { label: "Latest Demat Account Statement", value: "NA" },
];
