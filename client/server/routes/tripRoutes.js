import express from "express";

import { generateTrip } from "../controllers/tripController.js";
import { saveTrip } from "../controllers/tripSaveController.js";

const router = express.Router();

router.post("/generate", generateTrip);

router.post("/save", saveTrip);

export default router;