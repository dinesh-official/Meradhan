// import { ParticipantManager } from "@services/refq/nse/cbrics_manager.service";

import { db } from "@core/database/database";
import { NSDLApi } from "kyc-providers";

// import { revalidateBonds } from "@jobs/cron/scrap_bonds/revalidate_bonds";

// // Initialize
// const kycManager = new ParticipantManager();

// // Save KYC data to customer
// const data = await kycManager.getAllParticipants();

// console.log(data);

// await revalidateBonds();

// const bonds = await db.dataBase.bonds.findMany({
//     where: {
//         categories: { has: "perpetual" },
//         // isListed: { equals: "YES" },
//         redemptionDate: { gte: new Date() },
//         creditRating: { notIn: ["D", "C"] },

//     }
// });

// console.log(bonds.length);


// const nsdlApi = new NSDLApi(
//     "NR100013",
//     "06b2d035ad7d2f12c5d339bec39d58d4fc6e",
//     false
// ); // false = test mode

// const response = await nsdlApi.("INE848L07024");