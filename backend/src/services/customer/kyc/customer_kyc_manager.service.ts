import { db, type DataBaseSchema } from "@core/database/database";
import type { $Enums } from "@databases/generated/prisma/supabase";
import type { CustomerProfileService } from "@resource/crm/customers/customer.service";
import type { KycDataStorage } from "./kyc";

export class CustomerKycManager {
  /**
   * Get KYC data for a customer
   */
  private async getKycData(customerId: number): Promise<KycDataStorage> {
    const data = await db.dataBase.kYC_FLOW.findUnique({
      where: { userID: customerId },
    });

    if (!data) {
      throw new Error("KYC Data not found");
    }

    if (!data.complete) {
      throw new Error("KYC Data is not complete");
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
   * Main method to save KYC data to customer profile
   */
  async saveKycToCustomer(customerId: number): Promise<void> {
    const kycData = await this.getKycData(customerId);

    // Extract data from KYC steps
    const step1 = kycData.step_1;
    const step2 = kycData.step_2;
    const step3 = kycData.step_3 || [];
    const step4 = kycData.step_4 || [];
    const step5 = kycData.step_5 || [];
    const step6 = kycData.step_6;

    // Get identity data
    const panData = step1.pan.response.details.pan;
    const aadhaarData = step1.pan.response.details.aadhaar;
    const firstName = step1.pan.firstName;
    const lastName = step1.pan.lastName;
    const middleName = step1.pan.middleName;
    const gender = this.mapGender(panData.gender);

    // Check if customer exists
    const customer = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Update customer with KYC data in a transaction
    await db.dataBase.$transaction(async (tx) => {
      // Update main customer profile
      await tx.customerProfileDataModel.update({
        where: { id: customerId },
        data: {
          firstName,
          lastName,
          middleName,
          gender,
          kycStatus: "VERIFIED",
          verifyDate: new Date(),
          avatar: step1.face.url || null,

          isAFatcaCustomer: step1.pan.isFatca || false,
          allowSEBITerms: step1.pan.checkTerms2 || false,
          isAPep: step1.pan.checkTerms1 || false,
          // Create/update Aadhaar card
          aadhaarCard: {
            upsert: {
              create: {
                aadhaarNo: aadhaarData.id_number,
                dateOfBirth: aadhaarData.dob,
                fatherName: aadhaarData.father_name,
                firstName,
                lastName,
                middleName,
                gender,
                image: aadhaarData.image,
                fileUrl: aadhaarData.file_url,
                isVerified: true,
                verifyDate: step1.pan.fetchedTimestamp,
                confirmTimeStamp: step1.pan.confirmAadhaarTimestamp,
              },
              update: {
                aadhaarNo: aadhaarData.id_number,
                dateOfBirth: aadhaarData.dob,
                fatherName: aadhaarData.father_name,
                firstName,
                lastName,
                middleName,
                gender,
                image: aadhaarData.image,
                fileUrl: aadhaarData.file_url,
                isVerified: true,
                verifyDate: step1.pan.fetchedTimestamp,
                confirmTimeStamp: step1.pan.confirmAadhaarTimestamp,
                allowTerms: step1.pan.checkTerms2,
              },
            },
          },

          // Create/update PAN card
          panCard: {
            upsert: {
              create: {
                panCardNo: panData.id_number,
                firstName,
                lastName,
                middleName,
                dateOfBirth: step1.pan.dateOfBirth,
                gender,
                image: aadhaarData.image,
                fileUrl: panData.file_url,
                isVerified: true,
                verifyDate: step1.pan.fetchedTimestamp,
                confirmTimeStamp: step1.pan.confirmPanTimestamp,
                allowTerms: step1.pan.checkTerms1,
              },
              update: {
                panCardNo: panData.id_number,
                firstName,
                lastName,
                middleName,
                dateOfBirth: step1.pan.dateOfBirth,
                gender,
                image: aadhaarData.image,
                fileUrl: panData.file_url,
                isVerified: true,
                verifyDate: step1.pan.fetchedTimestamp,
                confirmTimeStamp: step1.pan.confirmPanTimestamp,
                allowTerms: step1.pan.checkTerms1,
              },
            },
          },

          // Create/update personal information
          personalInformation: {
            upsert: {
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
                dateOfBirth: step1.pan.dateOfBirth,
                SignatureUrl: step1.sign.url,
                signPdfUrl: step6.response.fileUrl,
                maidenName: null,
                politicallyExposedPerson: step1.pan.checkTerms1 ? "Yes" : "No",
                confirmTimeStamp: step2.confirmPersonalInfoTimestamp,
              },
              update: {
                maritalStatus: step2.maritalStatus,
                occupationType: step2.occupationType,
                annualGrossIncome: step2.annualGrossIncome,
                fatherOrSpouseName: step2.fatSpuName,
                relationshipWithPerson: step2.reelWithPerson,
                mothersName: step2.motherName,
                nationality: step2.nationality,
                residentialStatus: step2.residentialStatus,
                qualification: step2.qualification,
                dateOfBirth: step1.pan.dateOfBirth,
                SignatureUrl: step1.sign.url,
                signPdfUrl: step6.response.fileUrl,
                maidenName: null,
                politicallyExposedPerson: step1.pan.checkTerms1 ? "Yes" : "No",
                confirmTimeStamp: step2.confirmPersonalInfoTimestamp,
              },
            },
          },

          // Create/update current address
          currentAddress: {
            upsert: {
              create: {
                line1: aadhaarData.current_address_details.address,
                line2: null,
                line3: null,
                postOffice:
                  aadhaarData.current_address_details.locality_or_post_office,
                cityOrDistrict:
                  aadhaarData.current_address_details.district_or_city,
                state: aadhaarData.current_address_details.state,
                pinCode: aadhaarData.current_address_details.pincode,
                country: "India",
                fullAddress: aadhaarData.current_address,
              },
              update: {
                line1: aadhaarData.current_address_details.address,
                line2: null,
                line3: null,
                postOffice:
                  aadhaarData.current_address_details.locality_or_post_office,
                cityOrDistrict:
                  aadhaarData.current_address_details.district_or_city,
                state: aadhaarData.current_address_details.state,
                pinCode: aadhaarData.current_address_details.pincode,
                country: "India",
                fullAddress: aadhaarData.current_address,
              },
            },
          },

          // Create/update permanent address
          permanentAddress: {
            upsert: {
              create: {
                line1: aadhaarData.permanent_address_details.address,
                line2: null,
                line3: null,
                postOffice:
                  aadhaarData.permanent_address_details.locality_or_post_office,
                cityOrDistrict:
                  aadhaarData.permanent_address_details.district_or_city,
                state: aadhaarData.permanent_address_details.state,
                pinCode: aadhaarData.permanent_address_details.pincode,
                country: "India",
                fullAddress: aadhaarData.permanent_address,
              },
              update: {
                line1: aadhaarData.permanent_address_details.address,
                line2: null,
                line3: null,
                postOffice:
                  aadhaarData.permanent_address_details.locality_or_post_office,
                cityOrDistrict:
                  aadhaarData.permanent_address_details.district_or_city,
                state: aadhaarData.permanent_address_details.state,
                pinCode: aadhaarData.permanent_address_details.pincode,
                country: "India",
                fullAddress: aadhaarData.permanent_address,
              },
            },
          },

          // Create/update risk profile
          riskProfile: {
            upsert: {
              create: {
                data: step5,
              },
              update: {
                data: step5,
              },
            },
          },
        },
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
              }) as DataBaseSchema.CustomersBankAccountModelCreateManyInput
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
            depositoryParticipantName: demat.depositoryParticipantName,
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
      const kycFlow = await db.dataBase.kYC_FLOW.findUnique({
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
    customerId: number
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

    const kycFlow = await db.dataBase.kYC_FLOW.findUnique({
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
    const gender = this.mapGender(panData?.gender) || user?.gender || "MALE";

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
      kycStatus: user?.kycStatus || "VERIFIED",
      verifyDate: user?.verifyDate,
      VerifiedBy: user?.VerifiedBy || null,
      avatar: step1?.face?.url || user?.avatar || "------",
      isAFatcaCustomer: step1?.pan?.isFatca || user?.isAFatcaCustomer || false,
      allowSEBITerms: step1?.pan?.checkTerms2 || user?.allowSEBITerms || false,
      isAPep: step1?.pan?.checkTerms1 || user?.isAPep || false,
      createdAt: user?.createdAt,
      updatedAt: user?.updatedAt,
      createdBy: user?.createdBy || null,

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
              firstName: firstName,
              lastName: lastName,
              middleName: middleName,
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
                }) as DataBaseSchema.CustomersBankAccountModelCreateInput
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
                    demat.depositoryName || "NSDL"
                  ),
                  dpId: demat.dpId || "------",
                  clientId: demat.beneficiaryClientId || "------",
                  accountType: this.mapAccountType(
                    demat.accountType || "SINGLE"
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
                }) as DataBaseSchema.CustomersDematAccountModelCreateInput
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
