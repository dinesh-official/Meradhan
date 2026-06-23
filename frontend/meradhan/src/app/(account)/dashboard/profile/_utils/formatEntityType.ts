const ENTITY_CONSTITUTION_LABELS: Record<string, string> = {
  PRIVATE_LIMITED: "Private Limited",
  PUBLIC_LIMITED: "Public Limited",
  OPC: "OPC",
  LLP: "LLP",
  PARTNERSHIP: "Partnership",
  TRUST: "Trust",
  HUF: "HUF",
  OTHER: "Other",
};

export function formatEntityConstitutionType(
  type?: string | null,
  other?: string | null,
): string {
  if (!type) return "--";
  if (type === "OTHER" && other) return other;
  return ENTITY_CONSTITUTION_LABELS[type] ?? type;
}
