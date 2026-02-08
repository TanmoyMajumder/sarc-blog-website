import express from "express";
import jwt from "jsonwebtoken";
import { adminProtect } from "../middlewares/adminProtect.js";
import { getAllFeedback } from "../controllers/adminController.js";
const router = express.Router();

/* ================= ADMIN LOGIN ================= */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      message: "Invalid admin credentials"
    });
  }

  // ✅ Create admin token
  const token = jwt.sign(
    { admin: true },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: "8h" }
  );

  // ✅ Clear any old admin cookie
  res.clearCookie("adminToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });

  // ✅ Set admin cookie
  res.cookie("adminToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  });

  return res.json({
    message: "Admin login successful"
  });
});
router.get("/feedback", adminProtect, getAllFeedback);

export default router;
