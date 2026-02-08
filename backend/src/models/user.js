import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },


    role: {
      type: String,
      enum: ["student", "alumni", "admin"],
      default: "student"
    },
    profileImage: {
  type: String,
  default: ""
},

bio: {
  type: String,
  maxlength: 160,
  default: ""
},
department: {
  type: String,
  default: ""
},
graduationYear: {
  type: Number
},

savedPosts: [
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
],

    isVerified: {
      type: Boolean,
      default: false
    },  

    emailOTP: {
      type: String
    },

    emailOTPExpires: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

export default User;
