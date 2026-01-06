import nodemailer from "nodemailer";
import User from "../models/user.js";

export const sendOTP = async (email, userId) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await User.findByIdAndUpdate(userId, {
    emailOTP: otp,
    emailOTPExpires: Date.now() + 10 * 60 * 1000 // 10 mins
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"SARC Portal" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email - OTP",
    html: `
      <h2>Email Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>Valid for 10 minutes.</p>
    `
  });
};
