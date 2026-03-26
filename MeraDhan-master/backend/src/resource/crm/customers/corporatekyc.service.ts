import type { CreateCorporateKycPayload } from "@root/schema";
import { db } from "@core/database/database";
import { CorporateKycRepo } from "./corporatekyc.repo";

function parseDate(s: string | undefined): Date | undefined {
  if (!s) return undefined;
  const d = new Date(s);
  return isNaN(d.getTime()) ? undefined : d;
}

function mapPayloadToPrismaCreate(customerId: number, payload: CreateCorporateKycPayload) {
  return {
    entityName: payload.entityName,
    dateOfCommencementOfBusiness: parseDate(payload.dateOfCommencementOfBusiness),
    countryOfIncorporation: payload.countryOfIncorporation ?? undefined,
    panCopyFileUrl: payload.panCopyFileUrl ?? undefined,
    entityConstitutionType: payload.entityConstitutionType ?? undefined,
    otherConstitutionType: payload.otherConstitutionType ?? undefined,
    dateOfIncorporation: parseDate(payload.dateOfIncorporation),
    placeOfIncorporation: payload.placeOfIncorporation ?? undefined,
    panNumber: payload.panNumber || undefined,
    cinOrRegistrationNumber: payload.cinOrRegistrationNumber ?? undefined,
    correspondenceFullAddress: payload.correspondenceFullAddress ?? undefined,
    correspondenceLine1: payload.correspondenceLine1 ?? undefined,
    correspondenceLine2: payload.correspondenceLine2 ?? undefined,
    correspondenceCity: payload.correspondenceCity ?? undefined,
    correspondenceDistrict: payload.correspondenceDistrict ?? undefined,
    correspondencePinCode: payload.correspondencePinCode ?? undefined,
    correspondenceState: payload.correspondenceState ?? undefined,
    balanceSheetCopyUrl: payload.balanceSheetCopyUrl ?? undefined,
    certificateOfIncorporationUrl: payload.certificateOfIncorporationUrl ?? undefined,
    memorandumCopyUrl: payload.memorandumCopyUrl ?? undefined,
    boardResolutionCopyUrl: payload.boardResolutionCopyUrl ?? undefined,
    gstCopyUrl: payload.gstCopyUrl ?? undefined,
    clientMasterHoldingCopyUrl: payload.clientMasterHoldingCopyUrl ?? undefined,
    annualIncome: payload.annualIncome ?? undefined,
    shareHoldingPatternCopyUrl: payload.shareHoldingPatternCopyUrl ?? undefined,
    certificateOfCommencementOfBizUrl:
      payload.certificateOfCommencementOfBizUrl ?? undefined,
    articlesOfAssociationUrl: payload.articlesOfAssociationUrl ?? undefined,
    gstNumber: payload.gstNumber ?? undefined,
    directorsListCopyUrl: payload.directorsListCopyUrl ?? undefined,
    powerOfAttorneyCopyUrl: payload.powerOfAttorneyCopyUrl ?? undefined,
    documentsType: payload.documentsType ?? undefined,
    fatcaApplicable: payload.fatcaApplicable ?? false,
    fatcaEntityName: payload.fatcaEntityName ?? undefined,
    fatcaCountryOfIncorporation: payload.fatcaCountryOfIncorporation ?? undefined,
    fatcaEntityType: payload.fatcaEntityType ?? undefined,
    fatcaClassification: payload.fatcaClassification ?? undefined,
    giin: payload.giin ?? undefined,
    taxResidencyOfEntity: payload.taxResidencyOfEntity ?? undefined,
    declarationByAuthorisedSignatory:
      payload.declarationByAuthorisedSignatory ?? false,
    customerProfileDataModel: { connect: { id: customerId } },
    bankAccounts: {
      create: (payload.bankAccounts ?? []).map((acc) => ({
        accountHolderName: acc.accountHolderName,
        accountNumber: acc.accountNumber,
        branch: acc.branch ?? undefined,
        bankName: acc.bankName,
        ifscCode: acc.ifscCode,
        bankProofFileUrls: (acc.bankProofFileUrls ?? []) as unknown as object,
        isPrimaryAccount: acc.isPrimaryAccount ?? false,
      })),
    },
    dematAccounts: {
      create: (payload.dematAccounts ?? []).map((d) => ({
        depository: d.depository,
        accountType: d.accountType ?? undefined,
        dpId: d.dpId,
        clientId: d.clientId,
        accountHolderName: d.accountHolderName,
        dematProofFileUrl: d.dematProofFileUrl ?? undefined,
        isPrimary: d.isPrimary ?? false,
      })),
    },
    directors: {
      create: (payload.directors ?? []).map((d) => ({
        fullName: d.fullName,
        pan: d.pan ?? undefined,
        designation: d.designation ?? undefined,
        din: d.din ?? undefined,
        email: d.email || undefined,
        mobile: d.mobile ?? undefined,
      })),
    },
    promoters: {
      create: (payload.promoters ?? []).map((p) => ({
        fullName: p.fullName,
        pan: p.pan ?? undefined,
        designation: p.designation ?? undefined,
        din: p.din ?? undefined,
        email: p.email || undefined,
        mobile: p.mobile ?? undefined,
      })),
    },
    authorisedSignatories: {
      create: (payload.authorisedSignatories ?? []).map((s) => ({
        fullName: s.fullName,
        pan: s.pan,
        designation: s.designation ?? undefined,
        din: s.din ?? undefined,
        email: s.email,
        mobile: s.mobile ?? undefined,
      })),
    },
  };
}

