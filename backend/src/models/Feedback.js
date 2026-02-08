import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000
    },
    status: {
      type: String,
      enum: ["Open", "Resolved"],
      default: "Open"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
