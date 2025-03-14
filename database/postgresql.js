import { Sequelize } from "sequelize";
import { DB_URI, NODE_ENV } from "../config/env.js";

// Validate database connection string early
if (!DB_URI) {
    throw new Error(
        `DB_URI is not defined in the ${NODE_ENV} environment variables`
    );
}

// Create Sequelize instance with optimized configuration
const sequelize = new Sequelize(DB_URI, {
    dialect: "postgres",
    logging: NODE_ENV === "development" ? console.log : false, // Fix deprecated logging option
    ssl: true,
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false,
        },
        connectTimeout: 60000, // Increase connection timeout to 60 seconds
        // Add keepalive settings to prevent connection drops
        keepAlive: true,
        keepAliveInitialDelay: 10000, // 10 seconds
    },
    define: {
        underscored: true,
        timestamps: true,
    },
    pool: {
        max: 10,
        min: 0,
        acquire: 60000, // Increase acquire timeout to 60 seconds
        idle: 10000,
    },
    retry: {
        max: 5, // Increase max retries from 3 to 5
        timeout: 10000, // Increase timeout from 3000ms to 10000ms
        backoffBase: 1000, // Add backoff between retries
        backoffExponent: 1.5, // Exponential backoff
    },
    transactionType: "IMMEDIATE",
});

// Connection function with improved error handling
const connectDB = async () => {
    let retries = 0;
    const maxRetries = 3;
    const retryDelay = 5000; // 5 seconds

    while (retries < maxRetries) {
        try {
            await sequelize.authenticate();
            console.log("Connected to PostgreSQL in", NODE_ENV, "mode");
            return true;
        } catch (error) {
            retries++;
            console.error(
                `PostgreSQL connection attempt ${retries}/${maxRetries} failed:`,
                error.message
            );

            // Log specific error details for better diagnostics
            if (error.original) {
                console.error("Original error:", {
                    code: error.original.code,
                    errno: error.original.errno,
                    syscall: error.original.syscall,
                });
            }

            if (retries >= maxRetries) {
                console.error(
                    "Error connecting to PostgreSQL after maximum retries:",
                    error
                );
                process.exit(1);
            }

            // Wait before retrying
            console.log(
                `Retrying connection in ${retryDelay / 1000} seconds...`
            );
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
    }
};

// Export sequelize instance separately to allow other modules
// to import it directly for defining models and performing database operations
// without having to call connectDB first
export { sequelize };
export default connectDB;
