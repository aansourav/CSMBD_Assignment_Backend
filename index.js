import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { PORT } from "./config/env.js";
import connectDB, { sequelize } from "./database/postgresql.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
// Import all models to ensure they're registered
import "./model/user.model.js";

const app = express();

// Connect to database first
await connectDB();

// Sync database models (in development only)
if (process.env.NODE_ENV === "development") {
    try {
        // This will create tables if they don't exist
        await sequelize.sync({ alter: false });
        console.log("Database tables synchronized");
    } catch (error) {
        console.error("Error syncing database tables:", error);
    }
}

app.use(express.json());
app.use(
    cors({
        origin: ["http://localhost:3000"],
        credentials: true,
    })
);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

app.use(errorMiddleware);

app.get("/", (req, res) => {
    res.send("Welcome to CSMBD Assignment Backend API");
});

app.listen(PORT, async () => {
    console.log(`Backend API is running on http://localhost:${PORT}`);
});

export default app;
