import { db, type DataBaseSchema } from "@core/database/database";
import type { $Enums, KYCStatus } from "@databases/generated/prisma/postgres";
import type { CustomerProfileService } from "@resource/crm/customers/customer.service";
import { AppError } from "@utils/error/AppError";
import type { KycDataStorage, KraResponseInKyc } from "./kyc";

/**
 * KRA numeric state / UT codes (API Download file format May 2025)
 * → state name strings that match `@modules/RFQ/nse/values.ts` lookups.
 */
const KRA_STATE_CODE_TO_NAME: Record<string, string> = {
  "001": "Jammu and Kashmir",
  "002": "Himachal Pradesh",
  "003": "Punjab",
  "004": "Chandigarh",
  "005": "Uttarakhand",
  "006": "Haryana",
  "007": "Delhi",
  "008": "Rajasthan",
  "009": "Uttar Pradesh",
  "010": "Bihar",
  "011": "Sikkim",
  "012": "Arunachal Pradesh",
  "013": "Assam",
  "014": "Manipur",
  "015": "Mizoram",
  "016": "Tripura",
  "017": "Meghalaya",
  "018": "Nagaland",
  "019": "West Bengal",
  "020": "Jharkhand",
  "021": "Odisha",
  "022": "Chhattisgarh",
  "023": "Madhya Pradesh",
  "024": "Gujarat",
  "025": "Daman & Diu",
  "026": "Dadra and Nagar Haveli",
  "027": "Maharashtra",
  "028": "Andhra Pradesh",
  "029": "Karnataka",
  "030": "Goa",
  "031": "Lakshadweep",
  "032": "Kerala",
  "033": "Tamil Nadu",
  "034": "Puducherry",
  "035": "Andaman & Nicobar Islands",
  "036": "Ladakh",
  "037": "Telangana",
  "099": "IMPORT (Not Registered in India)",
};

function kraStateCodeToName(code: string | null | undefined): string {
  const raw = code == null ? "" : String(code).trim();
  if (!raw) return raw;
  if (/^\d+$/.test(raw)) {
    const key = String(parseInt(raw, 10)).padStart(3, "0");
    return KRA_STATE_CODE_TO_NAME[key] ?? raw;
  }
  return raw;
}

export class CustomerKycManager {
  /**
   * Get KYC data for a customer
   */
  private async getKycData(customerId: number): Promise<KycDataStorage> {
    const data = await db.dataBase.kYC_FLOW.findFirst({
      where: { userID: customerId },
    });

    if (!data) {
      throw new Error("KYC Data not found");
    }

    return data.data as KycDataStorage;
  }

  /**
   * Simple gender mapping
   */
  private mapGender(gender: string): $Enums.Gender {
    if (gender === "M") return "MALE";
    if (gender === "F") return "FEMALE";
    return "OTHER";
  }

  /**
   * Simple depository mapping
   */
  private mapDepository(name: string): $Enums.DepositoryName {
    const upper = name.toUpperCase();
    return upper === "CDSL" ? "CDSL" : "NSDL";
  }

  /**
   * Simple account type mapping
   */
  private mapAccountType(type: string): $Enums.DematAccountType {
    const upper = type.toUpperCase();
    if (upper === "JOINT") return "JOINT";
    if (upper === "SOLO") return "SOLO";
    return "SOLO";
  }

