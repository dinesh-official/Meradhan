import type { SelectOption } from "@/global/elements/inputs/SelectField";

export const addressProofOptions: SelectOption[] = [
  // Values are the Webservice/OKRA codes (what KRA expects in APP_*_ADD_PROOF)
  { label: "Passport", value: "01" },
  { label: "Voter Identity Card", value: "06" },
  { label: "Ration Card", value: "07" },
  { label: "Registered Lease / Sale Agreement of Residence", value: "08" },
  { label: "Driving License", value: "02" },
  { label: "Flat Maintenance Bill", value: "13" },
  { label: "Insurance copy", value: "14" },
  { label: "Latest Land Line Telephone Bill", value: "09" },
  { label: "Latest Electricity Bill", value: "10" },
  { label: "Gas Bill", value: "11" },
  { label: "Latest Bank Passbook", value: "03" },
  { label: "Latest Bank Account Statement", value: "04" },
  { label: "Self Declaration by High Court / Supreme Court Judge", value: "15" },
  {
    label:
      "Proof of Address issued by Scheduled Commercial/Co-operative/Multinational Foreign banks",
    value: "17",
  },
  { label: "Proof of Address issued by Gazetted Officer", value: "22" },
  { label: "Proof of Address issued by Notary Public", value: "21" },
  {
    label:
      "Proof of Address issued by Elected representatives to the Legislative Assembly",
    value: "18",
  },
  { label: "Proof of Address issued by Parliament", value: "19" },
  { label: "Registration Certificate issued under Shops and Establishments Act", value: "12" },
  { label: "Proof of Address issued by any Government / Statutory Authority", value: "20" },
  { label: "ID Card with address issued by Central / State Government", value: "23" },
  { label: "ID Card with address issued by Statutory / Regulatory Authorities", value: "24" },
  { label: "ID Card with address issued by Public Sector Undertakings", value: "25" },
  { label: "ID Card with address issued by Scheduled Commercial Banks", value: "26" },
  { label: "ID Card with address issued by Public Financial Institutions", value: "27" },
  { label: "ID Card with address issued by Colleges affiliated to universities", value: "28" },
  {
    label:
      "ID Card issued by Professional Bodies (ICAI/ICWAI/ICSI/Bar Council etc.) to members",
    value: "29",
  },
  { label: "Power of Attorney given by FII/sub-account to Custodian (registered address)", value: "16" },
  { label: "Proof of address in the name of the spouse", value: "NA" },
  { label: "Aadhaar / UID", value: "31" },
  { label: "NAREGA Job Card", value: "33" },
  // Radix Select doesn't allow empty-string values for items.
  // The spec we received doesn't provide a usable Webservice/OKRA code for NPR, so keep it disabled.
  { label: "Others", value: "32" },
  { label: "Latest Demat Account Statement", value: "05" },
];

