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
): "Mr." | "Ms." | "Mr. / Ms." {
  const normalized = normalizeGenderValue(gender);
  if (normalized === "FEMALE") return "Ms.";
  if (normalized === "MALE") return "Mr.";
  return "Mr. / Ms.";
}
