import type { CorporateKycResponse } from "@root/apiGateway";
import type { CreateCorporateKycPayload } from "@root/schema";

/** Normalize API date (ISO or YYYY-MM-DD) to YYYY-MM-DD for input type="date" */
function toDateOnly(value: string | undefined | null): string {
  if (value == null || value === "") return "";
  const s = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
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
    correspondenceCity: data.correspondenceCity ?? "",
    correspondenceDistrict: data.correspondenceDistrict ?? "",
    correspondencePinCode: data.correspondencePinCode ?? "",
    correspondenceState: data.correspondenceState ?? "",
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
      designation: d.designation ?? "",
      din: d.din ?? "",
      email: d.email ?? "",
      mobile: d.mobile ?? "",
    })),
    promoters: (data.promoters ?? []).map((p) => ({
      id: p.id,
      fullName: p.fullName,
      pan: p.pan ?? "",
      designation: p.designation ?? "",
      din: p.din ?? "",
      email: p.email ?? "",
      mobile: p.mobile ?? "",
    })),
    authorisedSignatories: (data.authorisedSignatories ?? []).map((s) => ({
      id: s.id,
      fullName: s.fullName,
      pan: s.pan,
      designation: s.designation ?? "",
      din: s.din ?? "",
      email: s.email,
      mobile: s.mobile ?? "",
    })),
  };
}
