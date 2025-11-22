// // import { NseCBRICS } from "@modules/RFQ/nse/nse_CBRICS";
// // import { NseRfq } from "@modules/RFQ/nse/nse_RFQ";
// // // import { NseRfq } from "@modules/RFQ/nse/nse_RFQ";
// // import { ParticipantManager } from "@services/refq/nse/cbrics_manager.service";

import { revalidateBonds } from "@jobs/cron/scrap_bonds/revalidate_bonds";

// import { addKraWorkerJob } from "@jobs/kra_worker/kraWroker.helper";

// // import { CustomerKycManager } from "@services/customer/kyc/customer_kyc_manager.service";

// // import { NseRfq } from "@modules/RFQ/nse/nse_RFQ";

// // import { NseCBRICS } from "@modules/RFQ/nse/nse_CBRICS";
// // import { NseRfq } from "@modules/RFQ/nse/nse_RFQ";

// // // import { db } from "@core/database/database";
// // import { NSDLApi } from "kyc-providers";

// // import { revalidateBonds } from "@jobs/cron/scrap_bonds/revalidate_bonds";

// // Initialize
// // const participantManager = new ParticipantManager();
// // const rfqManager = new NseRfq();
// // const cbricsManager = new NseCBRICS();

// // Save KYC data to customer
// // const data = await participantManager.getAllParticipants();

// // console.log(data);

// // console.log(data?.[0]?.loginId);

// // try {
// //     const addIsinToRfq = await rfqManager.createRfq({
// //     segment: "R",
// //     isin: "INE002L08010",
// //     participantCode: "BCISPL",
// //     dealType: "B",
// //     clientCode: "MD123456",
// //     buySell: "B",
// //     quoteType: "Y",
// //     settlementType: 1,
// //     value: 0.2,
// //     quantity: 2,
// //     yieldType: "YTM",
// //     yield: 7.1,
// //     calcMethod: "O",
// //     // price: null,
// //     // valueSell: null,
// //     // quantitySell: null,
// //     // yieldTypeSell: null,
// //     // yieldSell: null,
// //     // calcMethodSell: null,
// //     // priceSell: null,
// //     access: 2,
// //     participantList: ['BCISPL'],
// //     gtdFlag: "Y"
// // });

// // console.log(addIsinToRfq);

// // } catch (error) {
// // console.log(error?.response?.data);

// // }

// // try {
// //     const isins = await rfqManager.getAllRfq({
// //         status: "P"
// //     });

// //     console.log(isins);

// // } catch (error) {
// //     console.log(error.response.data);
// // }

// // try {
// //     const isins = await rfqManager.acceptNegotiationQuote({
// //         rfqNumber: "R25110400000036",
// //         acceptedValue: 0.20,
// //         // id:null,
// //         // acceptedSettlementDate: "05-Nov-2025",
// //         // acceptedYieldType: "YTM",
// //         // acceptedYield: 7.10,
// //         respDealType: "D",
// //         respClientCode: "BCISPL",
// //     });

// //     console.log(isins);

// // } catch (error) {
// //     console.log(error?.response?.data);
// // }

// // try {

// //     const isins = await rfqManager.proposeDeal({
// //         ngRfqNumber: "R25110400000036",
// //         ngId: "N25110400000043",
// //         participantCode: "BCISPL",
// //         dealType: "B",
// //         clientCode: "MD123456",
// //         price: 99.50,
// //         accruedInterest: 200,
// //         consideration: 1990200, // price * (acceptedValue * ) + accruedInterest
// //         calcMethod: "O",
// //         role: "I",

// //     });

// //     console.log(isins);

// // } catch (error) {
// //     console.log(error.response.data);
// // }

// // try {

// //     const isins = await rfqManager.acceptOrRejectDeal({
// //         rfqNumber: "R25110400000036",
// //         id: "N25110400000043",
// //         acceptedPrice: 99.50,
// //         // acceptedPutCallDate: "",
// //         acceptedAccruedInterest: 200,
// //         acceptedConsideration: 1990200,
// //         confirmStatus: "PC",
// //     });

// //     console.log(isins);

// // } catch (error) {

// //     console.log(error.response.data);
// // }

// // await revalidateBonds();

// // const bonds = await db.dataBase.bonds.findMany({
// //     where: {
// //         categories: { has: "perpetual" },
// //         // isListed: { equals: "YES" },
// //         redemptionDate: { gte: new Date() },
// //         creditRating: { notIn: ["D", "C"] },

// //     }
// // });

// // console.log(bonds.length);

// // const nsdlApi = new NSDLApi(
// //     "NR100013",
// //     "06b2d035ad7d2f12c5d339bec39d58d4fc6e",
// //     false
// // ); // false = test mode

// // const response = await nsdlApi.("INE848L07024");

// // const response = await cbricsManager.getSettlementOrders({
// //     filtFromModSettleDate: "01-11-2025",
// //     filtToModSettleDate: "05-11-2025",
// // })

// // console.log("response:", response);

// // const response = await rfqManager.getAllNegotiations({

// // })

// // console.log("response:", response);

// // const data = await rfqManager.getAllNegotiations({});
// // console.log(data.length);

// // const manager = new CustomerKycManager();

// // const data = await manager.saveKycToCustomer(105);
// // console.log(data);

// const kraJob = async () => {
//   await addKraWorkerJob({
//     customerId: 112,
//     kycDataStoreId: 175,
//     stage: "ENQUIRY_KRA",
//   });
// };

// kraJob();

await revalidateBonds();
