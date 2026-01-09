import cron from "node-cron";
import { revalidateBonds } from "./scrap_bonds/revalidate_bonds";
import { NseRfqManager } from "@services/refq/nse/nseisin_manager.service";

// Schedule to run every day at 8:00 AM and 8:00 PM
cron.schedule("0 8,20 * * *", async () => {
  try {
    console.log("Running task at 8:00 AM and 8:00 PM every day");
    const isinManger = new NseRfqManager();
    await isinManger.syneIsinDB();
  } catch (error) {
    console.error(error);
  }
});

// Schedule to run every day at 9:00 AM (IST / Asia/Kolkata)
cron.schedule(
  "0 9 * * *",
  async () => {
    try {
      console.log("Running task at 9:00 AM every day (Asia/Kolkata)");
      await revalidateBonds();
    } catch (error) {
      console.error(error);
    }
  },
  { timezone: "Asia/Kolkata" }
);
