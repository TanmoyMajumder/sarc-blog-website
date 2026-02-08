import express from "express";
import { submitFeedback } from "../controllers/feedbackController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, submitFeedback);

export default router;
