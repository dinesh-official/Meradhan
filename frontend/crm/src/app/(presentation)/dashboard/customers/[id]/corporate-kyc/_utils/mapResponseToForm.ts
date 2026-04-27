import type { CorporateKycResponse } from "@root/apiGateway";
import type { CreateCorporateKycPayload } from "@root/schema";

/** Normalize API date (ISO or YYYY-MM-DD) to YYYY-MM-DD for input type="date" */
function toDateOnly(value: string | undefined | null): string {
  if (value == null || value === "") return "";
  const s = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
}

function normalizePepDeclaration(
  v: unknown
): "PEP" | "RPEP" | "NA" | "NO" | undefined {
  if (v == null) return undefined;
  const s = String(v).trim().toUpperCase();
  if (s === "" || s === "NULL" || s === "UNDEFINED") return undefined;
  if (s === "YES") return "PEP";
  if (s === "PEP" || s === "RPEP") return s as "PEP" | "RPEP";
  if (s === "NA") return "NA";
  if (s === "NO") return "NA"; // legacy "NO" -> new "NA"
  return undefined;
}

export function mapCorporateKycResponseToForm(
  data: CorporateKycResponse
): CreateCorporateKycPayload {
  return {
    entityName: data.entityName,
    dateOfCommencementOfBusiness: toDateOnly(data.dateOfCommencementOfBusiness),
    countryOfIncorporation: data.countryOfIncorporation ?? "",
    panCopyFileUrl: data.panCopyFileUrl ?? "",
    entityConstitutionType: (data.entityConstitutionType as CreateCorporateKycPayload["entityConstitutionType"]) ?? undefined,
    otherConstitutionType: data.otherConstitutionType ?? "",
    dateOfIncorporation: toDateOnly(data.dateOfIncorporation),
    placeOfIncorporation: data.placeOfIncorporation ?? "",
    panNumber: data.panNumber ?? "",
    cinOrRegistrationNumber: data.cinOrRegistrationNumber ?? "",
    correspondenceFullAddress: data.correspondenceFullAddress ?? "",
    correspondenceLine1: data.correspondenceLine1 ?? "",
    correspondenceLine2: data.correspondenceLine2 ?? "",
    correspondenceLine3:
      (data as unknown as { correspondenceLine3?: string | null }).correspondenceLine3 ?? "",
    correspondenceCity: data.correspondenceCity ?? "",
    correspondenceDistrict: data.correspondenceDistrict ?? "",
    correspondencePinCode: data.correspondencePinCode ?? "",
    correspondenceState: data.correspondenceState ?? "",
    correspondenceAddressProofType:
      (data as unknown as { correspondenceAddressProofType?: string | null })
        .correspondenceAddressProofType ?? "",
    correspondenceAddressProofCopyUrl:
      (data as unknown as { correspondenceAddressProofCopyUrl?: string | null })
        .correspondenceAddressProofCopyUrl ?? "",
    registeredFullAddress:
      (data as unknown as { registeredFullAddress?: string | null }).registeredFullAddress ?? "",
    registeredLine1:
      (data as unknown as { registeredLine1?: string | null }).registeredLine1 ?? "",
    registeredLine2:
      (data as unknown as { registeredLine2?: string | null }).registeredLine2 ?? "",
    registeredLine3:
      (data as unknown as { registeredLine3?: string | null }).registeredLine3 ?? "",
    registeredCity:
      (data as unknown as { registeredCity?: string | null }).registeredCity ?? "",
    registeredDistrict:
      (data as unknown as { registeredDistrict?: string | null }).registeredDistrict ?? "",
    registeredPinCode:
      (data as unknown as { registeredPinCode?: string | null }).registeredPinCode ?? "",
    registeredState:
      (data as unknown as { registeredState?: string | null }).registeredState ?? "",
    registeredAddressProofType:
      (data as unknown as { registeredAddressProofType?: string | null })
        .registeredAddressProofType ?? "",
    registeredAddressProofCopyUrl:
      (data as unknown as { registeredAddressProofCopyUrl?: string | null })
        .registeredAddressProofCopyUrl ?? "",
    balanceSheetCopyUrl: data.balanceSheetCopyUrl ?? "",
    certificateOfIncorporationUrl: data.certificateOfIncorporationUrl ?? "",
    memorandumCopyUrl: data.memorandumCopyUrl ?? "",
    boardResolutionCopyUrl: data.boardResolutionCopyUrl ?? "",
    gstCopyUrl: data.gstCopyUrl ?? "",
    clientMasterHoldingCopyUrl: data.clientMasterHoldingCopyUrl ?? "",
    annualIncome: data.annualIncome ?? "",
    shareHoldingPatternCopyUrl: data.shareHoldingPatternCopyUrl ?? "",
    certificateOfCommencementOfBizUrl:
      data.certificateOfCommencementOfBizUrl ?? "",
    articlesOfAssociationUrl: data.articlesOfAssociationUrl ?? "",
    gstNumber: data.gstNumber ?? "",
    directorsListCopyUrl: data.directorsListCopyUrl ?? "",
    powerOfAttorneyCopyUrl: data.powerOfAttorneyCopyUrl ?? "",
    documentsType: data.documentsType ?? "",
    termsAndConditionsUrl:
      (data as unknown as { termsAndConditionsUrl?: string | null }).termsAndConditionsUrl ?? "",
    fatcaApplicable: data.fatcaApplicable,
    fatcaEntityName: data.fatcaEntityName ?? "",
    fatcaCountryOfIncorporation: data.fatcaCountryOfIncorporation ?? "",
    fatcaEntityType: (data.fatcaEntityType as CreateCorporateKycPayload["fatcaEntityType"]) ?? undefined,
    fatcaClassification: data.fatcaClassification ?? "",
    giin: data.giin ?? "",
    taxResidencyOfEntity: data.taxResidencyOfEntity ?? "",
    declarationByAuthorisedSignatory: data.declarationByAuthorisedSignatory,
    bankAccounts: (data.bankAccounts ?? []).map((a) => ({
      id: a.id,
      accountHolderName: a.accountHolderName,
      accountNumber: a.accountNumber,
      branch: a.branch ?? "",
      bankName: a.bankName,
      ifscCode: a.ifscCode,
      bankProofFileUrls: a.bankProofFileUrls ?? [],
      isPrimaryAccount: a.isPrimaryAccount,
    })),
    dematAccounts: (data.dematAccounts ?? []).map((d) => ({
      id: d.id,
      depository: d.depository as "NSDL" | "CDSL",
      accountType: d.accountType ?? "",
      dpId: d.dpId,
      clientId: d.clientId,
      accountHolderName: d.accountHolderName,
      dematProofFileUrl: d.dematProofFileUrl ?? "",
      isPrimary: d.isPrimary,
    })),
    directors: (data.directors ?? []).map((d) => ({
      id: d.id,
      fullName: d.fullName,
      pan: d.pan ?? "",
      panCopyFileUrl: d.panCopyFileUrl ?? "",
      aadharCopyFileUrl: d.aadharCopyFileUrl ?? "",
      passportPhotoFileUrl: d.passportPhotoFileUrl ?? "",
      pepDeclaration: normalizePepDeclaration(d.pepDeclaration),
      designation: d.designation ?? "",
      din: d.din ?? "",
      email: d.email ?? "",
      mobile: d.mobile ?? "",
    })),
    promoters: (data.promoters ?? []).map((p) => ({
      id: p.id,
      fullName: p.fullName,
      pan: p.pan ?? "",
      panCopyFileUrl: p.panCopyFileUrl ?? "",
      aadharCopyFileUrl: p.aadharCopyFileUrl ?? "",
      passportPhotoFileUrl: p.passportPhotoFileUrl ?? "",
      pepDeclaration: normalizePepDeclaration(p.pepDeclaration),
      designation: p.designation ?? "",
      din: p.din ?? "",
      email: p.email ?? "",
      mobile: p.mobile ?? "",
    })),
    authorisedSignatories: (data.authorisedSignatories ?? []).map((s) => ({
      id: s.id,
      fullName: s.fullName,
      pan: s.pan,
      signatureFileUrl: (s as unknown as { signatureFileUrl?: string | null }).signatureFileUrl ?? "",
      panCopyFileUrl: s.panCopyFileUrl ?? "",
      aadharCopyFileUrl: s.aadharCopyFileUrl ?? "",
      passportPhotoFileUrl: s.passportPhotoFileUrl ?? "",
      pepDeclaration: normalizePepDeclaration(s.pepDeclaration),
      designation: s.designation ?? "",
      din: s.din ?? "",
      email: s.email,
      mobile: s.mobile ?? "",
    })),
  };
}
