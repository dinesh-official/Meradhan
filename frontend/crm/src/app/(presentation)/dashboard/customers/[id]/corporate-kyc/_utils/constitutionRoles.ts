/**
 * Which governance sections should render for a given corporate
 * constitution type. Used by both the editable Corporate KYC form and the
 * read-only profile view so the UI stays in lockstep.
 *
 * Mapping (per business spec):
 *   PRIVATE_LIMITED → Directors + Promoters
 *   PUBLIC_LIMITED  → Directors + Promoters
 *   OPC             → Directors only
 *   LLP             → Partners only
 *   PARTNERSHIP     → Partners only
 *   TRUST           → Trustees only
 *   OTHER / blank   → show everything so the operator can choose
 *
 * Authorised Signatories are unconditional and rendered alongside, not
 * gated by this helper.
 */
export type ConstitutionRoles = {
  directors: boolean;
  partners: boolean;
  trustees: boolean;
  promoters: boolean;
};

const ROLES_BY_CONSTITUTION: Record<string, ConstitutionRoles> = {
  PRIVATE_LIMITED: { directors: true,  partners: false, trustees: false, promoters: true  },
  PUBLIC_LIMITED:  { directors: true,  partners: false, trustees: false, promoters: true  },
  OPC:             { directors: true,  partners: false, trustees: false, promoters: false },
  LLP:             { directors: false, partners: true,  trustees: false, promoters: false },
  PARTNERSHIP:     { directors: false, partners: true,  trustees: false, promoters: false },
  TRUST:           { directors: false, partners: false, trustees: true,  promoters: false },
};

/**
 * Fallback (used for "OTHER" and the blank initial form state): expose every
 * section so the operator isn't blocked from entering data while the
 * constitution type is still being chosen.
 */
const DEFAULT_ROLES: ConstitutionRoles = {
  directors: true,
  partners: true,
  trustees: false,
  promoters: true,
};

export function getConstitutionRoles(
  constitutionType: string | null | undefined,
): ConstitutionRoles {
  if (!constitutionType) return DEFAULT_ROLES;
  return ROLES_BY_CONSTITUTION[constitutionType] ?? DEFAULT_ROLES;
}
