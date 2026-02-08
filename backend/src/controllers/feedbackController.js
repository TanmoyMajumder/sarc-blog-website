import Feedback from "../models/Feedback.js";

export const submitFeedback = async (req, res) => {
  try {
    const { email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({
        message: "Email and message are required"
      });
    }

    await Feedback.create({
      user: req.user?._id || null,
      email,
      message
    });

    res.status(201).json({
      message: "Feedback submitted successfully"
    });
  } catch (err) {
    console.error("FEEDBACK SUBMIT ERROR:", err);
    res.status(500).json({
      message: "Failed to submit feedback"
    });
  }
};
