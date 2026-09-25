import express from "express";

import {
  saveTrip,
  getSavedTrips,
  deleteSavedTrip,
} from "../controllers/tripSaveController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/*
  All saved-trip routes require
  a valid JWT token.
*/

// Save a trip
router.post(
  "/save",
  protect,
  saveTrip
);

// Get logged-in user's trips
router.get(
  "/user",
  protect,
  getSavedTrips
);

// Delete user's own trip
router.delete(
  "/:id",
  protect,
  deleteSavedTrip
);

export default router;