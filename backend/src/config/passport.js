import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import mongoose from "mongoose";
import UserSchema from "../models/user.js";

// 🔒 Prevent model overwrite on nodemon reload
const User =
  mongoose.models.User || mongoose.model("User", UserSchema);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
callbackURL: "/api/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            password: "google-oauth",
          });
        }

        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);
