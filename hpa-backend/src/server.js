const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/db");
const { runStartupMigrations } = require("./config/migrate");
const azureAuth = require("./config/azureAuth");
// dns is needed for new version of node
// const dns = require("node:dns/promises");
// dns.setServers(["1.1.1.1"]);
dotenv.config();

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await connectDB();
    await runStartupMigrations();

    if (azureAuth.authDisabled) {
      console.warn("[Auth] AUTH_DISABLED=true — JWT verification is OFF. Do not use in production.");
    } else if (!azureAuth.isConfigured) {
      console.warn(
        "[Auth] AZURE_TENANT_ID and AZURE_CLIENT_ID are required. Survey API will return 503 until set."
      );
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
