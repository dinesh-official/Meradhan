/**
 * Official NDML / CVL KRA state codes for Non-Individual KRA payloads
 * (`APP_COR_STATE`, `APP_PER_STATE`). Names match NDML's master verbatim,
 * including legacy spellings still accepted by the integration.
 */
export type KraStateEntry = {
  code: string;
  name: string;
};

/** Canonical NDML state list — one row per code. */
export const KRA_STATE_MASTER: KraStateEntry[] = [
  { code: "035", name: "Andaman & Nicobar Islands" },
  { code: "028", name: "Andhra Pradesh" },
  { code: "012", name: "Arunachal Pradesh" },
  { code: "013", name: "Assam" },
  { code: "010", name: "Bihar" },
  { code: "004", name: "Chandigarh" },
  { code: "026", name: "Dadra & Nagar Haveli" },
  { code: "025", name: "Daman & Diu" },
  { code: "007", name: "Delhi" },
  { code: "030", name: "Goa" },
  { code: "024", name: "Gujarat" },
  { code: "006", name: "Haryana" },
  { code: "002", name: "Himachal Pradesh" },
  { code: "001", name: "Jammu & Kashmir" },
  { code: "029", name: "Karnataka" },
  { code: "032", name: "Kerala" },
  { code: "031", name: "Lakhswadeep" },
  { code: "023", name: "Madhya Pradesh" },
  { code: "027", name: "Maharashtra" },
  { code: "014", name: "Manipur" },
  { code: "017", name: "Meghalaya" },
  { code: "015", name: "Mizoram" },
  { code: "018", name: "Nagaland" },
  { code: "021", name: "Orissa" },
  { code: "034", name: "Pondicherry" },
  { code: "003", name: "Punjab" },
  { code: "008", name: "Rajasthan" },
  { code: "011", name: "Sikkim" },
  { code: "033", name: "Tamil Nadu" },
  { code: "016", name: "Tripura" },
  { code: "009", name: "Uttar Pradesh" },
  { code: "019", name: "West Bengal" },
  { code: "022", name: "Chhattisgarh" },
  { code: "005", name: "Uttaranchal" },
  { code: "020", name: "Jharkhand" },
  { code: "037", name: "Telangana" },
  { code: "099", name: "Others (please specify)" },
];

/** Alternate spellings → canonical NDML name (case-insensitive). */
const KRA_STATE_NAME_ALIASES: Record<string, string> = {
  "andaman and nicobar islands": "Andaman & Nicobar Islands",
  "dadra and nagar haveli": "Dadra & Nagar Haveli",
  "daman and diu": "Daman & Diu",
  "jammu and kashmir": "Jammu & Kashmir",
  lakshadweep: "Lakhswadeep",
  odisha: "Orissa",
  puducherry: "Pondicherry",
  uttarakhand: "Uttaranchal",
  "import (not registered in india)": "Others (please specify)",
};

const CODE_LOOKUP = new Map(
  KRA_STATE_MASTER.map((entry) => [entry.code, entry] as const),
);

const NAME_LOOKUP = new Map(
  KRA_STATE_MASTER.map((entry) => [entry.name.trim().toLowerCase(), entry] as const),
);

function padKraStateCode(code: string): string {
  const n = Number(String(code).trim());
  if (!Number.isFinite(n)) return String(code).trim();
  return String(n).padStart(3, "0");
}

export function lookupKraStateByCode(
  code: string | null | undefined,
): KraStateEntry | undefined {
  if (code == null) return undefined;
  const raw = String(code).trim();
  if (!raw) return undefined;
  if (!/^\d+$/.test(raw)) return undefined;
  return CODE_LOOKUP.get(padKraStateCode(raw));
}

export function lookupKraStateByName(
  name: string | null | undefined,
): KraStateEntry | undefined {
  if (name == null) return undefined;
  const raw = name.trim();
  if (!raw) return undefined;

  const direct = NAME_LOOKUP.get(raw.toLowerCase());
  if (direct) return direct;

  const aliasTarget = KRA_STATE_NAME_ALIASES[raw.toLowerCase()];
  if (aliasTarget) return NAME_LOOKUP.get(aliasTarget.toLowerCase());

  return undefined;
}

/**
 * Resolve a stored state value (NDML name, alias, or numeric code) to the
 * canonical NDML name used by the corporate KYC dropdown.
 */
export function normalizeKraStateName(
  value: string | null | undefined,
): string {
  if (value == null) return "";
  const raw = value.trim();
  if (!raw) return "";

  const byCode = lookupKraStateByCode(raw);
  if (byCode) return byCode.name;

  const byName = lookupKraStateByName(raw);
  if (byName) return byName.name;

  return raw;
}

export function getKraStateCodeForName(
  name: string | null | undefined,
): string {
  const normalized = normalizeKraStateName(name);
  if (!normalized) return "099";
  return lookupKraStateByName(normalized)?.code ?? "099";
}

export type CorporateKycStateOption = {
  label: string;
  value: string;
  code: string;
};

/** Dropdown options for corporate KYC — label shows code + name; value is NDML name. */
export function getCorporateKycStateOptions(): CorporateKycStateOption[] {
  return KRA_STATE_MASTER.map((entry) => ({
    code: entry.code,
    name: entry.name,
    label: `${entry.code} — ${entry.name}`,
    value: entry.name,
  }));
}

/** Rows for NDML code-reference tables in CRM (code, label, aliases). */
export function getKraStateCodeReferenceRows(): Array<{
  code: string;
  label: string;
  aliases: string[];
}> {
  const aliasByCanonical = new Map<string, string[]>();
  for (const [alias, canonical] of Object.entries(KRA_STATE_NAME_ALIASES)) {
    const list = aliasByCanonical.get(canonical) ?? [];
    list.push(alias.replace(/\b\w/g, (c) => c.toUpperCase()));
    aliasByCanonical.set(canonical, list);
  }

  return KRA_STATE_MASTER.map((entry) => ({
    code: entry.code,
    label: entry.name,
    aliases: aliasByCanonical.get(entry.name) ?? [],
  }));
}
