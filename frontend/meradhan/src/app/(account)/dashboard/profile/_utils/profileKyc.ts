import type { GetCustomerResponseById } from "@root/apiGateway";

type KycStatus = GetCustomerResponseById["responseData"]["kycStatus"];

export function canAccessKycSections(kycStatus: KycStatus): boolean {
  return (
    kycStatus === "VERIFIED" ||
    kycStatus === "RE_KYC" ||
    kycStatus === "UNDER_REVIEW"
  );
}

export function canEditKycSections(kycStatus: KycStatus): boolean {
  return kycStatus === "VERIFIED";
}
