// 🔐 LOAD ENV FIRST (ESM SAFE)
import "./env.js";

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";

// load passport strategies AFTER env
import "./config/passport.js";

// routes
import authroutes from "./routes/authroutes.js";
import postRoutes from "./routes/postRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ================= MIDDLEWARES ================= */

// ✅ SAME-ORIGIN SETUP (Option 1)
app.use(cors({ origin: true, credentials: true }));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// ✅ SERVE FRONTEND (ONCE, AFTER MIDDLEWARE)
app.use(express.static(path.join(__dirname, "../../frontend")));

/* ================= API ROUTES ================= */
app.use("/api/v1/auth", authroutes);
app.use("/api/v1/posts", postRoutes);

/* ================= HEALTH ================= */
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");

    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Mongo error", err);
    process.exit(1);
  }
};

start();
