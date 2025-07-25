import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import passport from "./middleware/passport.js";
import cors from "cors";

// routes
import authRoutes from "./router/auth.js";
import userRoutes from "./router/userRoute.js";
import productRoutes from "./router/productRoute.js";
import galleryRoutes from "./router/galleryRoute.js";
import cartRoutes from "./router/cartRoute.js";
import orderRoutes from "./router/orderRoute.js";
import adminRoutes from "./router/adminRoute.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/admin", adminRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Bias Clothing API Server" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
