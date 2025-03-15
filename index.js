import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { NODE_ENV, PORT } from "./config/env.js";
import runMigrations from "./database/migrations.js";
import connectDB, { sequelize } from "./database/postgresql.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
// Import all models to ensure they're registered
import "./model/user.model.js";

/**
 * Main Express application setup
 *
 * This file configures the Express application with:
 * - Security middleware (helmet, CORS)
 * - Request parsing middleware
 * - Static file serving
 * - API routes
 * - Error handling
 */

// Create Express application
const app = express();

// Connect to database first
try {
    await connectDB();

    // Sync database models and run migrations (in development only)
    if (NODE_ENV === "development") {
        try {
            // Run migrations to add new columns
            await runMigrations();

            // This will create tables if they don't exist and alter them if needed
            await sequelize.sync({ alter: true });
            console.log(
                "✅ Database tables synchronized and altered if needed"
            );
        } catch (error) {
            console.error("❌ Error syncing database tables:", error);
        }
    }
} catch (error) {
    console.error("❌ Failed to initialize database:", error);
    process.exit(1);
}

// Security middleware
app.use(helmet()); // Add security headers
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "https://csmbd-assignment-frontend.vercel.app",
        ], // Restrict to trusted origins
        credentials: true, // Allow cookies with CORS
        methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific methods
        allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
    })
);

// Request parsing middleware
app.use(express.json({ limit: "1mb" })); // Limit request body size
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Logging middleware - only in development
if (NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Serve static files from uploads directory with security headers
app.use(
    "/uploads",
    (req, res, next) => {
        // Add cache control headers for static content
        res.setHeader("Cache-Control", "public, max-age=86400"); // 24 hours
        next();
    },
    express.static(path.join(process.cwd(), "uploads"))
);

// API Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

// Root route
app.get("/", (req, res) => {
    res.send("Welcome to CSMBD Assignment Backend API");
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Resource not found",
    });
});

// Global error handler
app.use(errorMiddleware);

// Start server
const server = app.listen(PORT, () => {
    console.log(
        `✅ Backend API is running on http://localhost:${PORT} in ${NODE_ENV} mode`
    );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.error(
        "❌ UNHANDLED REJECTION! Shutting down...",
        err.name,
        err.message
    );
    console.error(err.stack);

    // Gracefully close server before exiting
    server.close(() => {
        process.exit(1);
    });
});

export default app;
