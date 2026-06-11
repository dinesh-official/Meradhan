import { db } from "@core/database/database";
import { AppError } from "@utils/error/AppError";
import { CORPORATE_RISK_PROFILE_QUESTIONS } from "./corporateRiskProfile.constant";

/**
 * Hydrates the customer record (PAN, addresses, banks, demats, personal info,
 * FATCA flag) from the matching CorporateKycModel and flips the customer to
 * VERIFIED. Operates in **fill-missing-only** mode — never overwrites
 * existing customer-side values, and never drops corporate-side data.
 *
 * Triggered by the CRM "Verify & Activate Customer" button on the dedicated
 * KRA page. Idempotency is enforced by the kycStatus === "VERIFIED" check.
 */
export class CorporateKycVerifyService {
  async verifyCorporateCustomer(customerId: number, crmUserId: number | null) {
    // ── Load customer + every satellite + the corporate KYC bundle ──
    const customer = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerId },
      include: {
        panCard: true,
        currentAddress: true,
        permanentAddress: true,
        personalInformation: true,
        riskProfile: true,
        bankAccounts: true,
        dematAccounts: true,
        corporateKyc: {
          include: {
            bankAccounts: true,
            dematAccounts: true,
          },
        },
      },
    });

    if (!customer) {
      throw new AppError("Customer not found.", {
        code: "CUSTOMER_NOT_FOUND",
        statusCode: 404,
      });
    }
    if (customer.userType !== "CORPORATE") {
      throw new AppError("Not a corporate customer.", {
        code: "NOT_CORPORATE_CUSTOMER",
        statusCode: 400,
      });
    }
    const corporateKyc = customer.corporateKyc;
    if (!corporateKyc) {
      throw new AppError("Corporate KYC not filled.", {
        code: "CORPORATE_KYC_MISSING",
        statusCode: 400,
      });
    }
    if (customer.kycStatus === "VERIFIED") {
      throw new AppError("Customer is already verified.", {
        code: "ALREADY_VERIFIED",
        statusCode: 409,
      });
    }

    // ── Non-blocking pre-flight warnings ──
    const warnings: string[] = [];
    if (!corporateKyc.panNumber) warnings.push("Corporate PAN is missing.");
    if (!corporateKyc.entityName) warnings.push("Entity name is missing.");
    if (
      !corporateKyc.correspondenceLine1 ||
      !corporateKyc.correspondenceCity ||
      !corporateKyc.correspondenceState
    ) {
      warnings.push(
        "Correspondence address is incomplete (missing line1 / city / state).",
      );
    }
    if (!corporateKyc.bankAccounts.length) {
      warnings.push("No bank accounts captured on the corporate KYC.");
    }
    if (!corporateKyc.dematAccounts.length) {
      warnings.push("No demat accounts captured on the corporate KYC.");
    }
    const priorKraStatus = String(customer.kraStatus ?? "").trim().toUpperCase();
    if (priorKraStatus !== "VERIFIED") {
      warnings.push(
        `KRA is not yet VERIFIED for this customer (current: ${customer.kraStatus ?? "PENDING"}).`,
      );
    }

    const syncedSections: string[] = [];
    const skippedSections: string[] = [];

    // ── Helper: pick the corporate-KYC primary bank or fall back to row 0 ──
    const corpBanks = corporateKyc.bankAccounts;
    const corpPrimaryBankIndex = (() => {
      const idx = corpBanks.findIndex((b) => b.isPrimaryAccount);
      return idx >= 0 ? idx : corpBanks.length > 0 ? 0 : -1;
    })();

    const corpDemats = corporateKyc.dematAccounts;
    const corpPrimaryDematIndex = (() => {
      const idx = corpDemats.findIndex((d) => d.isPrimary);
      return idx >= 0 ? idx : corpDemats.length > 0 ? 0 : -1;
    })();

    // Whether any existing customer-side row is already primary.
    const customerHasPrimaryBank = customer.bankAccounts.some(
      (b) => b.isPrimary,
    );
    const customerHasPrimaryDemat = customer.dematAccounts.some(
      (d) => d.isPrimary,
    );

    // ── Date-of-incorporation as ISO `YYYY-MM-DD` (PanCard.dateOfBirth is String) ──
    const doiString = corporateKyc.dateOfIncorporation
      ? corporateKyc.dateOfIncorporation.toISOString().slice(0, 10)
      : null;

    // ── Run everything inside a transaction so the verify-flag flip is atomic ──
    const verifyDate = new Date();

    await db.dataBase.$transaction(async (tx) => {
      // 1) PAN card (1:1)
      if (!customer.panCardModelId && corporateKyc.panNumber) {
        const pan = await tx.panCardModel.create({
          data: {
            firstName: corporateKyc.entityName,
            middleName: "",
            lastName: "",
            panCardNo: corporateKyc.panNumber,
            dateOfBirth: doiString ?? "",
            gender: "NA",
            image: "",
            fileUrl: corporateKyc.panCopyFileUrl ?? undefined,
            isVerified: true,
            verifyDate,
          },
        });
        await tx.customerProfileDataModel.update({
          where: { id: customerId },
          data: { panCardModelId: pan.id },
        });
        syncedSections.push("panCard");
      } else if (customer.panCardModelId) {
        skippedSections.push("panCard");
      }

      // 2) Current address (1:1) – from correspondence block
      if (
        !customer.currentAddressModelId &&
        (corporateKyc.correspondenceLine1 || corporateKyc.correspondenceFullAddress)
      ) {
        const addr = await tx.addressModel.create({
          data: {
            line1:
              corporateKyc.correspondenceLine1 ??
              corporateKyc.correspondenceFullAddress ??
              "",
            line2: corporateKyc.correspondenceLine2 ?? undefined,
            line3: corporateKyc.correspondenceLine3 ?? undefined,
            postOffice: corporateKyc.correspondenceDistrict ?? "",
            cityOrDistrict:
              corporateKyc.correspondenceCity ??
              corporateKyc.correspondenceDistrict ??
              "",
            state: corporateKyc.correspondenceState ?? "",
            pinCode: corporateKyc.correspondencePinCode ?? "",
            country: corporateKyc.countryOfIncorporation ?? "India",
            fullAddress:
              corporateKyc.correspondenceFullAddress ??
              [
                corporateKyc.correspondenceLine1,
                corporateKyc.correspondenceLine2,
                corporateKyc.correspondenceLine3,
                corporateKyc.correspondenceCity,
                corporateKyc.correspondenceState,
                corporateKyc.correspondencePinCode,
              ]
                .filter(Boolean)
                .join(", "),
          },
        });
        await tx.customerProfileDataModel.update({
          where: { id: customerId },
          data: { currentAddressModelId: addr.id },
        });
        syncedSections.push("currentAddress");
      } else if (customer.currentAddressModelId) {
        skippedSections.push("currentAddress");
      }

      // 3) Permanent address (1:1) – from registered block, falling back to correspondence
      if (!customer.permanentAddressModelId) {
        const reg = {
          line1: corporateKyc.registeredLine1 ?? corporateKyc.correspondenceLine1,
          line2: corporateKyc.registeredLine2 ?? corporateKyc.correspondenceLine2,
          line3: corporateKyc.registeredLine3 ?? corporateKyc.correspondenceLine3,
          city: corporateKyc.registeredCity ?? corporateKyc.correspondenceCity,
          district:
            corporateKyc.registeredDistrict ?? corporateKyc.correspondenceDistrict,
          pin:
            corporateKyc.registeredPinCode ?? corporateKyc.correspondencePinCode,
          state: corporateKyc.registeredState ?? corporateKyc.correspondenceState,
          full:
            corporateKyc.registeredFullAddress ??
            corporateKyc.correspondenceFullAddress,
        };
        if (reg.line1 || reg.full) {
          const addr = await tx.addressModel.create({
            data: {
              line1: reg.line1 ?? reg.full ?? "",
              line2: reg.line2 ?? undefined,
              line3: reg.line3 ?? undefined,
              postOffice: reg.district ?? "",
              cityOrDistrict: reg.city ?? reg.district ?? "",
              state: reg.state ?? "",
              pinCode: reg.pin ?? "",
              country: corporateKyc.countryOfIncorporation ?? "India",
              fullAddress:
                reg.full ??
                [reg.line1, reg.line2, reg.line3, reg.city, reg.state, reg.pin]
                  .filter(Boolean)
                  .join(", "),
            },
          });
          await tx.customerProfileDataModel.update({
            where: { id: customerId },
            data: { permanentAddressModelId: addr.id },
          });
          syncedSections.push("permanentAddress");
        }
      } else if (customer.permanentAddressModelId) {
        skippedSections.push("permanentAddress");
      }

      // 4) Bank accounts (1:N) – dedup by (accountNumber, ifscCode)
      const existingBankKeys = new Set(
        customer.bankAccounts.map((b) =>
          `${b.accountNumber.trim().toUpperCase()}|${b.ifscCode.trim().toUpperCase()}`,
        ),
      );
      let banksAdded = 0;
      for (const [i, cb] of corpBanks.entries()) {
        const key = `${cb.accountNumber.trim().toUpperCase()}|${cb.ifscCode.trim().toUpperCase()}`;
        if (existingBankKeys.has(key)) continue;
        const shouldBePrimary =
          !customerHasPrimaryBank && i === corpPrimaryBankIndex && banksAdded === 0;
        await tx.customersBankAccountModel.create({
          data: {
            accountHolderName: cb.accountHolderName,
            accountNumber: cb.accountNumber,
            ifscCode: cb.ifscCode,
            bankName: cb.bankName,
            branch: cb.branch ?? "",
            // Corporate KYC doesn't capture account type — label the rows
            // explicitly so downstream queries can tell they came from a
            // corporate customer.
            bankAccountType: "CORPORATE",
            isPrimary: shouldBePrimary,
            isVerified: true,
            verifyDate,
            customerProfileDataModelId: customerId,
          },
        });
        banksAdded += 1;
      }
      if (banksAdded > 0) syncedSections.push(`bankAccounts(+${banksAdded})`);
      else if (corpBanks.length > 0) skippedSections.push("bankAccounts");

      // 5) Demat accounts (1:N) – dedup by (dpId, clientId)
      const existingDematKeys = new Set(
        customer.dematAccounts.map((d) =>
          `${d.dpId.trim().toUpperCase()}|${d.clientId.trim().toUpperCase()}`,
        ),
      );
      let dematsAdded = 0;
      for (const [i, cd] of corpDemats.entries()) {
        const key = `${cd.dpId.trim().toUpperCase()}|${cd.clientId.trim().toUpperCase()}`;
        if (existingDematKeys.has(key)) continue;
        const shouldBePrimary =
          !customerHasPrimaryDemat && i === corpPrimaryDematIndex && dematsAdded === 0;
        await tx.customersDematAccountModel.create({
          data: {
            depositoryName: cd.depository,
            dpId: cd.dpId,
            clientId: cd.clientId,
            accountType: cd.accountType === "JOINT" ? "JOINT" : "SOLO",
            depositoryParticipantName: cd.depository,
            primaryPanNumber: corporateKyc.panNumber ?? "",
            accountHolderName: cd.accountHolderName,
            isPrimary: shouldBePrimary,
            isVerified: true,
            verifyDate,
            customerProfileDataModelId: customerId,
          },
        });
        dematsAdded += 1;
      }
      if (dematsAdded > 0) syncedSections.push(`dematAccounts(+${dematsAdded})`);
      else if (corpDemats.length > 0) skippedSections.push("dematAccounts");

      // 6) Personal info – only patch annualGrossIncome on existing row.
      //    We deliberately don't create a stub row because the satellite has
      //    several non-nullable string columns that we'd have to fake.
      if (customer.personalInformation && corporateKyc.annualIncome) {
        if (!customer.personalInformation.annualGrossIncome) {
          await tx.customerPersonalInfoModel.update({
            where: { id: customer.personalInformation.id },
            data: { annualGrossIncome: corporateKyc.annualIncome },
          });
          syncedSections.push("personalInformation.annualGrossIncome");
        } else {
          skippedSections.push("personalInformation.annualGrossIncome");
        }
      }

      // 6b) Risk profile – seed the corporate questionnaire with empty
      //     answers when the customer has no risk profile row yet. The
      //     operator (or customer) fills `ans` later through the existing
      //     risk-profile editor; we just guarantee the shape exists so the
      //     UI has something to render.
      if (!customer.customersRiskProfileModelId) {
        const rp = await tx.customersRiskProfileModel.create({
          data: {
            data: CORPORATE_RISK_PROFILE_QUESTIONS as unknown as object[],
          },
        });
        await tx.customerProfileDataModel.update({
          where: { id: customerId },
          data: { customersRiskProfileModelId: rp.id },
        });
        syncedSections.push("riskProfile");
      } else {
        skippedSections.push("riskProfile");
      }

      // 7) Top-level customer flags
      const profilePatch: {
        kycStatus: "VERIFIED";
        kraStatus: string;
        verifyDate: Date;
        VerifiedBy?: number;
        kycSubmitDate?: Date;
        legalEntityName?: string;
        isAFatcaCustomer?: boolean;
      } = {
        kycStatus: "VERIFIED",
        kraStatus: "VERIFIED",
        verifyDate,
      };
      if (crmUserId != null) profilePatch.VerifiedBy = crmUserId;
      if (!customer.kycSubmitDate) profilePatch.kycSubmitDate = verifyDate;
      if (!customer.legalEntityName && corporateKyc.entityName) {
        profilePatch.legalEntityName = corporateKyc.entityName;
        syncedSections.push("legalEntityName");
      }
      if (!customer.isAFatcaCustomer && corporateKyc.fatcaApplicable) {
        profilePatch.isAFatcaCustomer = true;
        syncedSections.push("isAFatcaCustomer");
      }
      await tx.customerProfileDataModel.update({
        where: { id: customerId },
        data: profilePatch,
      });

      // 8) Audit log row in kraDataLogs
      const nowIso = verifyDate.toISOString();
      await tx.kraDataLogs.create({
        data: {
          userId: customerId,
          kycId: corporateKyc.id,
          stage: "MANUAL_VERIFIED_BY_CRM",
          requestData: {
            customerId,
            kycDataStoreId: corporateKyc.id,
            crmUserId,
          } as object,
          responseData: {
            message: "Corporate customer verified by CRM operator.",
            syncedSections,
            skippedSections,
            warnings,
            priorKraStatus: customer.kraStatus,
            priorKycStatus: customer.kycStatus,
          } as object,
          reqTime: nowIso,
          resTime: nowIso,
        },
      });
    });

    return {
      verified: true,
      syncedSections,
      skippedSections,
      warnings,
      kycStatus: "VERIFIED" as const,
      kraStatus: "VERIFIED" as const,
      verifyDate: verifyDate.toISOString(),
    };
  }
}
