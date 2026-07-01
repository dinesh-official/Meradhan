import { normalizeKraStateName } from "@root/schema";

/**
 * Maps KRA state field to the canonical NDML name used in corporate KYC forms.
 * Numeric strings (with optional leading zeros) use the KRA master table;
 * otherwise returns a normalized name or trimmed input.
 */
export function kraStateCodeToName(code: string | null | undefined): string {
  return normalizeKraStateName(code);
}
