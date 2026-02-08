import express from "express";
import multer from "multer";
import { protect } from "../middlewares/authMiddleware.js";
import {
  updateProfileImage,
  updateProfileInfo,
  getProfileStats,
  getPublicProfile,
} from "../controllers/userController.js";

const router = express.Router();

/* MULTER */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* ROUTES */
router.post(
  "/profile-image",
  protect,
  upload.single("image"),
  updateProfileImage
);

router.put("/profile", protect, updateProfileInfo);
router.get("/stats", protect, getProfileStats);
router.get("/public/:id", getPublicProfile);

export default router;
