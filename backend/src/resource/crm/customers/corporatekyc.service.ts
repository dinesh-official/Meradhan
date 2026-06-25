import type { CreateCorporateKycPayload } from "@root/schema";
import { db } from "@core/database/database";
import { AppError, HttpStatus } from "@utils/error/AppError";
import { CorporateKycRepo } from "./corporatekyc.repo";

function parseDate(s: string | undefined): Date | undefined {
  if (!s) return undefined;
  const d = new Date(s);
  return isNaN(d.getTime()) ? undefined : d;
}

/**
 * `true` when the linked customer is KYC-verified or KRA-verified. Bank/demat
 * account details are sealed, but proof file URLs may still be updated for
 * CBRICS attachment workflows.
 */
function isAccountsLocked(
  customer?: { kycStatus?: string | null; kraStatus?: string | null } | null,
): boolean {
  if (!customer) return false;
  const kyc = String(customer.kycStatus ?? "").trim().toUpperCase();
  const kra = String(customer.kraStatus ?? "").trim().toUpperCase();
  return kyc === "VERIFIED" || kra === "VERIFIED";
}

/**
 * Returns a stable, sorted signature for bank account identity fields only.
 */
function bankAccountsStructuralSignature(
  rows: ReadonlyArray<{
    accountHolderName?: string | null;
    accountNumber?: string | null;
    branch?: string | null;
    bankName?: string | null;
    ifscCode?: string | null;
    isPrimaryAccount?: boolean | null;
  }>,
): string {
  const norm = (v: unknown) => String(v ?? "").trim().toUpperCase();
  return rows
    .map((a) =>
      [
        norm(a.accountNumber),
        norm(a.ifscCode),
        norm(a.bankName),
        norm(a.accountHolderName),
        norm(a.branch),
        a.isPrimaryAccount ? "1" : "0",
      ].join("|"),
    )
    .sort()
    .join("\n");
}

/** Demat account identity fields only (proof URL excluded). */
function dematAccountsStructuralSignature(
  rows: ReadonlyArray<{
    depository?: string | null;
    accountType?: string | null;
    dpId?: string | null;
    clientId?: string | null;
    accountHolderName?: string | null;
    isPrimary?: boolean | null;
  }>,
): string {
  const norm = (v: unknown) => String(v ?? "").trim().toUpperCase();
  return rows
    .map((d) =>
      [
        norm(d.depository),
        norm(d.dpId),
        norm(d.clientId),
        norm(d.accountType),
        norm(d.accountHolderName),
        d.isPrimary ? "1" : "0",
      ].join("|"),
    )
    .sort()
    .join("\n");
}

function bankAccountMatchKey(row: {
  ifscCode?: string | null;
  accountNumber?: string | null;
}): string {
  const norm = (v: unknown) => String(v ?? "").trim().toUpperCase();
  return `${norm(row.ifscCode)}|${norm(row.accountNumber)}`;
}

function dematAccountMatchKey(row: {
  depository?: string | null;
  dpId?: string | null;
  clientId?: string | null;
}): string {
  const norm = (v: unknown) => String(v ?? "").trim().toUpperCase();
  return `${norm(row.depository)}|${norm(row.dpId)}|${norm(row.clientId)}`;
}

function findPayloadBank<
  T extends {
    id?: number;
    ifscCode?: string;
    accountNumber?: string;
  },
>(existing: { id: number; ifscCode: string; accountNumber: string }, payload: T[]): T | undefined {
  const byId = payload.find((p) => p.id === existing.id);
  if (byId) return byId;
  const key = bankAccountMatchKey(existing);
  return payload.find((p) => bankAccountMatchKey(p) === key);
}

function findPayloadDemat<
  T extends {
    id?: number;
    depository?: string;
    dpId?: string;
    clientId?: string;
  },
>(existing: {
  id: number;
  depository: string;
  dpId: string;
  clientId: string;
}, payload: T[]): T | undefined {
  const byId = payload.find((p) => p.id === existing.id);
  if (byId) return byId;
  const key = dematAccountMatchKey(existing);
  return payload.find((p) => dematAccountMatchKey(p) === key);
}

