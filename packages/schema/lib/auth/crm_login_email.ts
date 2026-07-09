/** Domains allowed to sign in to the CRM (OTP login). */
export const CRM_LOGIN_ALLOWED_EMAIL_DOMAINS = [
  "meradhan.co",
  "absolutedata.ai",
] as const;

export type CrmLoginAllowedEmailDomain =
  (typeof CRM_LOGIN_ALLOWED_EMAIL_DOMAINS)[number];

export function getCrmLoginEmailDomain(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0 || at === trimmed.length - 1) return null;
  return trimmed.slice(at + 1);
}

export function isCrmLoginEmailDomainAllowed(email: string): boolean {
  const domain = getCrmLoginEmailDomain(email);
  if (!domain) return false;
  return (CRM_LOGIN_ALLOWED_EMAIL_DOMAINS as readonly string[]).includes(
    domain,
  );
}
