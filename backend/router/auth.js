import express from "express";
import passport from "../middleware/passport.js";

const router = express.Router();

// Google OAuth login route
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback route
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect to frontend
    res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
  }
);

// Logout route
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    // Clear the session completely
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error("Session destroy error:", destroyErr);
      }
      // Clear the session cookie
      res.clearCookie("connect.sid"); // Default session cookie name
      res.json({ message: "Logged out successfully" });
    });
  });
});

// Get current user route
router.get("/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

export default router;
