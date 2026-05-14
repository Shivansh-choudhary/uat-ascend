const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/db");
// dns is needed for new version of node
// const dns = require("node:dns/promises");
// dns.setServers(["1.1.1.1"]);
dotenv.config();

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
