import { db } from "@core/database/database";
import type { $Enums } from "@databases/generated/prisma/supabase";
import type { KycDataStorage } from "./kyc";

export class CustomerKycManager {

    /**
     * Get KYC data for a customer
     */
    private async getKycData(customerId: number): Promise<KycDataStorage> {
        const data = await db.dataBase.kYC_FLOW.findUnique({
            where: { userID: customerId }
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
        if (upper === "HUF") return "HUF";
        return "SINGLE";
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
            where: { id: customerId }
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
                                verifyDate: new Date()
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
                                verifyDate: new Date()
                            }
                        }
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
                                verifyDate: new Date()
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
                                verifyDate: new Date()
                            }
                        }
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
                                politicallyExposedPerson: null
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
                                politicallyExposedPerson: null
                            }
                        }
                    },

                    // Create/update current address
                    currentAddress: {
                        upsert: {
                            create: {
                                line1: aadhaarData.current_address_details.address,
                                line2: null,
                                line3: null,
                                postOffice: aadhaarData.current_address_details.locality_or_post_office,
                                cityOrDistrict: aadhaarData.current_address_details.district_or_city,
                                state: aadhaarData.current_address_details.state,
                                pinCode: aadhaarData.current_address_details.pincode,
                                country: "India",
                                fullAddress: aadhaarData.current_address
                            },
                            update: {
                                line1: aadhaarData.current_address_details.address,
                                line2: null,
                                line3: null,
                                postOffice: aadhaarData.current_address_details.locality_or_post_office,
                                cityOrDistrict: aadhaarData.current_address_details.district_or_city,
                                state: aadhaarData.current_address_details.state,
                                pinCode: aadhaarData.current_address_details.pincode,
                                country: "India",
                                fullAddress: aadhaarData.current_address
                            }
                        }
                    },

                    // Create/update permanent address
                    permanentAddress: {
                        upsert: {
                            create: {
                                line1: aadhaarData.permanent_address_details.address,
                                line2: null,
                                line3: null,
                                postOffice: aadhaarData.permanent_address_details.locality_or_post_office,
                                cityOrDistrict: aadhaarData.permanent_address_details.district_or_city,
                                state: aadhaarData.permanent_address_details.state,
                                pinCode: aadhaarData.permanent_address_details.pincode,
                                country: "India",
                                fullAddress: aadhaarData.permanent_address
                            },
                            update: {
                                line1: aadhaarData.permanent_address_details.address,
                                line2: null,
                                line3: null,
                                postOffice: aadhaarData.permanent_address_details.locality_or_post_office,
                                cityOrDistrict: aadhaarData.permanent_address_details.district_or_city,
                                state: aadhaarData.permanent_address_details.state,
                                pinCode: aadhaarData.permanent_address_details.pincode,
                                country: "India",
                                fullAddress: aadhaarData.permanent_address
                            }
                        }
                    },

                    // Create/update risk profile
                    riskProfile: {
                        upsert: {
                            create: {
                                data: step5
                            },
                            update: {
                                data: step5
                            }
                        }
                    }
                }
            });

            // Delete existing bank accounts and create new ones
            await tx.customersBankAccountModel.deleteMany({
                where: { customerProfileDataModelId: customerId }
            });

            if (step3.length > 0) {
                await tx.customersBankAccountModel.createMany({
                    data: step3.map(bank => ({
                        customerProfileDataModelId: customerId,
                        accountNumber: bank.accountNumber,
                        ifscCode: bank.ifscCode,
                        bankName: bank.bankName,
                        branch: bank.branchName,
                        accountHolderName: bank.beneficiary_name,
                        bankAccountType: bank.bankAccountType,
                        isPrimary: bank.isDefault,
                        isVerified: bank.isVerified,
                        verifyDate: bank.isVerified ? new Date() : null
                    }))
                });
            }

            // Delete existing demat accounts and create new ones
            await tx.customersDematAccountModel.deleteMany({
                where: { customerProfileDataModelId: customerId }
            });

            if (step4.length > 0) {
                await tx.customersDematAccountModel.createMany({
                    data: step4.map(demat => ({
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
                        verifyDate: demat.isVerified ? new Date() : null
                    }))
                });
            }
        });
    }

    /**
     * Check if customer has completed KYC
     */
    async isKycComplete(customerId: number): Promise<boolean> {
        try {
            const kycFlow = await db.dataBase.kYC_FLOW.findUnique({
                where: { userID: customerId }
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
            select: { kycStatus: true }
        });
        return customer?.kycStatus || null;
    }
}