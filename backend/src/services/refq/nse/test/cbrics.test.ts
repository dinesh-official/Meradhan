import { db } from "@core/database/database";
import { generateUsername } from "@utils/generate/generate_username";
import { ParticipantManager } from "../cbrics_manager.service";

export const testCreateParticipant = async () => {
  const user = await db.dataBase.customerProfileDataModel.create({
    data: {
      emailAddress: "rohanshah12334@testmail.com",
      firstName: "Rohan",
      lastName: "Shah",
      gender: "MALE",
      phoneNo: "+919876513215",
      userName: generateUsername(),
      whatsAppNo: "+919876513215",
      middleName: "",
      utility: {
        create: {
          signinWith: "CREDENTIALS",
          accountStatus: "ACTIVE",
          isEmailVerified: true,
          isPhoneVerified: true,
          termsAccepted: true,
          whatsAppNotificationAllow: true,
        },
      },
      aadhaarCard: {
        create: {
          aadhaarNo: "xxxx-xxxx-xxxx-3343",
          dateOfBirth: "02-11-2001",
          fatherName: "test name",
          firstName: "Rohan",
          lastName: "Shah",
          gender: "MALE",
          image: "person.png",
          middleName: "",
          verifyDate: new Date(),
          isVerified: true,
          fileUrl: "aadhaar.png",
        },
      },
      panCard: {
        create: {
          panCardNo: "DUMMY2002A",
          dateOfBirth: "02-11-2001",
          firstName: "Rohan",
          lastName: "Shah",
          gender: "MALE",
          middleName: "",
          verifyDate: new Date(),
          isVerified: true,
          fileUrl: "pan.png",
          image: "person.png",
        },
      },
      bankAccounts: {
        create: {
          accountHolderName: "Rohan Shah",
          accountNumber: "1000000013",
          bankAccountType: "SAVING",
          bankName: "HDFC",
          branch: "demo city",
          ifscCode: "HDFC9999991",
          verifyDate: new Date(),
          isVerified: true,
          isPrimary: true,
        },
      },
      dematAccounts: {
        create: {
          accountHolderName: "Rohan Shah",
          accountType: "SOLO",
          clientId: "11000002",
          depositoryName: "NSDL",
          depositoryParticipantName: "Rohan Shah",
          dpId: "IN110003",
          primaryPanNumber: "DUMMY1003A",
          isPrimary: true,
          verifyDate: new Date(),
          isVerified: true,
        },
      },
      currentAddress: {
        create: {
          cityOrDistrict: "test",
          country: "India",
          fullAddress: "Test registered address",
          line1: "Test line 1",
          line2: "Test line 2",
          line3: "Test line 3",
          pinCode: "1111000",
          postOffice: "test",
          state: "Punjab",
        },
      },
      permanentAddress: {
        create: {
          cityOrDistrict: "test",
          country: "India",
          fullAddress: "Test registered address",
          line1: "Test line 1",
          line2: "Test line 2",
          line3: "Test line 3",
          pinCode: "1111000",
          postOffice: "test",
          state: "Punjab",
        },
      },
    },
  });

  const cbricksManager = new ParticipantManager();
  const res = await cbricksManager.registerParticipant(user.id);
  console.log(res);
};

export const reveryUserCbricks = async () => {
  const cbricksManager = new ParticipantManager();
  const res = await cbricksManager.syncParticipant(263);
  console.log(res);
};
