import express from "express";
import {
  createPost,
  getAllPosts,
  toggleLikePost,
  addComment,
} from "../controllers/postController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllPosts);
router.post("/", protect, createPost);
router.post("/:id/like", protect, toggleLikePost);
router.post("/:id/comment", protect, addComment);

export default router;
