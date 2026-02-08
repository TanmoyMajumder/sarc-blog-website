import mongoose from "mongoose";

/* ================= REPLY SCHEMA ================= */
const replySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  text: {
    type: String,
    required: true,
  },

  // ✅ LIKE ON REPLY (IMPORTANT)
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* ================= COMMENT SCHEMA ================= */
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  text: {
    type: String,
    required: true,
  },

  // ✅ LIKE ON COMMENT
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  // ✅ NESTED REPLIES
  replies: [replySchema],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* ================= POST SCHEMA ================= */
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    images: {
      type: [String],
      default: [],
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // (optional legacy likes – safe to keep)
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ✅ POST EMOJI REACTIONS
    reactions: {
      heart: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      like: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      clap: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      fire: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },

    // ✅ COMMENTS
    comments: [commentSchema],
  },
  { timestamps: true } // for "2 hours ago"
);

const Post = mongoose.model("Post", postSchema);
export default Post;
