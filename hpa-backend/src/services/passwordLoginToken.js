const ISSUER = "hpa-password-login";
const AUDIENCE = "hpa-survey-api";
const TOKEN_TTL = "12h";

let joseModulePromise;

function loadJose() {
  if (!joseModulePromise) {
    joseModulePromise = import("jose");
  }
  return joseModulePromise;
}

function getSecretKey() {
  const secret =
    process.env.LOGIN_TOKEN_SECRET?.trim() || "hpa-dev-login-secret-change-me";
  return new TextEncoder().encode(secret);
}

async function signPasswordLoginToken({ email, name }) {
  const { SignJWT } = await loadJose();
  return new SignJWT({ email, name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecretKey());
}

async function verifyPasswordLoginToken(token) {
  const { jwtVerify } = await loadJose();
  const { payload } = await jwtVerify(token, getSecretKey(), {
    issuer: ISSUER,
    audience: AUDIENCE,
    clockTolerance: "60s"
  });

  const email =
    typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  if (!email) {
    throw new Error("Token does not contain a user email.");
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";

  return {
    oid: "",
    email,
    name,
    claims: payload,
    passwordLogin: true
  };
}

module.exports = {
  signPasswordLoginToken,
  verifyPasswordLoginToken
};
