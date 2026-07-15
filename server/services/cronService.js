const cron = require("node-cron");
const User = require("../models/user");

const initCronJobs = () => {
  // Run daily at midnight: 0 0 * * *
  cron.schedule("0 0 * * *", async () => {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() - 7);

      const result = await User.updateMany(
        {},
        { $pull: { bookings: { endDate: { $lt: expiryDate } } } }
      );

      console.log(`[Cron] Expired bookings older than 7 days deleted. Modified users: ${result.modifiedCount}`);
    } catch (err) {
      console.error("[Cron] Error deleting expired bookings:", err);
    }
  });
  
  console.log("Cron jobs initialized.");
};

module.exports = { initCronJobs };
