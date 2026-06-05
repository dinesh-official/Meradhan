import type { SelectOption } from "@/global/elements/inputs/SelectField";

/**
 * Official NDML / CVL KRA gross-annual-income code list (non-individual).
 *
 * Values are the 2-digit codes that NDML expects in `APP_INCOME` on the
 * KRA payload. Storing the code (rather than the label) keeps the submitted
 * value byte-identical to what NDML returns on enquiry / download, so the
 * label resolves consistently in both directions.
 *
 * Source: NDML income-bracket master provided by the integration.
 */
export const annualIncomeOptions: SelectOption[] = [
  { label: "Below Rs. 1 Lac", value: "01" },
  { label: "Btw Rs. 1 to Rs. 5 Lacs", value: "02" },
  { label: "Btw Rs. 5 to Rs. 10 Lacs", value: "03" },
  { label: "Btw Rs. 10 to Rs. 25 Lacs", value: "04" },
  { label: "Btw Rs. 25 Lacs to Rs. 1 Crore", value: "05" },
  { label: "More than Rs. 1 Crore", value: "06" },
];
