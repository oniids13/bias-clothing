import express from "express";
import passport from "../middleware/passport.js";

const router = express.Router();

// Google OAuth login route (with state)
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], state: true })
);

// Google OAuth callback route with session fixation protection
router.get("/google/callback", (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: "/login" },
    (err, user) => {
      const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
      if (err || !user) {
        return res.redirect(`${frontendUrl}?auth=failed`);
      }
      // Regenerate session to prevent session fixation
      req.session.regenerate((regenErr) => {
        if (regenErr) {
          return res.redirect(`${frontendUrl}?auth=failed`);
        }
        req.login(user, (loginErr) => {
          if (loginErr) {
            return res.redirect(`${frontendUrl}?auth=failed`);
          }
          return res.redirect(`${frontendUrl}?auth=success`);
        });
      });
    }
  )(req, res, next);
});

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
      // Clear the session cookie (match configured name)
      res.clearCookie("sid");
      res.json({ message: "Logged out successfully" });
    });
  });
});

// Get current user route (return only safe fields)
router.get("/user", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const { id, email, name, avatar, role, createdAt } = req.user || {};
  return res.json({ id, email, name, avatar, role, createdAt });
});

export default router;
