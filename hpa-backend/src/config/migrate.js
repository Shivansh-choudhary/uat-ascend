const User = require("../models/User");
const { USER_ROLES } = require("../constants/userRoles");

/** One-time-safe: backfill role for users created before the role field existed. */
async function runStartupMigrations() {
  const result = await User.updateMany(
    { role: { $exists: false } },
    { $set: { role: USER_ROLES.USER } }
  );

  if (result.modifiedCount > 0) {
    console.log(
      `[Migrate] Backfilled role="${USER_ROLES.USER}" on ${result.modifiedCount} user(s).`
    );
  }
}

module.exports = { runStartupMigrations };
