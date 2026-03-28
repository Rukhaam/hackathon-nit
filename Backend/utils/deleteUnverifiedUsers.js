import cron from "node-cron";
import { deleteOldUnverifiedUsers } from "../models/userModel.js";

export const startCronJobs = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("🧹 [CRON] Running hourly cleanup: Checking for expired unverified users...");
    
    try {
      const result = await deleteOldUnverifiedUsers();
      
      if (result.affectedRows > 0) {
        console.log(`✅ [CRON] Cleanup complete: Deleted ${result.affectedRows} unverified user(s).`);
      }
    } catch (error) {
      console.error("❌ [CRON] Error during cleanup:", error);
    }
  });

  console.log("⏱️ Background Cron Jobs initialized.");
};