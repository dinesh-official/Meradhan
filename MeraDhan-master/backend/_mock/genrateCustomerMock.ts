import { db } from '@core/database/database';
import { faker } from '@faker-js/faker';
import { hashingUtils } from '@utils/hash/hashing_utils';

const generateMockCustomer = async () => {
    const password = await hashingUtils.hashPassword('123456');
    await db.dataBase.customerProfileDataModel.create({
        data: {
            // Basic info
            emailAddress: faker.internet.email(),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            middleName: faker.person.middleName(),
            gender: 'MALE',
            phoneNo: faker.phone.number(),
            userName: faker.string.uuid(),
            avatar: faker.image.avatar(),
            kycStatus: 'PENDING',
            userType: 'INDIVIDUAL',
            whatsAppNo: faker.phone.number(),

            // Utility info
            utility: {
                create: {
                    signinWith: 'CREDENTIALS',
                    accountStatus: 'ACTIVE',
                    isEmailVerified: true,
                    isPhoneVerified: true,
                    password: password,
                    termsAccepted: true,
                    whatsAppNotificationAllow: true,
                },
            },

            // Aadhaar details
            aadhaarCard: {
                create: {
                    aadhaarNo: faker.string.numeric(12),
                    dateOfBirth: faker.date.birthdate().toISOString(),
                    fatherName: faker.person.fullName({ sex: 'male' }),
                    firstName: faker.person.firstName(),
                    gender: 'MALE',
                    image: faker.image.avatar(),
                    lastName: faker.person.lastName(),
                    middleName: faker.person.middleName(),
                    verifyDate: new Date(),
                    isVerified: true,
                    fileUrl: faker.image.url(),
                },
            },

            // PAN card details
            panCard: {
                create: {
                    dateOfBirth: faker.date.birthdate().toISOString(),
                    firstName: faker.person.firstName(),
                    gender: 'MALE',
                    lastName: faker.person.lastName(),
                    middleName: faker.person.middleName(),
                    panCardNo: faker.string.alphanumeric(10).toUpperCase(),
                    verifyDate: new Date(),
                    isVerified: true,
                    fileUrl: faker.image.url(),
                    image: faker.image.avatar(),
                },
            },

            // Bank account details
            bankAccounts: {
                create: {
                    accountHolderName: faker.person.fullName(),
                    accountNumber: (faker.finance.accountNumber(12)),
                    bankAccountType: 'SAVING',
                    bankName: faker.company.name(),
                    verifyDate: new Date(),
                    branch: faker.location.city(),
                    ifscCode: `${faker.string.alpha({ length: 4, casing: 'upper' })}${faker.string.numeric(7)}`,
                    isPrimary: true,
                    isVerified: true,

                },
            },

            // Demat account details
            dematAccounts: {
                create: {
                    accountHolderName: faker.person.fullName(),
                    accountType: 'SOLO',
                    clientId: faker.string.numeric(8),
                    verifyDate: new Date(),
                    depositoryName: 'NSDL',
                    depositoryParticipantName: faker.company.name(),
                    dpId: faker.string.numeric(6),
                    primaryPanNumber: faker.string.alphanumeric(10).toUpperCase(),
                    isPrimary: true,
                    isVerified: true,
                },
            },

            // Current address
            currentAddress: {
                create: {
                    cityOrDistrict: faker.location.city(),
                    country: faker.location.country(),
                    fullAddress: faker.location.streetAddress(),
                    line1: faker.location.street(),
                    line2: faker.location.secondaryAddress(),
                    line3: faker.location.buildingNumber(),
                    pinCode: faker.location.zipCode(),
                    postOffice: faker.location.city(),
                    state: faker.location.state(),
                },
            },

            // Permanent address
            permanentAddress: {
                create: {
                    cityOrDistrict: faker.location.city(),
                    country: faker.location.country(),
                    fullAddress: faker.location.streetAddress(),
                    line1: faker.location.street(),
                    line2: faker.location.secondaryAddress(),
                    line3: faker.location.buildingNumber(),
                    pinCode: faker.location.zipCode(),
                    postOffice: faker.location.city(),
                    state: faker.location.state(),
                },
            },

            // Personal information
            personalInformation: {
                create: {
                    annualGrossIncome: faker.helpers.arrayElement([
                        'LESS_THAN_1_LAKH',
                        '1_TO_5_LAKH',
                        '5_TO_10_LAKH',
                        'ABOVE_10_LAKH',
                    ]),
                    fatherOrSpouseName: faker.person.fullName({ sex: 'male' }),
                    maritalStatus: faker.helpers.arrayElement(['SINGLE', 'MARRIED']),
                    mothersName: faker.person.fullName({ sex: 'female' }),
                    nationality: faker.location.country(),
                    occupationType: faker.person.jobType(),
                    qualification: faker.person.jobTitle(),
                    residentialStatus: faker.helpers.arrayElement(['RESIDENT', 'NON_RESIDENT']),
                    maidenName: faker.person.firstName(),
                    SignatureUrl: faker.image.url(),
                    politicallyExposedPerson: "yes",
                },
            },
        },
    });
};


export const genrateFakeCustomerData = async () => {
    for (let index = 0; index < 100; index++) {
        await generateMockCustomer();
        console.log(index);

    }
}