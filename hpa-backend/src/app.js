const express = require("express");
const cors = require("cors");


const surveyRoutes = require("./routes/surveyRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  const startedAt = Date.now();
  console.log(
    `[API] ${req.method} ${req.originalUrl} received at ${new Date(
      startedAt,
    ).toISOString()}`,
  );
  next();
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/surveys", surveyRoutes);

module.exports = app;