  /**
   * Build address create payload from KRA response (correspondence or permanent)
   */
  private buildAddressFromKra(
    kra: KraResponseInKyc,
    type: "correspondence" | "permanent",
  ): { line1: string; line2: string | null; line3: string | null; postOffice: string; cityOrDistrict: string; state: string; pinCode: string; country: string; fullAddress: string } {
    const line1 = type === "correspondence" ? (kra.appCorAdd1 ?? "") : (kra.appPerAdd1 ?? "");
    const line2 = type === "correspondence" ? kra.appCorAdd2 : kra.appPerAdd2;
    const line3 = type === "correspondence" ? kra.appCorAdd3 : kra.appPerAdd3;
    const city = type === "correspondence" ? (kra.appCorCity ?? "") : (kra.appPerCity ?? "");
    const pincode = type === "correspondence" ? (kra.appCorPincd ?? "") : (kra.appPerPincd ?? "");
    const stateCodeOrName = type === "correspondence" ? (kra.appCorState ?? "") : (kra.appPerState ?? "");
    const state = kraStateCodeToName(stateCodeOrName);
    const country = (type === "correspondence" ? kra.appCorCtry : kra.appPerCtry) === "101" ? "India" : "India";
    const fullAddress = [line1, line2, line3, city, state, pincode].filter(Boolean).join(", ");
    return {
      line1: line1 || "N/A",
      line2: line2 ?? null,
      line3: line3 ?? null,
      postOffice: city || "N/A",
      cityOrDistrict: city || "N/A",
      state: state || "N/A",
      pinCode: pincode || "N/A",
      country,
      fullAddress: fullAddress || "N/A",
    };
  }

  /** Address create payload shape used for both KRA and Aadhaar flows */
  private static readonly ADDRESS_PAYLOAD_SHAPE = {} as {
    line1: string;
    line2: string | null;
    line3: string | null;
    postOffice: string;
    cityOrDistrict: string;
    state: string;
    pinCode: string;
    country: string;
    fullAddress: string;
  };

  /**
   * Resolve gender from step1 (KRA path: step1.gender or kraResponse) or Aadhaar (non-KRA).
   * Keeps user data mapping consistent for both KRA and non-KRA flows.
   */
  private resolveGender(
    step1: KycDataStorage["step_1"] & { gender?: string },
    kraResponse: KraResponseInKyc | null | undefined,
    aadhaarData: { gender?: string } | undefined,
    usedExistingKra: boolean,
  ): $Enums.Gender {
    if (usedExistingKra && step1.gender) return this.mapGender(step1.gender);
    if (usedExistingKra && kraResponse?.appGen) return this.mapGender(kraResponse.appGen);
    if (aadhaarData?.gender) return this.mapGender(aadhaarData.gender);
    return "NA";
  }

  /**
   * Resolve current and permanent address payloads.
   * With KRA: from kraResponse; without KRA: from Aadhaar details.
   */
  private resolveAddresses(
    usedExistingKra: boolean,
    kraResponse: KraResponseInKyc | null | undefined,
    aadhaarData: {
      current_address: string;
      permanent_address: string;
      current_address_details: { address: string; locality_or_post_office: string; district_or_city: string; state: string; pincode: string };
      permanent_address_details: { address: string; locality_or_post_office: string; district_or_city: string; state: string; pincode: string };
    } | undefined,
  ): {
    current: typeof CustomerKycManager.ADDRESS_PAYLOAD_SHAPE | null;
    permanent: typeof CustomerKycManager.ADDRESS_PAYLOAD_SHAPE | null;
  } {
    if (usedExistingKra && kraResponse) {

      return {
        current: this.buildAddressFromKra(kraResponse, "correspondence"),
        permanent: this.buildAddressFromKra(kraResponse, "permanent"),
      };
    }
    if (aadhaarData) {
      const cur = aadhaarData.current_address_details;
      const per = aadhaarData.permanent_address_details;
      return {
        current: {
          line1: cur.address,
          line2: null,
          line3: null,
          postOffice: cur.locality_or_post_office,
          cityOrDistrict: cur.district_or_city,
          state: cur.state,
          pinCode: cur.pincode,
          country: "India",
          fullAddress: aadhaarData.current_address,
        },
        permanent: {
          line1: per.address,
          line2: null,
          line3: null,
          postOffice: per.locality_or_post_office,
          cityOrDistrict: per.district_or_city,
          state: per.state,
          pinCode: per.pincode,
          country: "India",
          fullAddress: aadhaarData.permanent_address,
        },
      };
    }
    return { current: null, permanent: null };
  }