export class CorporateKycService {
  constructor(private repo: CorporateKycRepo) {}

  async getByCustomerId(customerId: number) {
    await this.repo.ensureCustomerExists(customerId);
    const data = await this.repo.findByCustomerId(customerId);
    if (!data) return null;
    return this.mapToResponse(data);
  }

  async save(customerId: number, payload: CreateCorporateKycPayload) {
    await this.repo.ensureCustomerExists(customerId);
    const existing = await this.repo.findByCustomerId(customerId);

    if (existing) {
      const prisma = db.dataBase;
      const main = {
        entityName: payload.entityName,
        dateOfCommencementOfBusiness: parseDate(
          payload.dateOfCommencementOfBusiness
        ),
        countryOfIncorporation: payload.countryOfIncorporation ?? undefined,
        panCopyFileUrl: payload.panCopyFileUrl ?? undefined,
        entityConstitutionType: payload.entityConstitutionType ?? undefined,
        otherConstitutionType: payload.otherConstitutionType ?? undefined,
        dateOfIncorporation: parseDate(payload.dateOfIncorporation),
        placeOfIncorporation: payload.placeOfIncorporation ?? undefined,
        panNumber: payload.panNumber || undefined,
        cinOrRegistrationNumber: payload.cinOrRegistrationNumber ?? undefined,
        correspondenceFullAddress: payload.correspondenceFullAddress ?? undefined,
        correspondenceLine1: payload.correspondenceLine1 ?? undefined,
        correspondenceLine2: payload.correspondenceLine2 ?? undefined,
        correspondenceCity: payload.correspondenceCity ?? undefined,
        correspondenceDistrict: payload.correspondenceDistrict ?? undefined,
        correspondencePinCode: payload.correspondencePinCode ?? undefined,
        correspondenceState: payload.correspondenceState ?? undefined,
        balanceSheetCopyUrl: payload.balanceSheetCopyUrl ?? undefined,
        certificateOfIncorporationUrl:
          payload.certificateOfIncorporationUrl ?? undefined,
        memorandumCopyUrl: payload.memorandumCopyUrl ?? undefined,
        boardResolutionCopyUrl: payload.boardResolutionCopyUrl ?? undefined,
        gstCopyUrl: payload.gstCopyUrl ?? undefined,
        clientMasterHoldingCopyUrl:
          payload.clientMasterHoldingCopyUrl ?? undefined,
        annualIncome: payload.annualIncome ?? undefined,
        shareHoldingPatternCopyUrl:
          payload.shareHoldingPatternCopyUrl ?? undefined,
        certificateOfCommencementOfBizUrl:
          payload.certificateOfCommencementOfBizUrl ?? undefined,
        articlesOfAssociationUrl: payload.articlesOfAssociationUrl ?? undefined,
        gstNumber: payload.gstNumber ?? undefined,
        directorsListCopyUrl: payload.directorsListCopyUrl ?? undefined,
        powerOfAttorneyCopyUrl: payload.powerOfAttorneyCopyUrl ?? undefined,
        documentsType: payload.documentsType ?? undefined,
        fatcaApplicable: payload.fatcaApplicable ?? false,
        fatcaEntityName: payload.fatcaEntityName ?? undefined,
        fatcaCountryOfIncorporation:
          payload.fatcaCountryOfIncorporation ?? undefined,
        fatcaEntityType: payload.fatcaEntityType ?? undefined,
        fatcaClassification: payload.fatcaClassification ?? undefined,
        giin: payload.giin ?? undefined,
        taxResidencyOfEntity: payload.taxResidencyOfEntity ?? undefined,
        declarationByAuthorisedSignatory:
          payload.declarationByAuthorisedSignatory ?? false,
        bankAccounts: {
          deleteMany: {},
          create: (payload.bankAccounts ?? []).map((acc) => ({
            accountHolderName: acc.accountHolderName,
            accountNumber: acc.accountNumber,
            branch: acc.branch ?? undefined,
            bankName: acc.bankName,
            ifscCode: acc.ifscCode,
            bankProofFileUrls: (acc.bankProofFileUrls ?? []) as unknown as object,
            isPrimaryAccount: acc.isPrimaryAccount ?? false,
          })),
        },
        dematAccounts: {
          deleteMany: {},
          create: (payload.dematAccounts ?? []).map((d) => ({
            depository: d.depository,
            accountType: d.accountType ?? undefined,
            dpId: d.dpId,
            clientId: d.clientId,
            accountHolderName: d.accountHolderName,
            dematProofFileUrl: d.dematProofFileUrl ?? undefined,
            isPrimary: d.isPrimary ?? false,
          })),
        },
        directors: {
          deleteMany: {},
          create: (payload.directors ?? []).map((d) => ({
            fullName: d.fullName,
            pan: d.pan ?? undefined,
            designation: d.designation ?? undefined,
            din: d.din ?? undefined,
            email: d.email || undefined,
            mobile: d.mobile ?? undefined,
          })),
        },
        promoters: {
          deleteMany: {},
          create: (payload.promoters ?? []).map((p) => ({
            fullName: p.fullName,
            pan: p.pan ?? undefined,
            designation: p.designation ?? undefined,
            din: p.din ?? undefined,
            email: p.email || undefined,
            mobile: p.mobile ?? undefined,
          })),
        },
        authorisedSignatories: {
          deleteMany: {},
          create: (payload.authorisedSignatories ?? []).map((s) => ({
            fullName: s.fullName,
            pan: s.pan,
            designation: s.designation ?? undefined,
            din: s.din ?? undefined,
            email: s.email,
            mobile: s.mobile ?? undefined,
          })),
        },
      };
      const updated = await prisma.corporateKycModel.update({
        where: { id: existing.id },
        data: main,
        include: {
          bankAccounts: true,
          dematAccounts: true,
          directors: true,
          promoters: true,
          authorisedSignatories: true,
        },
      });
      return this.mapToResponse(updated);
    }

    const createInput = mapPayloadToPrismaCreate(customerId, payload);
    const created = await db.dataBase.corporateKycModel.create({
      data: createInput,
      include: {
        bankAccounts: true,
        dematAccounts: true,
        directors: true,
        promoters: true,
        authorisedSignatories: true,
      },
    });
    return this.mapToResponse(created);
  }

