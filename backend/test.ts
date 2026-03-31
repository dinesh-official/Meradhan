import { db } from "@core/database/database";

const runDemo = async () => {
  const user = await db.dataBase.customerProfileDataModel.update({
    where: {
     userName:"MDQV2X0SN",
    },
    data:{
      kycStatus:"VERIFIED",
      kraStatus:"VERIFIED",
    }

  });
  console.log(user);
};

await runDemo();