  /**
   * Build PAN card create payload. Same shape for both KRA and non-KRA; image from Aadhaar when available.
   */
  private buildPanCardCreatePayload(
    step1: KycDataStorage["step_1"],
    panData: { id_number: string; file_url?: string },
    gender: string,
    aadhaarData: { image?: string } | undefined,
  ): DataBaseSchema.PanCardModelCreateInput {
    const dateOfBirth = step1.pan.dateOfBirth.split("T")[0]?.toString() || "";
    return {
      panCardNo: panData.id_number,
      firstName: step1.pan.firstName,
      lastName: step1.pan.lastName,
      middleName: step1.pan.middleName,
      dateOfBirth,
      gender: gender as $Enums.Gender,
      image: aadhaarData?.image ?? "",
      fileUrl: panData.file_url ?? "",
      isVerified: true,
      verifyDate: step1.pan.fetchedTimestamp,
      confirmTimeStamp: step1.pan.confirmPanTimestamp,
      allowTerms: step1.pan.checkTerms1,
    };
  }

  /**
   * Build Aadhaar card create payload when not using KRA (Aadhaar was verified in flow). Returns null for KRA path.
   */
  private buildAadhaarCardCreatePayload(
    usedExistingKra: boolean,
    aadhaarData: {
      id_number: string;
      dob: string;
      father_name: string;
      name: string;
      image: string;
      file_url: string;
    } | undefined,
    step1: KycDataStorage["step_1"],
    gender: $Enums.Gender,
  ): DataBaseSchema.AADHAARCardModelCreateInput | null {
    if (usedExistingKra || !aadhaarData) return null;
    return {
      aadhaarNo: aadhaarData.id_number,
      dateOfBirth: aadhaarData.dob,
      fatherName: aadhaarData.father_name,
      firstName: aadhaarData.name,
      lastName: "",
      middleName: "",
      gender,
      image: aadhaarData.image,
      fileUrl: aadhaarData.file_url,
      isVerified: true,
      verifyDate: step1.pan.fetchedTimestamp,
      confirmTimeStamp: step1.pan.confirmAadhaarTimestamp,
    };
  }

  /**
   * Main method to save KYC data to customer profile
   */

  async saveKycToCustomer(
    customerId: number,
    kycStatus?: KYCStatus,
  ): Promise<void> {
    const kycData = await this.getKycData(customerId);

    // Extract data from KYC steps
    const step1 = kycData.step_1;
    const step2 = kycData.step_2;
    const step3 = kycData.step_3 || [];
    const step4 = kycData.step_4 || [];
    const step5 = kycData.step_5 || [];
    const step6 = kycData.step_6;

    const usedExistingKra = !!(step1 as { usedExistingKra?: boolean }).usedExistingKra;
    const kraResponse = (step1 as { kraResponse?: KraResponseInKyc | null }).kraResponse;

    const panData = step1.pan.response?.details?.pan;
    const aadhaarData = step1.pan.response?.details?.aadhaar;

    // Identity: same source for both KRA and non-KRA (names from PAN step)
    const firstName = step1.pan.firstName;
    const lastName = step1.pan.lastName;
    const middleName = step1.pan.middleName;
    const gender = this.resolveGender(step1, kraResponse ?? null, aadhaarData, usedExistingKra);

    const customer = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerId },
      include: { aadhaarCard: true, panCard: true },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    if (!panData) {
      throw new Error("PAN data not found in KYC response");
    }

    if (usedExistingKra && !kraResponse) {
      throw new Error("KRA response is required when user chose Use Existing KYC but was not found in KYC data");
    }

    if (customer.kycStatus === "RE_KYC") {
      const norm = (id: string) => (id || "").replace(/\s/g, "").replace(/x/gi, "0");
      const existingAadhaar = usedExistingKra ? "xxxxxxxxxxxx" : customer.aadhaarCard?.aadhaarNo;
      const existingPan = customer.panCard?.panCardNo;
      if (!usedExistingKra && existingAadhaar && aadhaarData?.id_number && norm(aadhaarData.id_number) !== norm(existingAadhaar)) {
        throw new AppError(
          "ReKYC must use the same Aadhaar number as your last verified KYC.",
          { code: "REKYC_AADHAAR_MISMATCH", statusCode: 400 },
        );
      }
      if (existingPan && panData?.id_number) {
        const newPan = (panData.id_number || "").trim().toUpperCase();
        const prevPan = (existingPan || "").trim().toUpperCase();
        if (newPan !== prevPan) {
          throw new AppError(
            "ReKYC must use the same PAN number as your last verified KYC.",
            { code: "REKYC_PAN_MISMATCH", statusCode: 400 },
          );
        }
      }
    }

