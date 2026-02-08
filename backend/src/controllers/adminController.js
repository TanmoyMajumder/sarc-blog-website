import Feedback from "../models/Feedback.js";

export const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ feedback });
  } catch (err) {
    res.status(500).json({
      message: "Failed to load feedback"
    });
  }
};
