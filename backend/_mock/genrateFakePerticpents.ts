// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { db } from "@core/database/database";
// import { faker } from "@faker-js/faker";

// export const createMockParticipantFromUser = async () => {
//     // Fetch one existing customer with their auth, PAN, and bank data
//     const users = await db.dataBase.customerProfileDataModel.findMany({
//         include: {
//             utility: true, // CustomersAuthDataModel
//             panCard: true,
//             bankAccounts: true,
//             dematAccounts: true,
//             currentAddress: true,
//             permanentAddress: true,
//         },
//     });



//     for (let i = 0; i < users.length; i++) {
//         const user = users[i]
//         if (!user) {
//             continue;
//         }

//         // Create fake fallback if some fields are missing
//         const getOrFake = (val: any, fallback: () => any) => val ?? fallback();

//         // Build participant data from existing user
//         const participantData = {
//             id: faker.number.int({ min: 100000, max: 999999 }),
//             userId: user.id,
//             actualStatus: 4,
//             workflowStatus: 1,
//             loginId: `P${faker.string.alphanumeric({ length: 5 }).toUpperCase()}`,
//             firstName: getOrFake(user.firstName, () => faker.person.firstName()),
//             panNo: getOrFake(user.panCard?.panCardNo, () =>
//                 faker.string.alphanumeric({ length: 10 }).toUpperCase()
//             ),
//             custodian: faker.helpers.maybe(() => faker.company.name(), { probability: 0.4 }),
//             contactPerson: `${user.firstName} ${user.lastName}`,
//             mobileList: [user.phoneNo],
//             emailList: [user.emailAddress],
//             telephone: getOrFake(user.phoneNo, () => faker.phone.number()),
//             fax: faker.helpers.maybe(() => faker.phone.number(), { probability: 0.3 }),
//             address: getOrFake(user.currentAddress?.line1, () => faker.location.streetAddress()),
//             address2: getOrFake(user.currentAddress?.cityOrDistrict, () => faker.location.city()),
//             address3: getOrFake(user.currentAddress?.state, () => faker.location.state()),
//             stateCode: faker.helpers.arrayElement([
//                 "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
//                 "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
//             ]),
//             regAddress: getOrFake(user.permanentAddress?.fullAddress, () =>
//                 faker.location.streetAddress()
//             ),
//             leiCode: faker.helpers.maybe(
//                 () => faker.string.alphanumeric({ length: 20 }).toUpperCase(),
//                 { probability: 0.3 }
//             ),
//             expiryDate: faker.helpers.maybe(() => faker.date.future(), { probability: 0.2 }),
//         };

//         // Convert user's bank & demat accounts to NSE-compatible records
//         const bankAccountList = user.bankAccounts.map((acc) => ({
//             bankName: acc.bankName,
//             bankIFSC: acc.ifscCode,
//             bankAccountNo: acc.accountNumber,
//             isDefault: acc.isPrimary ? "Y" : "N",
//         }));

//         const dpAccountList = user.dematAccounts.map((d) => ({
//             dpType: d.depositoryName,
//             dpId: d.dpId,
//             benId: d.clientId,
//             isDefault: d.isPrimary ? "Y" : "N",
//         }));


//         // Create the NSE participant entry
//         const participant = await db.dataBase.nseCbricsParticipantModel.create({
//             data: {
//                 ...participantData,
//                 bankAccountList: {
//                     create: bankAccountList.length
//                         ? bankAccountList
//                         : [
//                             {
//                                 bankName: faker.company.name(),
//                                 bankIFSC: faker.string.alphanumeric({ length: 11 }).toUpperCase(),
//                                 bankAccountNo: faker.finance.accountNumber(12),
//                                 isDefault: "Y",
//                             },
//                         ],
//                 },
//                 dpAccountList: {
//                     create: dpAccountList.length
//                         ? dpAccountList
//                         : [
//                             {
//                                 dpType: "NSDL",
//                                 dpId: faker.string.alphanumeric({ length: 8 }).toUpperCase(),
//                                 benId: faker.string.numeric(8),
//                                 isDefault: "Y",
//                             },
//                         ],
//                 },
//             },
//         });

//         // Link NSE dataset
//         await db.dataBase.nseDataSet.create({
//             data: {
//                 customerProfileDataModelId: user.id,
//                 nseCbricsParticipantModelId: participant.id,
//             },
//         });

//         console.log(`✅ Created NSE Participant for ${user.emailAddress} (${participant.loginId})`);

//     }


// };
