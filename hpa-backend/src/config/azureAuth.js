const tenantId = process.env.AZURE_TENANT_ID?.trim() ?? "";
const clientId = process.env.AZURE_CLIENT_ID?.trim() ?? "";
const authDisabled = process.env.AUTH_DISABLED === "true";

function parseCsv(value) {
  if (!value?.trim()) {
    return [];
  }
  return value
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

const allowedEmailDomains = parseCsv(process.env.AZURE_ALLOWED_EMAIL_DOMAINS);
const adminEmails = new Set(parseCsv(process.env.AZURE_ADMIN_EMAILS));
const superAdminEmails = new Set(parseCsv(process.env.AZURE_SUPER_ADMIN_EMAILS));

const isConfigured = Boolean(tenantId && clientId);

const issuer = tenantId
  ? `https://login.microsoftonline.com/${tenantId}/v2.0`
  : "";

const jwksUri = tenantId
  ? `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`
  : "";

module.exports = {
  tenantId,
  clientId,
  authDisabled,
  isConfigured,
  issuer,
  jwksUri,
  allowedEmailDomains,
  adminEmails,
  superAdminEmails
};
