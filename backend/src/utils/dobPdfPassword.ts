/**
 * PDF attachment password: customer DOB as DDMMYYYY (e.g. 3 April 1996 → 03041996).
 */
export function dateOfBirthToPdfPassword(dobRaw: string | null | undefined): string | null {
  if (dobRaw == null || String(dobRaw).trim() === "") return null;
  const s = String(dobRaw).trim();

  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso?.[1] != null && iso[2] != null && iso[3] != null) {
    const y = iso[1];
    const m = iso[2];
    const d = iso[3];
    return `${d}${m}${y}`;
  }

  const slash = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (slash?.[1] != null && slash[2] != null && slash[3] != null) {
    const d = slash[1].padStart(2, "0");
    const m = slash[2].padStart(2, "0");
    const y = slash[3];
    return `${d}${m}${y}`;
  }

  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = String(d.getFullYear());
    return `${dd}${mm}${yyyy}`;
  }

  return null;
}

export function getCustomerDobRawForPdf(user: unknown): string | null {
  const u = user as {
    personalInformation?: { dateOfBirth?: string | null } | null;
    panCard?: { dateOfBirth?: string | null } | null;
    aadhaarCard?: { dateOfBirth?: string | null } | null;
  };
  const a =
    u.personalInformation?.dateOfBirth?.trim() ||
    u.panCard?.dateOfBirth?.trim() ||
    u.aadhaarCard?.dateOfBirth?.trim() ||
    "";
  return a || null;
}
