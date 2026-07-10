/** Format YYYY-MM-DD (or ISO date prefix) to DD-MM-YYYY for KRA API */
export function toDdMmYyyy(iso: string | undefined): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("T")[0].split("-");
  return [d, m, y].filter(Boolean).join("-");
}