async function applyLockedAccountProofUpdates(
  existing: {
    bankAccounts: Array<{
      id: number;
      ifscCode: string;
      accountNumber: string;
    }>;
    dematAccounts: Array<{
      id: number;
      depository: string;
      dpId: string;
      clientId: string;
    }>;
  },
  payload: CreateCorporateKycPayload,
) {
  const bankStructuralExisting = bankAccountsStructuralSignature(
    existing.bankAccounts,
  );
  const bankStructuralPayload = bankAccountsStructuralSignature(
    payload.bankAccounts ?? [],
  );
  if (bankStructuralExisting !== bankStructuralPayload) {
    throw new AppError(
      "Verified customers: bank account details cannot be changed. Only bank proof files may be updated.",
      {
        code: "CORPORATE_KYC_BANK_LOCKED",
        statusCode: HttpStatus.FORBIDDEN,
      },
    );
  }

  const dematStructuralExisting = dematAccountsStructuralSignature(
    existing.dematAccounts,
  );
  const dematStructuralPayload = dematAccountsStructuralSignature(
    payload.dematAccounts ?? [],
  );
  if (dematStructuralExisting !== dematStructuralPayload) {
    throw new AppError(
      "Verified customers: demat account details cannot be changed. Only demat proof files may be updated.",
      {
        code: "CORPORATE_KYC_DEMAT_LOCKED",
        statusCode: HttpStatus.FORBIDDEN,
      },
    );
  }

  const prisma = db.dataBase;
  const ops: Parameters<typeof prisma.$transaction>[0] extends (infer U)[]
    ? U[]
    : never = [];

  for (const row of existing.bankAccounts) {
    const incoming = findPayloadBank(row, payload.bankAccounts ?? []);
    if (!incoming) continue;
    ops.push(
      prisma.corporateKycBankAccountModel.update({
        where: { id: row.id },
        data: {
          bankProofFileUrls: (incoming.bankProofFileUrls ??
            []) as unknown as object,
        },
      }),
    );
  }

  for (const row of existing.dematAccounts) {
    const incoming = findPayloadDemat(row, payload.dematAccounts ?? []);
    if (!incoming) continue;
    ops.push(
      prisma.corporateKycDematAccountModel.update({
        where: { id: row.id },
        data: {
          dematProofFileUrl: incoming.dematProofFileUrl?.trim()
            ? incoming.dematProofFileUrl.trim()
            : null,
        },
      }),
    );
  }

  if (ops.length > 0) {
    await prisma.$transaction(ops);
  }
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
    correspondenceAddressProofType:
      (payload as unknown as { correspondenceAddressProofType?: string })
        .correspondenceAddressProofType ?? undefined,
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
    registeredAddressProofType:
      (payload as unknown as { registeredAddressProofType?: string })
        .registeredAddressProofType ?? undefined,
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
    existingKycFileUrl:
      (payload as unknown as { existingKycFileUrl?: string }).existingKycFileUrl ?? undefined,
    useExistingKycDeclarationUrl:
      (payload as unknown as { useExistingKycDeclarationUrl?: string })
        .useExistingKycDeclarationUrl ?? undefined,
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
    partners: {
      create: (payload.partners ?? []).map((p) => ({
        fullName: p.fullName,
        pan: p.pan ?? undefined,
        panCopyFileUrl: p.panCopyFileUrl ?? undefined,
        aadharCopyFileUrl: p.aadharCopyFileUrl ?? undefined,
        passportPhotoFileUrl: p.passportPhotoFileUrl ?? undefined,
        pepDeclaration: p.pepDeclaration ?? undefined,
        designation: p.designation ?? undefined,
        din: p.din ?? undefined,
        email: p.email || undefined,
        mobile: p.mobile ?? undefined,
      })),
    },
    trustees: {
      create: (payload.trustees ?? []).map((t) => ({
        fullName: t.fullName,
        pan: t.pan ?? undefined,
        panCopyFileUrl: t.panCopyFileUrl ?? undefined,
        aadharCopyFileUrl: t.aadharCopyFileUrl ?? undefined,
        passportPhotoFileUrl: t.passportPhotoFileUrl ?? undefined,
        pepDeclaration: t.pepDeclaration ?? undefined,
        designation: t.designation ?? undefined,
        din: t.din ?? undefined,
        email: t.email || undefined,
        mobile: t.mobile ?? undefined,
      })),
    },
    authorisedSignatories: {
      create: (payload.authorisedSignatories ?? []).map((s) => ({
        fullName: s.fullName,
        pan: s.pan,
        signatureFileUrl:
          (s as unknown as { signatureFileUrl?: string }).signatureFileUrl ??
          undefined,
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
    const customer = await this.repo.ensureCustomerExists(customerId);
    const existing = await this.repo.findByCustomerId(customerId);

    if (existing) {
      // When the customer is KYC/KRA-verified, bank + demat account details
      // are sealed (already sent to NDML / CBRICS). Proof file URLs may still
      // be updated via `applyLockedAccountProofUpdates` after the main save.
      const locked = isAccountsLocked(customer);

      if (locked) {
        const banksStructuralDiffer =
          bankAccountsStructuralSignature(existing.bankAccounts ?? []) !==
          bankAccountsStructuralSignature(payload.bankAccounts ?? []);
        const dematsStructuralDiffer =
          dematAccountsStructuralSignature(existing.dematAccounts ?? []) !==
          dematAccountsStructuralSignature(payload.dematAccounts ?? []);
        if (banksStructuralDiffer || dematsStructuralDiffer) {
          throw new AppError(
            "Verified customers: bank/demat account details cannot be changed from this form. Only proof files may be updated.",
            {
              code: "CORPORATE_KYC_ACCOUNTS_LOCKED",
              statusCode: HttpStatus.FORBIDDEN,
            },
          );
        }
      }

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
        correspondenceAddressProofType:
          (payload as unknown as { correspondenceAddressProofType?: string })
            .correspondenceAddressProofType ?? undefined,
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
        registeredAddressProofType:
          (payload as unknown as { registeredAddressProofType?: string })
            .registeredAddressProofType ?? undefined,
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
        existingKycFileUrl:
          (payload as unknown as { existingKycFileUrl?: string })
            .existingKycFileUrl ?? undefined,
        useExistingKycDeclarationUrl:
          (payload as unknown as { useExistingKycDeclarationUrl?: string })
            .useExistingKycDeclarationUrl ?? undefined,
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
        // When locked, skip wipe-and-recreate; proof URLs are patched after
        // the main update. When unlocked, replace lists from the form.
        ...(locked
          ? {}
          : {
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
            }),
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
        partners: {
          deleteMany: {},
          create: (payload.partners ?? []).map((p) => ({
            fullName: p.fullName,
            pan: p.pan ?? undefined,
            panCopyFileUrl: p.panCopyFileUrl ?? undefined,
            aadharCopyFileUrl: p.aadharCopyFileUrl ?? undefined,
            passportPhotoFileUrl: p.passportPhotoFileUrl ?? undefined,
            pepDeclaration: p.pepDeclaration ?? undefined,
            designation: p.designation ?? undefined,
            din: p.din ?? undefined,
            email: p.email || undefined,
            mobile: p.mobile ?? undefined,
          })),
        },
        trustees: {
          deleteMany: {},
          create: (payload.trustees ?? []).map((t) => ({
            fullName: t.fullName,
            pan: t.pan ?? undefined,
            panCopyFileUrl: t.panCopyFileUrl ?? undefined,
            aadharCopyFileUrl: t.aadharCopyFileUrl ?? undefined,
            passportPhotoFileUrl: t.passportPhotoFileUrl ?? undefined,
            pepDeclaration: t.pepDeclaration ?? undefined,
            designation: t.designation ?? undefined,
            din: t.din ?? undefined,
            email: t.email || undefined,
            mobile: t.mobile ?? undefined,
          })),
        },
        authorisedSignatories: {
          deleteMany: {},
          create: (payload.authorisedSignatories ?? []).map((s) => ({
            fullName: s.fullName,
            pan: s.pan,
            signatureFileUrl:
              (s as unknown as { signatureFileUrl?: string }).signatureFileUrl ??
              undefined,
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
          partners: true,
          trustees: true,
          authorisedSignatories: true,
        },
      });

      if (locked) {
        await applyLockedAccountProofUpdates(existing, payload);
        const refreshed = await prisma.corporateKycModel.findUnique({
          where: { id: existing.id },
          include: {
            bankAccounts: true,
            dematAccounts: true,
            directors: true,
            promoters: true,
            partners: true,
            trustees: true,
            authorisedSignatories: true,
            customerProfileDataModel: {
              select: { kycStatus: true, kraStatus: true },
            },
          },
        });
        return this.mapToResponse(refreshed ?? updated);
      }

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
        partners: true,
        trustees: true,
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
      correspondenceAddressProofType:
        row.correspondenceAddressProofType ?? undefined,
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
      registeredAddressProofType:
        row.registeredAddressProofType ?? undefined,
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
      existingKycFileUrl: row.existingKycFileUrl ?? undefined,
      useExistingKycDeclarationUrl: row.useExistingKycDeclarationUrl ?? undefined,
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
      partners: (row.partners as any[] | undefined ?? []).map((p: any) => ({
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
      trustees: (row.trustees as any[] | undefined ?? []).map((t: any) => ({
        id: t.id,
        fullName: t.fullName,
        pan: t.pan ?? undefined,
        panCopyFileUrl: t.panCopyFileUrl ?? undefined,
        aadharCopyFileUrl: t.aadharCopyFileUrl ?? undefined,
        passportPhotoFileUrl: t.passportPhotoFileUrl ?? undefined,
        pepDeclaration: t.pepDeclaration ?? undefined,
        designation: t.designation ?? undefined,
        din: t.din ?? undefined,
        email: t.email ?? undefined,
        mobile: t.mobile ?? undefined,
      })),
      authorisedSignatories: (row.authorisedSignatories as any[]).map((s: any) => ({
        id: s.id,
        fullName: s.fullName,
        pan: s.pan,
        signatureFileUrl: s.signatureFileUrl ?? undefined,
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
      // Customer verification snapshot. The CRM uses these (and the derived
      // `isAccountsLocked` flag) to gate bank/demat editing in the form.
      kycStatus: row.customerProfileDataModel?.kycStatus ?? null,
      kraStatus: row.customerProfileDataModel?.kraStatus ?? null,
      isAccountsLocked: isAccountsLocked(row.customerProfileDataModel ?? null),
      // S3 URL of the most recently generated corporate KYC PDF (set by
      // `setLastGeneratedPdf` after the CRM "Generate" action) + the
      // wall-clock timestamp of that generation. Both `null` until the
      // first generation runs.
      lastGeneratedPdfUrl: row.lastGeneratedPdfUrl ?? null,
      lastGeneratedPdfAt: row.lastGeneratedPdfAt
        ? row.lastGeneratedPdfAt.toISOString()
        : null,
      lastPdfPayload: row.lastPdfPayload ?? null,
      lastPdfPayloadAt: row.lastPdfPayloadAt
        ? row.lastPdfPayloadAt.toISOString()
        : null,
    };
  }

  /**
   * Records the S3 location of the most recently generated 19-page
   * corporate KYC PDF. The CRM uploads the rendered blob to `/files/upload`
   * (which returns an S3 location), then calls this so the URL is persisted
   * on the corporate KYC row and surfaced as "Download last PDF".
   *
   * Throws when the customer doesn't exist or hasn't started corporate KYC.
   */
  async setLastGeneratedPdf(customerId: number, fileUrl: string) {
    await this.repo.ensureCustomerExists(customerId);
    const existing = await this.repo.findByCustomerId(customerId);
    if (!existing) {
      throw new AppError("Corporate KYC not found for this customer.", {
        code: "CORPORATE_KYC_NOT_FOUND",
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const trimmed = fileUrl.trim();
    if (!trimmed) {
      throw new AppError("File URL is required", {
        code: "CORPORATE_KYC_PDF_URL_REQUIRED",
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    const updated = await db.dataBase.corporateKycModel.update({
      where: { id: existing.id },
      data: {
        lastGeneratedPdfUrl: trimmed,
        lastGeneratedPdfAt: new Date(),
      },
      select: { lastGeneratedPdfUrl: true, lastGeneratedPdfAt: true },
    });
    return {
      lastGeneratedPdfUrl: updated.lastGeneratedPdfUrl ?? null,
      lastGeneratedPdfAt: updated.lastGeneratedPdfAt
        ? updated.lastGeneratedPdfAt.toISOString()
        : null,
    };
  }

  /**
   * Persists the CRM PDF editor JSON payload on the corporate KYC row so
   * operators can resume edits across sessions without re-mapping from CRM.
   */
  async setLastPdfPayload(customerId: number, payload: unknown) {
    await this.repo.ensureCustomerExists(customerId);
    const existing = await this.repo.findByCustomerId(customerId);
    if (!existing) {
      throw new AppError("Corporate KYC not found for this customer.", {
        code: "CORPORATE_KYC_NOT_FOUND",
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    if (
      payload === null ||
      payload === undefined ||
      (typeof payload === "object" &&
        !Array.isArray(payload) &&
        Object.keys(payload as object).length === 0)
    ) {
      throw new AppError("PDF form payload is required.", {
        code: "CORPORATE_KYC_PDF_PAYLOAD_REQUIRED",
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    if (typeof payload !== "object" || Array.isArray(payload)) {
      throw new AppError("PDF form payload must be a JSON object.", {
        code: "CORPORATE_KYC_PDF_PAYLOAD_INVALID",
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const updated = await db.dataBase.corporateKycModel.update({
      where: { id: existing.id },
      data: {
        lastPdfPayload: payload as object,
        lastPdfPayloadAt: new Date(),
      },
      select: { lastPdfPayload: true, lastPdfPayloadAt: true },
    });

    return {
      lastPdfPayload: updated.lastPdfPayload ?? null,
      lastPdfPayloadAt: updated.lastPdfPayloadAt
        ? updated.lastPdfPayloadAt.toISOString()
        : null,
    };
  }
}
