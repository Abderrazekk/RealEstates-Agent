import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import session from "express-session";
import passport from "passport";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import meetingRoutes from "./routes/meeting.routes.js";
import { testEmailConfig } from "./utils/emailService.js";

// Load environment variables FIRST
dotenv.config();

// ES6 fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false, // Disable X-Forwarded-For validation
  },
});

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from uploads directory - MOVE THIS HERE
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Import passport config
import "./config/passport.js";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import seedAdmin from "./utils/seedAdmin.js";

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/meetings", meetingRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Something went wrong!",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.error(
        "❌ MONGODB_URI is not defined! Set it in Render environment variables."
      );
      process.exit(1); // Stop app to avoid trying localhost
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Seed admin user if not exists
    await seedAdmin();

    // Test email configuration for Office 365
    if (process.env.MAILING_EMAIL && process.env.MAILING_PASSWORD) {
      console.log("🔧 Testing email configuration...");
      const emailTest = await testEmailConfig();
      if (!emailTest.success) {
        console.warn(
          "⚠️  Email configuration failed. Meeting emails will not work."
        );
        console.warn(
          "⚠️  You can still use the meeting system, but emails will not be sent."
        );
      }
    } else {
      console.warn(
        "⚠️  Email configuration missing. Meeting emails will not work."
      );
      console.warn(
        "⚠️  Add MAILING_EMAIL and MAILING_PASSWORD to .env for email notifications"
      );
    }

    // Start server
    const PORT = process.env.PORT;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(
        `📧 Email from: ${process.env.MAILING_EMAIL || "Not configured"}`
      );
      console.log(`📅 Meeting API: http://localhost:${PORT}/api/meetings`);
      console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`);
      console.log(
        `🔒 TLS Reject Unauthorized: ${
          process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0"
            ? "DISABLED (for development)"
            : "ENABLED"
        }`
      );
    });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Start the application
connectDB();

export default app;
