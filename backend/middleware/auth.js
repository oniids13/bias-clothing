// Middleware to check if user is authenticated
export const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({
    success: false,
    message: "Authentication required. Please login to continue.",
  });
};

// Middleware to check if user is authenticated and return user info
export const checkAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    req.userId = req.user.id; // Add userId to request object for easy access
    return next();
  }

  res.status(401).json({
    success: false,
    message: "Authentication required. Please login to continue.",
  });
};

// Optional auth middleware - doesn't block if not authenticated
export const optionalAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    req.userId = req.user.id;
  }
  next();
};
