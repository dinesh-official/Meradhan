import { db } from "@core/database/database";

const userData = async (userId: string) => {
  const data = await db.dataBase.customerProfileDataModel.findFirst({
    where: {
      userName: userId,
    },
    select: {
      userName: true,
      id: true,
      kycStatus: true,
      kraStatus: true,
      firstName: true,
      lastName: true,
    },
  });
  const kyc = await db.dataBase.kYC_FLOW.findFirst({
    where: {
      userID: data?.id,
    },
    select: {
      id: true,
      userID: true,
    },
  });
  console.log(`============${data?.firstName} ${data?.lastName}==============`);
  console.log(`KYCID: ${kyc?.id}`);
  console.log(`UserId: ${kyc?.userID}`);
  console.log(`UserName: ${userId}`);
};

await userData("MDWI547MN");
await userData("MDXY0R2XN");
await userData("MDQ14VEWN");
await userData("MDPK3LNWN");
