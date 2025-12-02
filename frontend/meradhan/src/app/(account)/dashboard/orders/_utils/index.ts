import type { Order } from "@root/apiGateway";

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
    if (bondDetails.bondType) return bondDetails.bondType;
    if (bondDetails.type) return bondDetails.type;
    // Check if it's a primary market bond (usually new issues)
    if (bondDetails.isPrimary !== undefined) {
      return bondDetails.isPrimary ? "Primary" : "Secondary";
    }
  }
  // Default to Secondary as most bonds are secondary market
  return "Secondary";
}

export function getIssuerCode(bondDetails: Order["bondDetails"]): string {
  if (bondDetails && typeof bondDetails === "object") {
    if (bondDetails.issuerCode) return bondDetails.issuerCode;
    if (bondDetails.issuer?.code) return bondDetails.issuer.code;
    if (bondDetails.issuer?.shortName) return bondDetails.issuer.shortName;
  }
  return "";
}
