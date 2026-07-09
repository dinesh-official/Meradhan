import type { SelectOption } from "@/global/elements/inputs/SelectField";
import { getCorporateKycStateOptions } from "@root/schema";

/**
 * NDML / CVL KRA state dropdown for corporate KYC (`registeredState`,
 * `correspondenceState`). Values are canonical NDML state names; labels show
 * the 3-digit code. Backend `getKraState()` maps the name to `APP_*_STATE`.
 */
export const stateOptions: SelectOption[] = getCorporateKycStateOptions().map(
  (entry) => ({
    label: entry.label,
    value: entry.value,
  }),
);