    const { current: currentAddressPayload, permanent: permanentAddressPayload } = this.resolveAddresses(
      usedExistingKra,
      kraResponse ?? null,
      aadhaarData,
    );

    const panCardCreate = this.buildPanCardCreatePayload(step1, panData, gender, aadhaarData);
    const aadhaarCardCreate = this.buildAadhaarCardCreatePayload(
      usedExistingKra,
      aadhaarData,
      step1,
      gender,
    );

    const baseUpdateData: DataBaseSchema.CustomerProfileDataModelUpdateInput = {
      firstName,
      lastName,
      middleName,
      gender: gender as $Enums.Gender,
      kycStatus,
      useKraKyc: usedExistingKra,
      avatar: step1.face?.url,
      isAFatcaCustomer: !step1.pan.isFatca,
      allowSEBITerms: step1.pan.checkTerms2,
      isAPep: !step1.pan.checkTerms1,
      panCard: {
        create: panCardCreate,
      },
      personalInformation: {
        create: {
          maritalStatus: step2.maritalStatus,
          occupationType: step2.occupationType,
          annualGrossIncome: step2.annualGrossIncome,
          fatherOrSpouseName: step2.fatSpuName,
          relationshipWithPerson: step2.reelWithPerson,
          mothersName: step2.motherName,
          nationality: step2.nationality,
          residentialStatus: step2.residentialStatus,
          qualification: step2.qualification,
          otherOccupationName: step2?.otherOccupationName,
          dateOfBirth: step1.pan.dateOfBirth.split("T")[0]?.toString() || "",
          SignatureUrl: step1.sign?.url,
          signPdfUrl: step6?.response?.fileUrl,
          maidenName: null,
          politicallyExposedPerson: step1.pan.checkTerms1 ? "No" : "Yes",
          confirmTimeStamp: step2.confirmPersonalInfoTimestamp,
        },
      },
      currentAddress: currentAddressPayload ? { create: currentAddressPayload } : undefined,
      permanentAddress: permanentAddressPayload ? { create: permanentAddressPayload } : undefined,
      riskProfile: {
        create: {
          data: step5,
        },
      },
    };

    if (aadhaarCardCreate) {
      (baseUpdateData as Record<string, unknown>).aadhaarCard = { create: aadhaarCardCreate };
    }

