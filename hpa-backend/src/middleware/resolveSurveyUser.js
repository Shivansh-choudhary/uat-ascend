const User = require("../models/User");
const azureAuth = require("../config/azureAuth");

async function resolveSurveyUser(req, res, next) {
  if (azureAuth.authDisabled) {
    const email =
      typeof req.body?.userData?.email === "string"
        ? req.body.userData.email.trim().toLowerCase()
        : typeof req.query?.email === "string"
          ? req.query.email.trim().toLowerCase()
          : "";

    if (!email) {
      return res.status(400).json({
        message: "Email is required when authentication is disabled."
      });
    }

    req.surveyUserEmail = email;
    return next();
  }

  if (!req.auth?.email) {
    return res.status(401).json({
      message: "Authenticated user email is required."
    });
  }

  req.surveyUserEmail = req.auth.email;
  return next();
}

async function loadSurveyUserDocument(req, res, next) {
  try {
    const user = await User.findOne({ email: req.surveyUserEmail });
    req.surveyUser = user;
    return next();
  } catch (error) {
    console.error("[Auth] Failed to load survey user:", {
      email: req.surveyUserEmail,
      error: error.message
    });
    return res.status(500).json({
      message: "Failed to load user record.",
      error: error.message
    });
  }
}

module.exports = {
  resolveSurveyUser,
  loadSurveyUserDocument
};
