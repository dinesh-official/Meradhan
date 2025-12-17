import type { Order } from "@root/apiGateway";

// Helper functions to safely extract values from Record<string, unknown>
const getBondDetailString = (
  bondDetails: Record<string, unknown>,
  key: string
): string | undefined => {
  const value = bondDetails[key];
  if (value === null || value === undefined) return undefined;
  return String(value);
};

const getBondDetailBoolean = (
  bondDetails: Record<string, unknown>,
  key: string
): boolean | undefined => {
  const value = bondDetails[key];
  if (value === null || value === undefined) return undefined;
  if (typeof value === "boolean") return value;
  return undefined;
};

const getBondDetailObject = (
  bondDetails: Record<string, unknown>,
  key: string
): Record<string, unknown> | undefined => {
  const value = bondDetails[key];
  if (value === null || value === undefined) return undefined;
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
};

export function getStatusDisplay(status: Order["status"]) {
  switch (status) {
    case "PENDING":
      return { text: "Pending", className: "text-orange-500" };
    case "SETTLED":
      return { text: "Settled", className: "text-green-600" };
    case "APPLIED":
      return { text: "Applied", className: "text-primary-600" };
    case "REJECTED":
      return { text: "Rejected", className: "text-red-500" };
    default:
      return { text: status, className: "text-gray-600" };
  }
}

export function getBondType(bondDetails: Order["bondDetails"]): string {
  // Try to extract bond type from bondDetails
  if (bondDetails && typeof bondDetails === "object") {
    const bondType = getBondDetailString(bondDetails, "bondType");
    if (bondType) return bondType;

    const type = getBondDetailString(bondDetails, "type");
    if (type) return type;

    // Check if it's a primary market bond (usually new issues)
    const isPrimary = getBondDetailBoolean(bondDetails, "isPrimary");
    if (isPrimary !== undefined) {
      return isPrimary ? "Primary" : "Secondary";
    }
  }
  // Default to Secondary as most bonds are secondary market
  return "Secondary";
}

export function getIssuerCode(bondDetails: Order["bondDetails"]): string {
  if (bondDetails && typeof bondDetails === "object") {
    const issuerCode = getBondDetailString(bondDetails, "issuerCode");
    if (issuerCode) return issuerCode;

    const issuer = getBondDetailObject(bondDetails, "issuer");
    if (issuer) {
      const code = getBondDetailString(issuer, "code");
      if (code) return code;

      const shortName = getBondDetailString(issuer, "shortName");
      if (shortName) return shortName;
    }
  }
  return "";
}
