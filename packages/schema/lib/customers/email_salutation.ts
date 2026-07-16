export type GenderSources = {
  gender?: unknown;
  panCard?: { gender?: unknown } | null;
  aadhaarCard?: { gender?: unknown } | null;
};

function normalizeGenderValue(gender: unknown): "MALE" | "FEMALE" | null {
  const g = String(gender ?? "").trim().toUpperCase();
  if (!g || g === "OTHER" || g === "NA") return null;
  if (g === "FEMALE" || g === "F") return "FEMALE";
  if (g === "MALE" || g === "M") return "MALE";
  return null;
}

/** Prefer profile gender, then PAN, then Aadhaar (KYC often stores gender only on documents). */
export function resolveGenderForEmailSalutation(
  sources: GenderSources | null | undefined,
): "MALE" | "FEMALE" | null {
  if (!sources) return null;
  return (
    normalizeGenderValue(sources.gender) ??
    normalizeGenderValue(sources.panCard?.gender) ??
    normalizeGenderValue(sources.aadhaarCard?.gender) ??
    null
  );
}

export function getEmailSalutationFromGender(
  gender: unknown,
): "Mr." | "Ms." | "" {
  const normalized = normalizeGenderValue(gender);
  if (normalized === "FEMALE") return "Ms.";
  if (normalized === "MALE") return "Mr.";
  return ""
}

export type EmailTitle = "Mr." | "Ms.";

/** Salutation for "Dear …" lines (profile → PAN → Aadhaar). */
export function getEmailSalutationFromSources(
  sources: GenderSources | null | undefined,
): "Mr." | "Ms." | "" {
  return getEmailSalutationFromGender(resolveGenderForEmailSalutation(sources));
}

/** For HTML templates that accept optional `title` (Mr./Ms. only; omitted when unknown). */
export function getOptionalEmailTitleFromSources(
  sources: GenderSources | null | undefined,
): EmailTitle | undefined {
  const resolved = resolveGenderForEmailSalutation(sources);
  if (resolved === "MALE") return "Mr.";
  if (resolved === "FEMALE") return "Ms.";
  return undefined;
}
