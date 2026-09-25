import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import tripRoutes from "./routes/tripRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import savedTripRoutes from "./routes/savedTripRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;


// ===============================
// DATABASE
// ===============================

connectDB();


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(express.json());


// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TripNexus Backend is running 🚀",
  });
});


// ===============================
// HEALTH
// ===============================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "TripNexus API is healthy",
  });
});


// ===============================
// AUTH
// ===============================

app.use(
  "/api/auth",
  authRoutes
);


// ===============================
// AI TRIP GENERATION
// ===============================

app.use(
  "/api/trips",
  tripRoutes
);


// ===============================
// SAVED TRIPS
// ===============================

app.use(
  "/api/saved-trips",
  savedTripRoutes
);


// ===============================
// SERVER
// ===============================

app.listen(PORT, () => {
  console.log(
    `🚀 TripNexus Backend running on http://localhost:${PORT}`
  );
});