  private mapToResponse(row: {
    id: number;
    customerProfileDataModelId: number;
    entityName: string;
    dateOfCommencementOfBusiness: Date | null;
    countryOfIncorporation: string | null;
    panCopyFileUrl: string | null;
    entityConstitutionType: string | null;
    otherConstitutionType: string | null;
    dateOfIncorporation: Date | null;
    placeOfIncorporation: string | null;
    panNumber: string | null;
    cinOrRegistrationNumber: string | null;
    correspondenceFullAddress: string | null;
    correspondenceLine1: string | null;
    correspondenceLine2: string | null;
    correspondenceCity: string | null;
    correspondenceDistrict: string | null;
    correspondencePinCode: string | null;
    correspondenceState: string | null;
    balanceSheetCopyUrl: string | null;
    certificateOfIncorporationUrl: string | null;
    memorandumCopyUrl: string | null;
    boardResolutionCopyUrl: string | null;
    gstCopyUrl: string | null;
    clientMasterHoldingCopyUrl: string | null;
    annualIncome: string | null;
    shareHoldingPatternCopyUrl: string | null;
    certificateOfCommencementOfBizUrl: string | null;
    articlesOfAssociationUrl: string | null;
    gstNumber: string | null;
    directorsListCopyUrl: string | null;
    powerOfAttorneyCopyUrl: string | null;
    documentsType: string | null;
    fatcaApplicable: boolean;
    fatcaEntityName: string | null;
    fatcaCountryOfIncorporation: string | null;
    fatcaEntityType: string | null;
    fatcaClassification: string | null;
    giin: string | null;
    taxResidencyOfEntity: string | null;
    declarationByAuthorisedSignatory: boolean;
    bankAccounts: Array<{
      id: number;
      accountHolderName: string;
      accountNumber: string;
      branch: string | null;
      bankName: string;
      ifscCode: string;
      bankProofFileUrls: unknown;
      isPrimaryAccount: boolean;
    }>;
    dematAccounts: Array<{
      id: number;
      depository: string;
      accountType: string | null;
      dpId: string;
      clientId: string;
      accountHolderName: string;
      dematProofFileUrl: string | null;
      isPrimary: boolean;
    }>;
    directors: Array<{
      id: number;
      fullName: string;
      pan: string | null;
      designation: string | null;
      din: string | null;
      email: string | null;
      mobile: string | null;
    }>;
    promoters: Array<{
      id: number;
      fullName: string;
      pan: string | null;
      designation: string | null;
      din: string | null;
      email: string | null;
      mobile: string | null;
    }>;
    authorisedSignatories: Array<{
      id: number;
      fullName: string;
      pan: string;
      designation: string | null;
      din: string | null;
      email: string;
      mobile: string | null;
    }>;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: row.id,
      customerId: row.customerProfileDataModelId,
      entityName: row.entityName,
      dateOfCommencementOfBusiness: row.dateOfCommencementOfBusiness?.toISOString(),
      countryOfIncorporation: row.countryOfIncorporation ?? undefined,
      panCopyFileUrl: row.panCopyFileUrl ?? undefined,
      entityConstitutionType: row.entityConstitutionType ?? undefined,
      otherConstitutionType: row.otherConstitutionType ?? undefined,
      dateOfIncorporation: row.dateOfIncorporation?.toISOString(),
      placeOfIncorporation: row.placeOfIncorporation ?? undefined,
      panNumber: row.panNumber ?? undefined,
      cinOrRegistrationNumber: row.cinOrRegistrationNumber ?? undefined,
      correspondenceFullAddress: row.correspondenceFullAddress ?? undefined,
      correspondenceLine1: row.correspondenceLine1 ?? undefined,
      correspondenceLine2: row.correspondenceLine2 ?? undefined,
      correspondenceCity: row.correspondenceCity ?? undefined,
      correspondenceDistrict: row.correspondenceDistrict ?? undefined,
      correspondencePinCode: row.correspondencePinCode ?? undefined,
      correspondenceState: row.correspondenceState ?? undefined,
      balanceSheetCopyUrl: row.balanceSheetCopyUrl ?? undefined,
      certificateOfIncorporationUrl:
        row.certificateOfIncorporationUrl ?? undefined,
      memorandumCopyUrl: row.memorandumCopyUrl ?? undefined,
      boardResolutionCopyUrl: row.boardResolutionCopyUrl ?? undefined,
      gstCopyUrl: row.gstCopyUrl ?? undefined,
      clientMasterHoldingCopyUrl: row.clientMasterHoldingCopyUrl ?? undefined,
      annualIncome: row.annualIncome ?? undefined,
      shareHoldingPatternCopyUrl: row.shareHoldingPatternCopyUrl ?? undefined,
      certificateOfCommencementOfBizUrl:
        row.certificateOfCommencementOfBizUrl ?? undefined,
      articlesOfAssociationUrl: row.articlesOfAssociationUrl ?? undefined,
      gstNumber: row.gstNumber ?? undefined,
      directorsListCopyUrl: row.directorsListCopyUrl ?? undefined,
      powerOfAttorneyCopyUrl: row.powerOfAttorneyCopyUrl ?? undefined,
      documentsType: row.documentsType ?? undefined,
      fatcaApplicable: row.fatcaApplicable,
      fatcaEntityName: row.fatcaEntityName ?? undefined,
      fatcaCountryOfIncorporation: row.fatcaCountryOfIncorporation ?? undefined,
      fatcaEntityType: row.fatcaEntityType ?? undefined,
      fatcaClassification: row.fatcaClassification ?? undefined,
      giin: row.giin ?? undefined,
      taxResidencyOfEntity: row.taxResidencyOfEntity ?? undefined,
      declarationByAuthorisedSignatory: row.declarationByAuthorisedSignatory,
      bankAccounts: row.bankAccounts.map((a) => ({
        id: a.id,
        accountHolderName: a.accountHolderName,
        accountNumber: a.accountNumber,
        branch: a.branch ?? undefined,
        bankName: a.bankName,
        ifscCode: a.ifscCode,
        bankProofFileUrls: Array.isArray(a.bankProofFileUrls)
          ? a.bankProofFileUrls
          : [],
        isPrimaryAccount: a.isPrimaryAccount,
      })),
      dematAccounts: row.dematAccounts.map((d) => ({
        id: d.id,
        depository: d.depository,
        accountType: d.accountType ?? undefined,
        dpId: d.dpId,
        clientId: d.clientId,
        accountHolderName: d.accountHolderName,
        dematProofFileUrl: d.dematProofFileUrl ?? undefined,
        isPrimary: d.isPrimary,
      })),
      directors: row.directors.map((d) => ({
        id: d.id,
        fullName: d.fullName,
        pan: d.pan ?? undefined,
        designation: d.designation ?? undefined,
        din: d.din ?? undefined,
        email: d.email ?? undefined,
        mobile: d.mobile ?? undefined,
      })),
      promoters: row.promoters.map((p) => ({
        id: p.id,
        fullName: p.fullName,
        pan: p.pan ?? undefined,
        designation: p.designation ?? undefined,
        din: p.din ?? undefined,
        email: p.email ?? undefined,
        mobile: p.mobile ?? undefined,
      })),
      authorisedSignatories: row.authorisedSignatories.map((s) => ({
        id: s.id,
        fullName: s.fullName,
        pan: s.pan,
        designation: s.designation ?? undefined,
        din: s.din ?? undefined,
        email: s.email,
        mobile: s.mobile ?? undefined,
      })),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
