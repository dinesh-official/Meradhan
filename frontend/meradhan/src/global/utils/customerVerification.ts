export const isKycVerified = (kycStatus?: string | null) =>
  kycStatus === "VERIFIED";

export const isKraVerified = (kraStatus?: string | null) =>
  String(kraStatus ?? "").trim().toUpperCase() === "VERIFIED";

export const canPlaceBondOrder = (profile: {
  kycStatus?: string | null;
  kraStatus?: string | null;
}) => isKycVerified(profile.kycStatus) && isKraVerified(profile.kraStatus);
