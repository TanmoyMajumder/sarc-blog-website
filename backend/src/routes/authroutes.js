
import User from "../models/user.js";

import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

import { protect } from "../middlewares/authMiddleware.js";
import { registerUser, loginUser } from "../controllers/authcontroller.js";

console.log("✅ authroutes.js loaded");

const router = express.Router();

/* ================= TEST ================= */
router.get("/test", (req, res) => {
  res.json({ message: "AUTH ROUTES WORKING" });
});

/* ================= NORMAL AUTH ================= */
router.post("/register", registerUser);
router.post("/login", loginUser);

/* ================= VERIFY OTP ================= */
/* ================= VERIFY OTP ================= */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required"
      });
    }

    const user = await User.findOne({
      email,
      emailOTP: otp,
      emailOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    // ✅ VERIFY USER
    user.isVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpires = undefined;
    await user.save();

    // ✅ AUTO LOGIN: CREATE JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ SEND COOKIE
res.clearCookie("token", {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  path: "/",
});

res.cookie("token", token, {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  path: "/",                      // 🔥 IMPORTANT
  maxAge: 7 * 24 * 60 * 60 * 1000
});

    return res.json({
      message: "Email verified and logged in"
    });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
});


/* ================= GOOGLE AUTH ================= */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

res.clearCookie("token", {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  path: "/",
});

res.cookie("token", token, {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  path: "/",                      // 🔥 IMPORTANT
  maxAge: 7 * 24 * 60 * 60 * 1000
});


res.redirect("/app.html");
  }
);

/* ================= CURRENT USER ================= */
router.get("/me", protect, (req, res) => {
  res.json({
    user: req.user
  });
});
/* ================= LOGOUT ================= */
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });

  res.json({ message: "Logged out successfully" });
});


export default router;