    // Update customer with KYC data in a transaction
    await db.dataBase.$transaction(async (tx) => {
      await tx.customerProfileDataModel.update({
        where: { id: customerId },
        data: baseUpdateData,
      });

      // Delete existing bank accounts and create new ones
      await tx.customersBankAccountModel.deleteMany({
        where: { customerProfileDataModelId: customerId },
      });

      if (step3.length > 0) {
        await tx.customersBankAccountModel.createMany({
          data: step3.map(
            (bank) =>
              ({
                customerProfileDataModelId: customerId,
                accountNumber: bank.accountNumber,
                ifscCode: bank.ifscCode,
                bankName: bank.bankName,
                branch: bank.branchName,
                accountHolderName: bank.beneficiary_name,
                bankAccountType: bank.bankAccountType,
                isPrimary: bank.isDefault,
                isVerified: bank.isVerified,
                allowTerms: bank.checkTerms,
                confirmTimeStamp: bank.verifyTimestamp,
                verifyDate: bank.isVerified
                  ? bank.confirmBankTimestamp
                  : undefined,
              }) as DataBaseSchema.CustomersBankAccountModelCreateManyInput,
          ),
        });
      }

      // Delete existing demat accounts and create new ones
      await tx.customersDematAccountModel.deleteMany({
        where: { customerProfileDataModelId: customerId },
      });

      if (step4.length > 0) {
        await tx.customersDematAccountModel.createMany({
          data: step4.map((demat) => ({
            customerProfileDataModelId: customerId,
            depositoryName: this.mapDepository(demat.depositoryName),
            dpId: demat.dpId,
            clientId: demat.beneficiaryClientId,
            accountType: this.mapAccountType(demat.accountType),
            depositoryParticipantName:
              demat.depositoryParticipantName || "Not Found",
            primaryPanNumber: demat.panNumber[0] || "",
            sndPanNumber: demat.panNumber[1] || null,
            trdPanNumber: demat.panNumber[2] || null,
            accountHolderName: demat.accountHolderName,
            isPrimary: demat.isDefault,
            isVerified: demat.isVerified,
            allowTerms: demat.checkTerms,
            confirmTimeStamp: demat.verifyTimestamp,
            verifyDate: demat.isVerified
              ? demat.confirmDematTimestamp
              : new Date(),
          })),
        } as DataBaseSchema.CustomersDematAccountModelCreateManyArgs);
      }
    });
  }

  /**
   * Check if customer has completed KYC
   */
  async isKycComplete(customerId: number): Promise<boolean> {
    try {
      const kycFlow = await db.dataBase.kYC_FLOW.findFirst({
        where: { userID: customerId },
      });
      return kycFlow?.complete || false;
    } catch {
      return false;
    }
  }

  /**
   * Get customer KYC status
   */
  async getKycStatus(customerId: number): Promise<$Enums.KYCStatus | null> {
    const customer = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerId },
      select: { kycStatus: true },
    });
    return customer?.kycStatus || null;
  }

  // i need to show formatted profile data for kyc view on dashboard need same as getFullCustomerProfile but with kyc flow data
  async getUserKycFlowDataWithFormattedFullProfile(
    customerId: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    // Fetch both user and KYC data
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerId },
      include: {
        aadhaarCard: true,
        panCard: true,
        personalInformation: true,
        currentAddress: true,
        permanentAddress: true,
        bankAccounts: true,
        dematAccounts: true,
        riskProfile: true,
        utility: true,
      },
    });

    const kycFlow = await db.dataBase.kYC_FLOW.findFirst({
      where: { userID: customerId },
    });

    // Remove sensitive information

    if (!kycFlow) return user;

    const kycData = kycFlow.data as KycDataStorage;

    // Extract data from KYC steps with fallbacks
    const step1 = kycData.step_1;
    const step2 = kycData.step_2;
    const step3 = kycData.step_3 || [];
    const step4 = kycData.step_4 || [];
    const step5 = kycData.step_5 || [];
    const step6 = kycData.step_6;

    // Get identity data with fallbacks
    const panData = step1?.pan?.response?.details?.pan;
    const aadhaarData = step1?.pan?.response?.details?.aadhaar;
    const firstName = step1?.pan?.firstName || user?.firstName || "------";
    const lastName = step1?.pan?.lastName || user?.lastName || "------";
    const middleName = step1?.pan?.middleName || user?.middleName || null;
    const gender =
      this.mapGender(aadhaarData?.gender) || user?.gender || "MALE";

    const data: Awaited<
      ReturnType<CustomerProfileService["getFullCustomerProfile"]>
    > = {
      aADHAARCardModelId: null,
      currentAddressModelId: null,
      customerPersonalInfoModelId: null,
      nseDataSet: null,
      customersRiskProfileModelId: null,
      customersAuthDataModelId: 0,
      panCardModelId: null,
      permanentAddressModelId: null,
      id: customerId,
      firstName,
      lastName,
      middleName: middleName || "",
      gender,
      emailAddress: user?.emailAddress || "------",
      phoneNo: user?.phoneNo || "------",
      whatsAppNo: user?.whatsAppNo || "------",
      userName: user?.userName || "------",
      userType: user?.userType || "INDIVIDUAL",
      kycStatus: user?.kycStatus || "PENDING",
      kraStatus: user?.kraStatus,
      verifyDate: user?.verifyDate,
      VerifiedBy: user?.VerifiedBy || null,

      avatar: step1?.face?.url || user?.avatar || "------",
      isAFatcaCustomer: step1?.pan?.isFatca || user?.isAFatcaCustomer || false,
      allowSEBITerms: step1?.pan?.checkTerms2 || user?.allowSEBITerms || false,
      isAPep: step1?.pan?.checkTerms1 || user?.isAPep || false,
      createdAt: user?.createdAt,
      updatedAt: user?.updatedAt,
      createdBy: user?.createdBy || null,
      useKraKyc: user?.useKraKyc || false,

      // Aadhaar Card data - prioritize KYC data, fallback to existing user data
      aadhaarCard:
        aadhaarData || user?.aadhaarCard
          ? ({
            id: user?.aadhaarCard?.id || 0,
            aadhaarNo:
              aadhaarData?.id_number ||
              user?.aadhaarCard?.aadhaarNo ||
              "------",
            dateOfBirth:
              aadhaarData?.dob || user?.aadhaarCard?.dateOfBirth || "------",
            fatherName:
              aadhaarData?.father_name ||
              user?.aadhaarCard?.fatherName ||
              "------",
            firstName: aadhaarData?.name,
            lastName: "",
            middleName: "",
            gender: gender,
            image: aadhaarData?.image || user?.aadhaarCard?.image || "------",
            fileUrl:
              aadhaarData?.file_url || user?.aadhaarCard?.fileUrl || "------",
            isVerified: user?.aadhaarCard?.isVerified || true,
            verifyDate:
              user?.aadhaarCard?.verifyDate ||
              step1.pan.confirmAadhaarTimestamp,
            confirmTimeStamp:
              user?.aadhaarCard?.confirmTimeStamp ||
              step1.pan.confirmAadhaarTimestamp,
            createdAt: user?.aadhaarCard?.createdAt,
            updatedAt: user?.aadhaarCard?.updatedAt,
            allowTerms:
              step1?.pan?.checkTerms2 ||
              user?.aadhaarCard?.allowTerms ||
              false,
          } as DataBaseSchema.AADHAARCardModelCreateInput)
          : null,

      // PAN Card data - prioritize KYC data, fallback to existing user data
      panCard:
        panData || user?.panCard
          ? ({
            id: user?.panCard?.id || 0,
            panCardNo:
              panData?.id_number || user?.panCard?.panCardNo || "------",
            firstName: firstName,
            lastName: lastName,
            middleName: middleName,
            dateOfBirth:
              step1?.pan?.dateOfBirth ||
              user?.panCard?.dateOfBirth ||
              "------",
            gender: gender,
            image: aadhaarData?.image || user?.panCard?.image || "------",
            fileUrl: panData?.file_url || user?.panCard?.fileUrl || "------",
            isVerified: user?.panCard?.isVerified || true,
            verifyDate: user?.panCard?.verifyDate,
            createdAt: user?.panCard?.createdAt,
            updatedAt: user?.panCard?.updatedAt,
            allowTerms:
              step1?.pan?.checkTerms1 || user?.panCard?.allowTerms || false,
            confirmTimeStamp:
              user?.panCard?.confirmTimeStamp ||
              step1?.pan?.confirmPanTimestamp,
          } as DataBaseSchema.PanCardModelCreateInput)
          : null,

      // Personal Information - prioritize KYC data, fallback to existing user data
      personalInformation:
        step2 || user?.personalInformation
          ? ({
            id: user?.personalInformation?.id || 0,
            maritalStatus:
              step2?.maritalStatus ||
              user?.personalInformation?.maritalStatus ||
              "------",
            occupationType:
              step2?.occupationType ||
              user?.personalInformation?.occupationType ||
              "------",
            annualGrossIncome:
              step2?.annualGrossIncome ||
              user?.personalInformation?.annualGrossIncome ||
              "------",
            fatherOrSpouseName:
              step2?.fatSpuName ||
              user?.personalInformation?.fatherOrSpouseName ||
              "------",
            relationshipWithPerson:
              step2?.reelWithPerson ||
              user?.personalInformation?.relationshipWithPerson ||
              "------",
            mothersName:
              step2?.motherName ||
              user?.personalInformation?.mothersName ||
              "------",
            nationality:
              step2?.nationality ||
              user?.personalInformation?.nationality ||
              "------",
            residentialStatus:
              step2?.residentialStatus ||
              user?.personalInformation?.residentialStatus ||
              "------",
            qualification:
              step2?.qualification ||
              user?.personalInformation?.qualification ||
              "------",
            dateOfBirth:
              step1?.pan?.dateOfBirth ||
              user?.personalInformation?.dateOfBirth ||
              "------",
            SignatureUrl:
              step1?.sign?.url ||
              user?.personalInformation?.SignatureUrl ||
              "------",
            signPdfUrl:
              step6?.response?.fileUrl ||
              user?.personalInformation?.signPdfUrl ||
              "------",
            maidenName: user?.personalInformation?.maidenName || null,
            politicallyExposedPerson:
              user?.personalInformation?.politicallyExposedPerson,
            createdAt: user?.personalInformation?.createdAt,
            updatedAt: user?.personalInformation?.updatedAt,
            confirmTimeStamp:
              user?.personalInformation?.confirmTimeStamp ||
              step2?.confirmPersonalInfoTimestamp,
          } as DataBaseSchema.CustomerPersonalInfoModelCreateInput)
          : null,

      // Current Address - prioritize KYC data, fallback to existing user data
      currentAddress:
        aadhaarData?.current_address_details || user?.currentAddress
          ? ({
            id: user?.currentAddress?.id || 0,
            line1:
              aadhaarData?.current_address_details?.address ||
              user?.currentAddress?.line1 ||
              "------",
            line2: user?.currentAddress?.line2 || null,
            line3: user?.currentAddress?.line3 || null,
            postOffice:
              aadhaarData?.current_address_details?.locality_or_post_office ||
              user?.currentAddress?.postOffice ||
              "------",
            cityOrDistrict:
              aadhaarData?.current_address_details?.district_or_city ||
              user?.currentAddress?.cityOrDistrict ||
              "------",
            state:
              aadhaarData?.current_address_details?.state ||
              user?.currentAddress?.state ||
              "------",
            pinCode:
              aadhaarData?.current_address_details?.pincode ||
              user?.currentAddress?.pinCode ||
              "------",
            country: user?.currentAddress?.country || "India",
            fullAddress:
              aadhaarData?.current_address ||
              user?.currentAddress?.fullAddress ||
              "------",
            createdAt: user?.currentAddress?.createdAt,
            updatedAt: user?.currentAddress?.updatedAt,
          } as DataBaseSchema.AddressModelCreateInput)
          : null,

      // Permanent Address - prioritize KYC data, fallback to existing user data
      permanentAddress:
        aadhaarData?.permanent_address_details || user?.permanentAddress
          ? ({
            id: user?.permanentAddress?.id || 0,
            line1:
              aadhaarData?.permanent_address_details?.address ||
              user?.permanentAddress?.line1 ||
              "------",
            line2: user?.permanentAddress?.line2 || null,
            line3: user?.permanentAddress?.line3 || null,
            postOffice:
              aadhaarData?.permanent_address_details
                ?.locality_or_post_office ||
              user?.permanentAddress?.postOffice ||
              "------",
            cityOrDistrict:
              aadhaarData?.permanent_address_details?.district_or_city ||
              user?.permanentAddress?.cityOrDistrict ||
              "------",
            state:
              aadhaarData?.permanent_address_details?.state ||
              user?.permanentAddress?.state ||
              "------",
            pinCode:
              aadhaarData?.permanent_address_details?.pincode ||
              user?.permanentAddress?.pinCode ||
              "------",
            country: user?.permanentAddress?.country || "India",
            fullAddress:
              aadhaarData?.permanent_address ||
              user?.permanentAddress?.fullAddress ||
              "------",
            createdAt: user?.permanentAddress?.createdAt,
            updatedAt: user?.permanentAddress?.updatedAt,
          } as DataBaseSchema.AddressModelCreateInput)
          : null,

      // Bank Accounts - prioritize KYC data, fallback to existing user data
      bankAccounts:
        step3.length > 0
          ? step3.map(
            (bank, index) =>
              ({
                id: index,
                customerProfileDataModelId: customerId,
                accountNumber: bank.accountNumber || "------",
                ifscCode: bank.ifscCode || "------",
                bankName: bank.bankName || "------",
                branch: bank.branchName || "------",
                accountHolderName: bank.beneficiary_name || "------",
                bankAccountType: bank.bankAccountType || "------",
                isPrimary: bank.isDefault || false,
                isVerified: bank.isVerified || false,
                verifyDate: bank.isVerified ? bank.verifyTimestamp : null,
                createdAt: new Date(),
                updatedAt: new Date(),
                allowTerms: bank.checkTerms || false,
                confirmTimeStamp: bank.confirmBankTimestamp || null,
              }) as DataBaseSchema.CustomersBankAccountModelCreateInput,
          )
          : user?.bankAccounts || [],

      // Demat Accounts - prioritize KYC data, fallback to existing user data
      dematAccounts:
        step4.length > 0
          ? step4.map(
            (demat, index) =>
              ({
                id: index,
                customerProfileDataModelId: customerId,
                depositoryName: this.mapDepository(
                  demat.depositoryName || "NSDL",
                ),
                dpId: demat.dpId || "------",
                clientId: demat.beneficiaryClientId || "------",
                accountType: this.mapAccountType(
                  demat.accountType || "SINGLE",
                ),
                depositoryParticipantName:
                  demat.depositoryParticipantName || "------",
                primaryPanNumber:
                  (demat.panNumber && demat.panNumber[0]) || "------",
                sndPanNumber: (demat.panNumber && demat.panNumber[1]) || null,
                trdPanNumber: (demat.panNumber && demat.panNumber[2]) || null,
                accountHolderName: demat.accountHolderName || "------",
                isPrimary: demat.isDefault || false,
                isVerified: demat.isVerified || false,
                verifyDate: demat.isVerified ? demat.verifyTimestamp : null,
                createdAt: new Date(),
                updatedAt: new Date(),
                allowTerms: demat.checkTerms || false,
                confirmTimeStamp: demat.confirmDematTimestamp || null,
              }) as DataBaseSchema.CustomersDematAccountModelCreateInput,
          )
          : user?.dematAccounts || [],

      // Risk Profile - prioritize KYC data, fallback to existing user data
      riskProfile:
        (step5 && step5.length > 0) || user?.riskProfile
          ? {
            id: user?.riskProfile?.id || 0,
            data:
              step5 && step5.length > 0
                ? step5
                : user?.riskProfile?.data || [],
            createdAt: user?.riskProfile?.createdAt,
            updatedAt: user?.riskProfile?.updatedAt,
          }
          : null,

      // Utility data - use existing user data or defaults
      utility:
        user?.utility ||
        ({
          id: 0,
          accountStatus: "ACTIVE",
          isEmailVerified: false,
          isPhoneVerified: false,
          signinWith: "CREDENTIALS",
          termsAccepted: true,
          lastLogin: null,
          whatsAppNotificationAllow: false,
          cRMUserDataModelId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          password: "",
          socialLoginId: null,
        } as DataBaseSchema.CustomersAuthDataModelCreateInput),

      // Count object for related entities
      _count: {
        riskProfile: (step5 && step5.length > 0) || user?.riskProfile ? 1 : 0,
        utility: user?.utility ? 1 : 1, // Always 1 since we provide default
        aadhaarCard: aadhaarData || user?.aadhaarCard ? 1 : 0,
        panCard: panData || user?.panCard ? 1 : 0,
        personalInformation: step2 || user?.personalInformation ? 1 : 0,
        currentAddress:
          aadhaarData?.current_address_details || user?.currentAddress ? 1 : 0,
        permanentAddress:
          aadhaarData?.permanent_address_details || user?.permanentAddress
            ? 1
            : 0,
        bankAccounts:
          (step3.length > 0 ? step3.length : user?.bankAccounts?.length) || 0,
        dematAccounts:
          (step4.length > 0 ? step4.length : user?.dematAccounts?.length) || 0,
        nseDataSet: 0, // Assuming no NSE data for now
      },
    };

    return data;
  }
}
