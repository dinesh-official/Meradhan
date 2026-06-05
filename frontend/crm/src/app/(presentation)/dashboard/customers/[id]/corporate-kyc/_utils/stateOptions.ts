import type { SelectOption } from "@/global/elements/inputs/SelectField";

/**
 * Official NDML / CVL KRA state code list (used as APP_COR_STATE and
 * APP_PER_STATE in the non-individual KRA payload).
 *
 * The dropdown stores the state name (matches the existing freeform
 * `registeredState` / `correspondenceState` columns) and the backend
 * `getKraState()` lookup converts the name into the 2-digit NDML code at
 * payload build time.
 *
 * State names mirror NDML's master verbatim — including legacy spellings
 * (e.g. "Lakhswadeep", "Orissa", "Pondicherry", "Uttaranchal") that NDML
 * still accepts. The backend `kraState` table holds modern aliases too
 * (Odisha, Puducherry, Uttarakhand) so older saved values keep resolving.
 */
export const stateOptions: SelectOption[] = [
  { label: "Andaman & Nicobar Islands", value: "Andaman & Nicobar Islands" },
  { label: "Andhra Pradesh", value: "Andhra Pradesh" },
  { label: "Arunachal Pradesh", value: "Arunachal Pradesh" },
  { label: "Assam", value: "Assam" },
  { label: "Bihar", value: "Bihar" },
  { label: "Chandigarh", value: "Chandigarh" },
  { label: "Dadra & Nagar Haveli", value: "Dadra & Nagar Haveli" },
  { label: "Daman & Diu", value: "Daman & Diu" },
  { label: "Delhi", value: "Delhi" },
  { label: "Goa", value: "Goa" },
  { label: "Gujarat", value: "Gujarat" },
  { label: "Haryana", value: "Haryana" },
  { label: "Himachal Pradesh", value: "Himachal Pradesh" },
  { label: "Jammu & Kashmir", value: "Jammu & Kashmir" },
  { label: "Karnataka", value: "Karnataka" },
  { label: "Kerala", value: "Kerala" },
  { label: "Lakhswadeep", value: "Lakhswadeep" },
  { label: "Madhya Pradesh", value: "Madhya Pradesh" },
  { label: "Maharashtra", value: "Maharashtra" },
  { label: "Manipur", value: "Manipur" },
  { label: "Meghalaya", value: "Meghalaya" },
  { label: "Mizoram", value: "Mizoram" },
  { label: "Nagaland", value: "Nagaland" },
  { label: "Orissa", value: "Orissa" },
  { label: "Pondicherry", value: "Pondicherry" },
  { label: "Punjab", value: "Punjab" },
  { label: "Rajasthan", value: "Rajasthan" },
  { label: "Sikkim", value: "Sikkim" },
  { label: "Tamil Nadu", value: "Tamil Nadu" },
  { label: "Tripura", value: "Tripura" },
  { label: "Uttar Pradesh", value: "Uttar Pradesh" },
  { label: "West Bengal", value: "West Bengal" },
  { label: "Chhattisgarh", value: "Chhattisgarh" },
  { label: "Uttaranchal", value: "Uttaranchal" },
  { label: "Jharkhand", value: "Jharkhand" },
  { label: "Telangana", value: "Telangana" },
  { label: "Others (please specify)", value: "Others (please specify)" },
];
