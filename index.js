require("dotenv").config();
const connectDB = require("./src/configs/mongodb");
const app = require("./src/app");

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

(async () => {
  try {
    console.log(process.env.MONGODB_URI);
    await connectDB();

    app.listen(3000, () => {
      console.log("application running...");
    });
  } catch (err) {
    console.error("Failed to start application:", err);
    process.exit(1);
  }
})();
