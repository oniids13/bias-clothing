import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import passport from "./middleware/passport.js";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import csurf from "csurf";
import RedisStore from "connect-redis";
import { createClient as createRedisClient } from "redis";
import { cleanEnv, str, bool } from "envalid";

// routes
import authRoutes from "./router/auth.js";
import userRoutes from "./router/userRoute.js";
import productRoutes from "./router/productRoute.js";
import galleryRoutes from "./router/galleryRoute.js";
import cartRoutes from "./router/cartRoute.js";
import orderRoutes from "./router/orderRoute.js";
import adminRoutes from "./router/adminRoute.js";

dotenv.config();

// Validate environment
const env = cleanEnv(process.env, {
  NODE_ENV: str({ default: "development" }),
  CLIENT_URL: str(),
  SESSION_SECRET: str(),
  ENABLE_CSRF: bool({ default: false }),
  REDIS_URL: str({ default: "" }),
});

const app = express();

// Basic security hardening
app.disable("x-powered-by");
app.set("trust proxy", 1);

// Global middleware
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token", "Authorization"],
  })
);
app.use(
  helmet({
    contentSecurityPolicy: false, // optional: use dedicated CSP below
    hsts: env.NODE_ENV === "production",
  })
);
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: [
        "'self'",
        env.CLIENT_URL || "http://localhost:5173",
        "https://api.paymongo.com",
      ],
      upgradeInsecureRequests: [],
    },
  })
);
app.use(hpp());
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
});
app.use(apiLimiter);

// Session configuration with optional Redis store
let redisClient = null;
if (env.REDIS_URL) {
  try {
    redisClient = createRedisClient({ url: env.REDIS_URL });
    // Top-level await ok in ESM
    await redisClient.connect();
  } catch (err) {
    console.error("Redis connection failed; falling back to MemoryStore", err);
    redisClient = null;
  }
}

app.use(
  session({
    name: "sid",
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: redisClient ? new RedisStore({ client: redisClient }) : undefined,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Optional CSRF protection (enable via ENABLE_CSRF=true)
if (env.ENABLE_CSRF === true) {
  const csrfProtection = csurf();
  app.use(csrfProtection);
  app.get("/csrf-token", (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });
}

// Routes
app.use("/auth", strictLimiter, authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/admin", strictLimiter, adminRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Bias Clothing API Server" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
