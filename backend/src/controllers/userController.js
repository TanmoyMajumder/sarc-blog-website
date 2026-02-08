import User from "../models/user.js";
import Post from "../models/post.js";

/* ================= PROFILE IMAGE ================= */
export const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imagePath },
      { new: true }
    ).select("name profileImage");

   res.json({
  profileImage: user.profileImage,
  userId: user._id,
});

  } catch (err) {
    console.error("PROFILE IMAGE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= BASIC PROFILE INFO ================= */
export const updateProfileInfo = async (req, res) => {
  try {
    const { name, bio, department, graduationYear } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    user.bio = bio || "";
    user.department = department || "";
    user.graduationYear = graduationYear || user.graduationYear;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        bio: user.bio,
        department: user.department,
        graduationYear: user.graduationYear,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    console.error("PROFILE INFO ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= PROFILE STATS ================= */
export const getProfileStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const blogsWritten = await Post.countDocuments({ author: userId });

    res.json({
      blogsWritten,
      bookmarks: req.user.savedPosts.length,
    });
  } catch (err) {
    console.error("PROFILE STATS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= PUBLIC PROFILE ================= */
export const getPublicProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select(
      "name bio profileImage role department graduationYear createdAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const blogs = await Post.find({ author: user._id })
      .select("title createdAt")
      .sort({ createdAt: -1 });

    res.json({ user, blogs });
  } catch (err) {
    console.error("PUBLIC PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

