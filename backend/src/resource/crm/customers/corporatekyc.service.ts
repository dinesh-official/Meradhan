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
    correspondenceLine3: payload.correspondenceLine3 ?? undefined,
    correspondenceCity: payload.correspondenceCity ?? undefined,
    correspondenceDistrict: payload.correspondenceDistrict ?? undefined,
    correspondencePinCode: payload.correspondencePinCode ?? undefined,
    correspondenceState: payload.correspondenceState ?? undefined,
    correspondenceAddressProofCopyUrl:
      payload.correspondenceAddressProofCopyUrl ?? undefined,

    registeredFullAddress: payload.registeredFullAddress ?? undefined,
    registeredLine1: payload.registeredLine1 ?? undefined,
    registeredLine2: payload.registeredLine2 ?? undefined,
    registeredLine3: payload.registeredLine3 ?? undefined,
    registeredCity: payload.registeredCity ?? undefined,
    registeredDistrict: payload.registeredDistrict ?? undefined,
    registeredPinCode: payload.registeredPinCode ?? undefined,
    registeredState: payload.registeredState ?? undefined,
    registeredAddressProofCopyUrl:
      payload.registeredAddressProofCopyUrl ?? undefined,
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
    termsAndConditionsUrl: payload.termsAndConditionsUrl ?? undefined,
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
        panCopyFileUrl: d.panCopyFileUrl ?? undefined,
        aadharCopyFileUrl: d.aadharCopyFileUrl ?? undefined,
        passportPhotoFileUrl: d.passportPhotoFileUrl ?? undefined,
        pepDeclaration: d.pepDeclaration ?? undefined,
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
        panCopyFileUrl: (p as unknown as { panCopyFileUrl?: string }).panCopyFileUrl ?? undefined,
        aadharCopyFileUrl: (p as unknown as { aadharCopyFileUrl?: string }).aadharCopyFileUrl ?? undefined,
        passportPhotoFileUrl: (p as unknown as { passportPhotoFileUrl?: string }).passportPhotoFileUrl ?? undefined,
        pepDeclaration: (p as unknown as { pepDeclaration?: string }).pepDeclaration ?? undefined,
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
        panCopyFileUrl:
          (s as unknown as { panCopyFileUrl?: string }).panCopyFileUrl ?? undefined,
        aadharCopyFileUrl:
          (s as unknown as { aadharCopyFileUrl?: string }).aadharCopyFileUrl ?? undefined,
        passportPhotoFileUrl:
          (s as unknown as { passportPhotoFileUrl?: string }).passportPhotoFileUrl ?? undefined,
        pepDeclaration:
          (s as unknown as { pepDeclaration?: string }).pepDeclaration ?? undefined,
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
        correspondenceLine3: payload.correspondenceLine3 ?? undefined,
        correspondenceCity: payload.correspondenceCity ?? undefined,
        correspondenceDistrict: payload.correspondenceDistrict ?? undefined,
        correspondencePinCode: payload.correspondencePinCode ?? undefined,
        correspondenceState: payload.correspondenceState ?? undefined,
        correspondenceAddressProofCopyUrl:
          payload.correspondenceAddressProofCopyUrl ?? undefined,

        registeredFullAddress: payload.registeredFullAddress ?? undefined,
        registeredLine1: payload.registeredLine1 ?? undefined,
        registeredLine2: payload.registeredLine2 ?? undefined,
        registeredLine3: payload.registeredLine3 ?? undefined,
        registeredCity: payload.registeredCity ?? undefined,
        registeredDistrict: payload.registeredDistrict ?? undefined,
        registeredPinCode: payload.registeredPinCode ?? undefined,
        registeredState: payload.registeredState ?? undefined,
        registeredAddressProofCopyUrl:
          payload.registeredAddressProofCopyUrl ?? undefined,
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
        termsAndConditionsUrl: payload.termsAndConditionsUrl ?? undefined,
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
            panCopyFileUrl: d.panCopyFileUrl ?? undefined,
            aadharCopyFileUrl: d.aadharCopyFileUrl ?? undefined,
            passportPhotoFileUrl: d.passportPhotoFileUrl ?? undefined,
            pepDeclaration: d.pepDeclaration ?? undefined,
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
            panCopyFileUrl: (p as unknown as { panCopyFileUrl?: string }).panCopyFileUrl ?? undefined,
            aadharCopyFileUrl: (p as unknown as { aadharCopyFileUrl?: string }).aadharCopyFileUrl ?? undefined,
            passportPhotoFileUrl: (p as unknown as { passportPhotoFileUrl?: string }).passportPhotoFileUrl ?? undefined,
            pepDeclaration: (p as unknown as { pepDeclaration?: string }).pepDeclaration ?? undefined,
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
            panCopyFileUrl:
              (s as unknown as { panCopyFileUrl?: string }).panCopyFileUrl ?? undefined,
            aadharCopyFileUrl:
              (s as unknown as { aadharCopyFileUrl?: string }).aadharCopyFileUrl ?? undefined,
            passportPhotoFileUrl:
              (s as unknown as { passportPhotoFileUrl?: string }).passportPhotoFileUrl ?? undefined,
            pepDeclaration:
              (s as unknown as { pepDeclaration?: string }).pepDeclaration ?? undefined,
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

  private mapToResponse(row: any) {
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
      correspondenceLine3: row.correspondenceLine3 ?? undefined,
      correspondenceCity: row.correspondenceCity ?? undefined,
      correspondenceDistrict: row.correspondenceDistrict ?? undefined,
      correspondencePinCode: row.correspondencePinCode ?? undefined,
      correspondenceState: row.correspondenceState ?? undefined,
      correspondenceAddressProofCopyUrl:
        row.correspondenceAddressProofCopyUrl ?? undefined,
      registeredFullAddress: row.registeredFullAddress ?? undefined,
      registeredLine1: row.registeredLine1 ?? undefined,
      registeredLine2: row.registeredLine2 ?? undefined,
      registeredLine3: row.registeredLine3 ?? undefined,
      registeredCity: row.registeredCity ?? undefined,
      registeredDistrict: row.registeredDistrict ?? undefined,
      registeredPinCode: row.registeredPinCode ?? undefined,
      registeredState: row.registeredState ?? undefined,
      registeredAddressProofCopyUrl:
        row.registeredAddressProofCopyUrl ?? undefined,
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
      termsAndConditionsUrl: row.termsAndConditionsUrl ?? undefined,
      fatcaApplicable: row.fatcaApplicable,
      fatcaEntityName: row.fatcaEntityName ?? undefined,
      fatcaCountryOfIncorporation: row.fatcaCountryOfIncorporation ?? undefined,
      fatcaEntityType: row.fatcaEntityType ?? undefined,
      fatcaClassification: row.fatcaClassification ?? undefined,
      giin: row.giin ?? undefined,
      taxResidencyOfEntity: row.taxResidencyOfEntity ?? undefined,
      declarationByAuthorisedSignatory: row.declarationByAuthorisedSignatory,
      bankAccounts: (row.bankAccounts as any[]).map((a: any) => ({
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
      dematAccounts: (row.dematAccounts as any[]).map((d: any) => ({
        id: d.id,
        depository: d.depository,
        accountType: d.accountType ?? undefined,
        dpId: d.dpId,
        clientId: d.clientId,
        accountHolderName: d.accountHolderName,
        dematProofFileUrl: d.dematProofFileUrl ?? undefined,
        isPrimary: d.isPrimary,
      })),
      directors: (row.directors as any[]).map((d: any) => ({
        id: d.id,
        fullName: d.fullName,
        pan: d.pan ?? undefined,
        panCopyFileUrl: d.panCopyFileUrl ?? undefined,
        aadharCopyFileUrl: d.aadharCopyFileUrl ?? undefined,
        passportPhotoFileUrl: d.passportPhotoFileUrl ?? undefined,
        pepDeclaration: d.pepDeclaration ?? undefined,
        designation: d.designation ?? undefined,
        din: d.din ?? undefined,
        email: d.email ?? undefined,
        mobile: d.mobile ?? undefined,
      })),
      promoters: (row.promoters as any[]).map((p: any) => ({
        id: p.id,
        fullName: p.fullName,
        pan: p.pan ?? undefined,
        panCopyFileUrl: p.panCopyFileUrl ?? undefined,
        aadharCopyFileUrl: p.aadharCopyFileUrl ?? undefined,
        passportPhotoFileUrl: p.passportPhotoFileUrl ?? undefined,
        pepDeclaration: p.pepDeclaration ?? undefined,
        designation: p.designation ?? undefined,
        din: p.din ?? undefined,
        email: p.email ?? undefined,
        mobile: p.mobile ?? undefined,
      })),
      authorisedSignatories: (row.authorisedSignatories as any[]).map((s: any) => ({
        id: s.id,
        fullName: s.fullName,
        pan: s.pan,
        panCopyFileUrl: s.panCopyFileUrl ?? undefined,
        aadharCopyFileUrl: s.aadharCopyFileUrl ?? undefined,
        passportPhotoFileUrl: s.passportPhotoFileUrl ?? undefined,
        pepDeclaration: s.pepDeclaration ?? undefined,
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
