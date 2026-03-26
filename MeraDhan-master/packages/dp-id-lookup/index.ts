import { findDpId } from "./nsdl";
import { findCdslDpId, findCdslDpByDpId } from "./cdsl";

/**
 * Resolve DP name from DP ID using NSDL (IN-prefix) or CDSL (numeric) lists.
 */
export function getDpName(dpId: string | null | undefined): string | undefined {
  if (!dpId || !String(dpId).trim()) return undefined;
  const id = String(dpId).trim();
  if (id.toUpperCase().startsWith("IN")) {
    return findDpId(id) ?? undefined;
  }
  return findCdslDpByDpId(id) ?? findCdslDpId(id) ?? findCdslDpId(id.padStart(8, "0")) ?? undefined;
}

export { findDpId } from "./nsdl";
export { findCdslDpId } from "./cdsl";
