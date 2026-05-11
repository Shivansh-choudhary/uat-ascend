const express = require("express");
const SurveyResponse = require("../models/SurveyResponse");

const router = express.Router();

router.post("/responses", async (req, res) => {
  console.log("[Survey][POST] /responses payload summary:", {
    userEmail: req.body?.userData?.email ?? null,
    userName: req.body?.userData?.name ?? null,
    answersCount: Array.isArray(req.body?.questionsAnswered)
      ? req.body.questionsAnswered.length
      : 0,
    categoryCount: Array.isArray(req.body?.categoryResults?.categories)
      ? req.body.categoryResults.categories.length
      : 0
  });

  try {
    const savedResponse = await SurveyResponse.create(req.body);
    console.log("[Survey][POST] /responses saved to DB:", {
      id: savedResponse._id?.toString?.() ?? null,
      createdAt: savedResponse.createdAt ?? null,
      userEmail: savedResponse.userData?.email ?? null
    });

    return res.status(201).json({
      message: "Survey response saved.",
      data: savedResponse
    });
  } catch (error) {
    console.error("[Survey][POST] /responses failed:", {
      error: error.message,
      details: error?.errors
        ? Object.fromEntries(
            Object.entries(error.errors).map(([key, value]) => [
              key,
              value?.message ?? "Invalid value"
            ])
          )
        : undefined
    });

    return res.status(400).json({
      message: "Failed to save survey response.",
      error: error.message,
      details: error?.errors
        ? Object.fromEntries(
            Object.entries(error.errors).map(([key, value]) => [
              key,
              value?.message ?? "Invalid value"
            ])
          )
        : undefined
    });
  }
});

router.get("/responses", async (_req, res) => {
  try {
    const responses = await SurveyResponse.find().sort({ createdAt: -1 });
    console.log("[Survey][GET] /responses fetched from DB:", {
      total: responses.length
    });
    return res.status(200).json({ data: responses });
  } catch (error) {
    console.error("[Survey][GET] /responses failed:", {
      error: error.message
    });
    return res.status(500).json({
      message: "Failed to fetch survey responses.",
      error: error.message
    });
  }
});

router.get("/responses/status", async (req, res) => {
  const email = typeof req.query.email === "string" ? req.query.email.trim() : "";

  if (!email) {
    return res.status(400).json({
      message: "Query parameter 'email' is required."
    });
  }

  try {
    const existingResponse = await SurveyResponse.findOne({
      "userData.email": email.toLowerCase()
    })
      .sort({ createdAt: -1 })
      .select("_id createdAt userData.email");

    const hasCompleted = Boolean(existingResponse);
    console.log("[Survey][GET] /responses/status checked:", {
      email: email.toLowerCase(),
      hasCompleted
    });

    return res.status(200).json({
      hasCompleted,
      latestSubmission: existingResponse
        ? {
            id: existingResponse._id,
            createdAt: existingResponse.createdAt,
            email: existingResponse.userData?.email ?? null
          }
        : null
    });
  } catch (error) {
    console.error("[Survey][GET] /responses/status failed:", {
      email: email.toLowerCase(),
      error: error.message
    });
    return res.status(500).json({
      message: "Failed to check survey status.",
      error: error.message
    });
  }
});

module.exports = router;
