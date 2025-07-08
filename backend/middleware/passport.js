import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { Strategy as LocalStrategy } from "passport-local";
import { PrismaClient } from "@prisma/client";
import { validPassword } from "../utils/passwordUtil.js";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });
    done(null, user);
  } catch (error) {
    console.error("Error deserializing user:", error);
    done(error, null);
  }
});

// Helper function to find or create user without transactions
async function findOrCreateUser(googleId, email, name, avatar) {
  try {
    // Try to find existing user by googleId first
    let user = await prisma.user.findUnique({
      where: { googleId: googleId },
    });

    if (user) {
      console.log(`Found existing user by Google ID: ${user.id}`);
      return user;
    }

    // Try to find by email
    user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (user) {
      console.log(`Found user by email, updating with Google ID: ${user.id}`);
      // Update existing user with Google ID
      try {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleId,
            avatar: avatar || user.avatar,
            name: name || user.name,
          },
        });
        return user;
      } catch (updateError) {
        console.log("Update failed, returning existing user");
        return user; // Return existing user if update fails
      }
    }

    // Create new user
    console.log(`Creating new user for email: ${email}`);
    user = await prisma.user.create({
      data: {
        googleId: googleId,
        email: email,
        name: name,
        avatar: avatar,
        role: "CUSTOMER",
      },
    });

    console.log(`Created new user: ${user.id}`);
    return user;
  } catch (error) {
    console.error("Error in findOrCreateUser:", error);

    // If creation failed due to duplicate, try to find the user
    if (error.code === "P2002") {
      console.log("Duplicate error, attempting to find existing user...");

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: email }, { googleId: googleId }],
        },
      });

      if (existingUser) {
        console.log(
          `Found existing user after duplicate error: ${existingUser.id}`
        );
        return existingUser;
      }
    }

    throw error;
  }
}

// Google OAuth Strategy
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Validate required profile data
        if (!profile.id) {
          return done(new Error("Google profile ID is missing"), null);
        }

        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
          return done(new Error("Google profile email is missing"), null);
        }

        const email = profile.emails[0].value;
        const googleId = profile.id;
        const name =
          profile.displayName ||
          (profile.name?.givenName && profile.name?.familyName
            ? `${profile.name.givenName} ${profile.name.familyName}`
            : null);
        const avatar =
          profile.photos && profile.photos[0] ? profile.photos[0].value : null;

        console.log(
          `Google OAuth attempt for email: ${email}, googleId: ${googleId}`
        );

        const user = await findOrCreateUser(googleId, email, name, avatar);
        return done(null, user);
      } catch (error) {
        console.error("Google OAuth Error:", error);
        return done(error, null);
      }
    }
  )
);

// Local Strategy for email/password authentication
passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "email", // Use email instead of username
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user) {
          return done(null, false, {
            message: "No user found with this email",
          });
        }

        // Check if user has local password (not Google-only user)
        if (!user.hash || !user.salt) {
          return done(null, false, {
            message:
              "This account uses Google login. Please sign in with Google.",
          });
        }

        // Validate password
        const isValidPassword = validPassword(password, user.hash, user.salt);

        if (isValidPassword) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Incorrect password" });
        }
      } catch (error) {
        console.error("Local authentication error:", error);
        return done(error);
      }
    }
  )
);

export default passport;
