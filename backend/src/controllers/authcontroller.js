import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { sendOTP } from "../utils/sendOTP.js";
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("savedPosts.post", "_id title author");

  res.json({ user });
};

/* ================= REGISTER ================= */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1️⃣ Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // 2️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // 🔁 Option A: Resend OTP if not verified
      if (!existingUser.isVerified) {
        await sendOTP(existingUser.email, existingUser._id);

        return res.status(200).json({
          message: "Account exists but not verified. OTP resent to email."
        });
      }

      // ❌ Already verified user
      return res.status(409).json({
        message: "User already exists and is verified. Please login."
      });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "student"
    });

    // 5️⃣ Send OTP
    await sendOTP(user.email, user._id);

    return res.status(201).json({
      message: "Registration successful. OTP sent to email."
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};

/* ================= LOGIN ================= */

export const loginUser = async (req, res) => {
  try {
    console.log("LOGIN BODY:", req.body);

    const { email, password } = req.body;

    // 1️⃣ Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // 2️⃣ Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // 🔒 BLOCK LOGIN IF EMAIL NOT VERIFIED
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email via OTP before logging in."
      });
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // 4️⃣ Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5️⃣ Send token in HTTP-only cookie
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

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};
