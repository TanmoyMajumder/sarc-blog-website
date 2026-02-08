import express from "express";
import multer from "multer";
import Post from "../models/post.js";
import {
  createPost,
  getAllPosts,
  addComment,
  deletePost,
  deleteComment,
  reactToPost,
  toggleLikeComment,
  addReply,
  toggleLikeReply,   
  deleteReply, 
} from "../controllers/postController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { toggleSavePost } from "../controllers/postController.js";

const router = express.Router();

/* ================= MULTER ================= */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

/* ================= POSTS ================= */

// get all posts
router.get("/", getAllPosts);

// create post
router.post("/", protect, upload.array("images", 5), createPost);

// react to post
router.post("/:id/react", protect, reactToPost);

// delete post
router.delete("/:id", protect, deletePost);

/* ================= COMMENTS ================= */

// add comment
router.post("/:id/comment", protect, addComment);

// like / unlike comment
router.post("/:postId/comment/:commentId/like", protect, toggleLikeComment);

// add reply to comment (NESTED)
router.post("/:postId/comment/:commentId/reply", protect, addReply);

// delete comment
router.delete("/:postId/comment/:commentId", protect, deleteComment);
// like / unlike reply (NESTED LEVEL 2)
router.post(
  "/:postId/comment/:commentId/reply/:replyId/like",
  protect,
  toggleLikeReply
);
// delete reply (owner only)
router.delete(
  "/:postId/comment/:commentId/reply/:replyId",
  protect,
  deleteReply
);
router.post("/:id/save", protect, toggleSavePost);


/* ================= SINGLE POST (LAST) ================= */

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "_id name")
      .populate("comments.user", "_id name")
      .populate("comments.likes", "_id name")
      .populate("comments.replies.user", "_id name")
      .populate("reactions.like", "_id name")
      .populate("reactions.heart", "_id name")
      .populate("reactions.clap", "_id name")
      .populate("reactions.fire", "_id name");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ post });
  } catch (err) {
    console.error("GET SINGLE POST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
