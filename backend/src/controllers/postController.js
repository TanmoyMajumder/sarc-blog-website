import Post from "../models/post.js";

/* ================= CREATE POST ================= */
export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    const images =
      req.files && req.files.length
        ? req.files.map(file => `/uploads/${file.filename}`)
        : [];

    const post = await Post.create({
      title,
      content,
      images,
      author: req.user._id,
    });

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (err) {
    console.error("CREATE POST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET ALL POSTS ================= */
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "_id name profileImage")
      .populate("comments.user", "_id name profileImage")
      .populate("comments.likes", "_id name profileImage")
      .populate("comments.replies.user", "_id name profileImage")
      .populate("reactions.like", "_id name profileImage")
      .populate("reactions.heart", "_id name profileImage")
      .populate("reactions.clap", "_id name profileImage")
      .populate("reactions.fire", "_id name profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({ posts });
  } catch (err) {
    console.error("GET POSTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};



/* ================= ADD COMMENT ================= */
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      user: req.user._id,
      text,
    });

    await post.save();

    const populatedPost = await Post.findById(postId).populate(
      "comments.user",
      "_id name profileImage"
    );

    const newComment =
      populatedPost.comments[populatedPost.comments.length - 1];

    res.status(201).json({
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (err) {
    console.error("ADD COMMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= DELETE POST ================= */
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("DELETE POST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= DELETE COMMENT ================= */
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    post.comments = post.comments.filter(
      c => c._id.toString() !== commentId
    );

    await post.save();

    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error("DELETE COMMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= REACT TO POST ================= */
export const reactToPost = async (req, res) => {
  try {
    const { emoji } = req.body;
    const postId = req.params.id;
    const userId = req.user._id.toString();

    if (!emoji) {
      return res.status(400).json({ message: "Emoji required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyReacted = post.reactions[emoji]?.some(
      id => id.toString() === userId
    );

    Object.keys(post.reactions).forEach(key => {
      post.reactions[key] = post.reactions[key].filter(
        id => id.toString() !== userId
      );
    });

    if (!alreadyReacted) {
      post.reactions[emoji].push(userId);
    }

    await post.save();

    const updatedPost = await Post.findById(postId)
.populate("author", "_id name profileImage")
  .populate("comments.user", "_id name profileImage")
  .populate("comments.likes", "_id name profileImage")
  .populate("comments.replies.user", "_id name profileImage") 
  .populate("reactions.like", "_id name profileImage")
  .populate("reactions.heart", "_id name profileImage")
  .populate("reactions.clap", "_id name profileImage")
  .populate("reactions.fire", "_id name profileImage");

    res.json({ post: updatedPost });
  } catch (err) {
    console.error("REACT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= LIKE / UNLIKE COMMENT ================= */
export const toggleLikeComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id.toString();

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const alreadyLiked = comment.likes.some(
      id => id.toString() === userId
    );

    if (alreadyLiked) {
      comment.likes = comment.likes.filter(
        id => id.toString() !== userId
      );
    } else {
      comment.likes.push(userId);
    }

    await post.save();

    res.json({
      likesCount: comment.likes.length,
      liked: !alreadyLiked,
    });
  } catch (err) {
    console.error("COMMENT LIKE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const addReply = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Reply text required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const reply = {
      user: req.user._id,
      text,
    };

    comment.replies.push(reply);
    await post.save();

    const populatedPost = await Post.findById(postId)
      .populate("comments.replies.user", "name _id");

    const updatedComment =
      populatedPost.comments.id(commentId);

    const newReply =
      updatedComment.replies.at(-1);

    res.status(201).json({ reply: newReply });

  } catch (err) {
    console.error("ADD REPLY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const toggleLikeReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;
    const userId = req.user._id.toString();

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    reply.likes ||= [];

    const liked = reply.likes.some(id => id.toString() === userId);

    if (liked) {
      reply.likes = reply.likes.filter(id => id.toString() !== userId);
    } else {
      reply.likes.push(userId);
    }

    await post.save();

    res.json({
      likesCount: reply.likes.length,
      liked: !liked,
    });
  } catch (err) {
    console.error("REPLY LIKE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const deleteReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    if (reply.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    reply.remove();
    await post.save();

    res.json({ message: "Reply deleted" });
  } catch (err) {
    console.error("DELETE REPLY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
/* ================= SAVE / UNSAVE POST ================= */
export const toggleSavePost = async (req, res) => {
  const user = req.user;
  const postId = req.params.id;

  const index = user.savedPosts.findIndex(
    s => s.post.toString() === postId
  );

  let saved;

  if (index > -1) {
    user.savedPosts.splice(index, 1);
    saved = false;
  } else {
    user.savedPosts.push({
      post: postId,
      savedAt: new Date(),
    });
    saved = true;
  }

  await user.save();

  res.json({ saved });
};

