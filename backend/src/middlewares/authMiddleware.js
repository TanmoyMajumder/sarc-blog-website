import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protect = async (req, res, next) => {
  try {
    console.log("🍪 Cookies received:", req.cookies);

    const token = req.cookies.token;

    if (!token) {
      console.log("❌ No token found");
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔓 Decoded token:", decoded);

    const user = await User.findById(decoded.id).select("-password");
    console.log("👤 User from DB:", user?.email, user?._id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ AUTH ERROR:", error.message);
    return res.status(401).json({ message: "Not authorized" });
  }
};
