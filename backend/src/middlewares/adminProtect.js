import jwt from "jsonwebtoken";

export const adminProtect = (req, res, next) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({
        message: "Admin not authenticated"
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.ADMIN_JWT_SECRET
    );

    if (!decoded.admin) {
      return res.status(403).json({
        message: "Invalid admin token"
      });
    }

    req.admin = true;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Admin authentication failed"
    });
  }
};
