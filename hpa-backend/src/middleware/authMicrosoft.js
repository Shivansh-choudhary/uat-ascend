const azureAuth = require("../config/azureAuth");
const User = require("../models/User");
const {
  USER_ROLES,
  isAdminRole,
  isSuperAdminRole
} = require("../constants/userRoles");

/** jose v5+ is ESM-only — load via dynamic import from CommonJS. */
let joseModulePromise;

function loadJose() {
  if (!joseModulePromise) {
    joseModulePromise = import("jose");
  }
  return joseModulePromise;
}

let jwks;

async function getJwks() {
  const { createRemoteJWKSet } = await loadJose();
  if (!jwks && azureAuth.jwksUri) {
    jwks = createRemoteJWKSet(new URL(azureAuth.jwksUri));
  }
  return jwks;
}

function extractEmail(payload) {
  const raw =
    payload.preferred_username ||
    payload.email ||
    payload.upn ||
    payload.unique_name ||
    "";

  return typeof raw === "string" ? raw.trim().toLowerCase() : "";
}

function extractName(payload) {
  const raw = payload.name || payload.given_name || "";
  return typeof raw === "string" ? raw.trim() : "";
}

function isEmailDomainAllowed(email) {
  if (azureAuth.allowedEmailDomains.length === 0) {
    return true;
  }
  const atIndex = email.lastIndexOf("@");
  if (atIndex === -1) {
    return false;
  }
  const domain = email.slice(atIndex + 1);
  return azureAuth.allowedEmailDomains.includes(domain);
}

async function verifyBearerToken(token) {
  const { jwtVerify } = await loadJose();
  const { payload } = await jwtVerify(token, await getJwks(), {
    issuer: azureAuth.issuer,
    audience: azureAuth.clientId
  });

  const email = extractEmail(payload);
  if (!email) {
    throw new Error("Token does not contain a user email.");
  }
  if (!isEmailDomainAllowed(email)) {
    throw new Error("Email domain is not allowed.");
  }

  return {
    oid: typeof payload.oid === "string" ? payload.oid : "",
    email,
    name: extractName(payload),
    claims: payload
  };
}

function readBearerToken(req) {
  const header = req.headers.authorization;
  if (typeof header !== "string" || !header.startsWith("Bearer ")) {
    return null;
  }
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

async function requireMicrosoftAuth(req, res, next) {
  if (azureAuth.authDisabled) {
    req.auth = {
      oid: "",
      email: "",
      name: "",
      isAdmin: false,
      claims: null,
      bypassed: true
    };
    return next();
  }

  if (!azureAuth.isConfigured) {
    return res.status(503).json({
      message: "Authentication is not configured on the server."
    });
  }

  const token = readBearerToken(req);
  if (!token) {
    return res.status(401).json({
      message: "Authorization Bearer token is required."
    });
  }

  try {
    req.auth = await verifyBearerToken(token);
    return next();
  } catch (error) {
    console.error("[Auth] Token verification failed:", {
      message: error.message
    });
    return res.status(401).json({
      message: "Invalid or expired token.",
      error: error.message
    });
  }
}

async function requireAdmin(req, res, next) {
  if (azureAuth.authDisabled) {
    return next();
  }

  const email = req.auth?.email;
  if (!email) {
    return res.status(401).json({
      message: "Authenticated user email is required."
    });
  }

  try {
    const user = await User.findOne({ email }).select("role");
    const role = user?.role ?? USER_ROLES.USER;
    const isDbAdmin = isAdminRole(role);
    const isEnvBootstrapAdmin =
      azureAuth.adminEmails.has(email) || azureAuth.superAdminEmails.has(email);

    if (!isDbAdmin && !isEnvBootstrapAdmin) {
      return res.status(403).json({
        message: "Admin access required."
      });
    }

    req.auth.isAdmin = true;
    req.auth.isSuperAdmin =
      isSuperAdminRole(role) || azureAuth.superAdminEmails.has(email);
    req.auth.role = role;
    return next();
  } catch (error) {
    console.error("[Auth] Failed to resolve admin role:", {
      email,
      message: error.message
    });
    return res.status(500).json({
      message: "Failed to verify admin access.",
      error: error.message
    });
  }
}

/** Super-admin-only routes — wire when you define what super_admin can do. */
async function requireSuperAdmin(req, res, next) {
  if (azureAuth.authDisabled) {
    return next();
  }

  const email = req.auth?.email;
  if (!email) {
    return res.status(401).json({
      message: "Authenticated user email is required."
    });
  }

  try {
    const user = await User.findOne({ email }).select("role");
    const role = user?.role ?? USER_ROLES.USER;
    const isDbSuperAdmin = isSuperAdminRole(role);
    const isEnvBootstrapSuperAdmin = azureAuth.superAdminEmails.has(email);

    if (!isDbSuperAdmin && !isEnvBootstrapSuperAdmin) {
      return res.status(403).json({
        message: "Super admin access required."
      });
    }

    req.auth.isSuperAdmin = true;
    req.auth.isAdmin = true;
    req.auth.role = role;
    return next();
  } catch (error) {
    console.error("[Auth] Failed to resolve super admin role:", {
      email,
      message: error.message
    });
    return res.status(500).json({
      message: "Failed to verify super admin access.",
      error: error.message
    });
  }
}

module.exports = {
  requireMicrosoftAuth,
  requireAdmin,
  requireSuperAdmin,
  verifyBearerToken
};
