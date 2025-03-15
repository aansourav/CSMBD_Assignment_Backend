import { Sequelize } from "sequelize";
import { DB_URI, NODE_ENV } from "../config/env.js";

/**
 * PostgreSQL Database Configuration
 *
 * Sets up and manages the database connection with optimization for:
 * - Connection pooling for better request handling
 * - SSL configuration for secure connections
 * - Retry logic for connection resilience
 * - Performance optimization through intelligent defaults
 */

// Validate database connection string early to fail fast
if (!DB_URI) {
    throw new Error(
        `DB_URI is not defined in the ${NODE_ENV} environment variables`
    );
}

/**
 * Sequelize connection pool configuration
 *
 * Production values:
 * - max: 20-25 connections for moderate traffic, adjust based on workload
 * - min: 0-5 idle connections to avoid connection overhead on startup
 * - acquire: 60s timeout for acquiring a connection from the pool
 * - idle: 10s before removing an idle connection
 *
 * Development values:
 * - Lower pool sizes for local development
 */
const poolConfig =
    NODE_ENV === "production"
        ? {
              max: 20, // Maximum connection pool size
              min: 5, // Minimum idle connections
              acquire: 60000, // Timeout in ms for acquiring a connection
              idle: 10000, // Idle time before a connection is released
          }
        : {
              max: 10, // Smaller pool for development
              min: 0, // No min idle connections in development
              acquire: 30000,
              idle: 10000,
          };

// Create Sequelize instance with optimized configuration
const sequelize = new Sequelize(DB_URI, {
    dialect: "postgres",
    logging: NODE_ENV === "development" ? console.log : false,

    // SSL Configuration
    ssl: true,
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false, // Required for some hosted PostgreSQL services
        },
        connectTimeout: 60000, // 60 second connection timeout
        keepAlive: true,
        keepAliveInitialDelay: 10000, // 10 second keepalive
    },

    // Model definition defaults
    define: {
        underscored: true, // Use snake_case for table fields
        timestamps: true, // Add created_at and updated_at columns
        paranoid: false, // True would add deleted_at for soft deletes
        freezeTableName: true, // Prevent pluralization of table names
    },

    // Connection pool configuration
    pool: poolConfig,

    // Retry configuration for failed connections
    retry: {
        max: 5,
        timeout: 10000,
        backoffBase: 1000,
        backoffExponent: 1.5,
    },

    // Query execution settings
    transactionType: "IMMEDIATE", // Begin transactions immediately
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED, // Default isolation
});

/**
 * Database connection function with robust error handling and retry logic
 * Attempts to connect to the database with exponential backoff
 *
 * @returns {Promise<boolean>} True if connection successful
 * @throws {Error} If connection fails after max retries
 */
const connectDB = async () => {
    let retries = 0;
    const maxRetries = NODE_ENV === "production" ? 5 : 3;
    const retryDelay = 5000; // 5 seconds initial retry delay

    while (retries < maxRetries) {
        try {
            await sequelize.authenticate();
            console.log("✅ Connected to PostgreSQL in", NODE_ENV, "mode");
            return true;
        } catch (error) {
            retries++;

            // Log error details with progressively shorter messages after first attempt
            if (retries === 1) {
                console.error(
                    `PostgreSQL connection attempt ${retries}/${maxRetries} failed:`,
                    error.message
                );

                // Log detailed error information for diagnosis
                if (error.original) {
                    console.error("Database error details:", {
                        code: error.original.code,
                        errno: error.original.errno,
                        syscall: error.original.syscall,
                    });
                }
            } else {
                console.error(
                    `PostgreSQL connection retry ${retries}/${maxRetries} failed`
                );
            }

            // Exit if all retries have been exhausted
            if (retries >= maxRetries) {
                console.error(
                    "❌ Failed to connect to PostgreSQL after maximum retries"
                );

                // In production, exit the process; in development, throw error
                if (NODE_ENV === "production") {
                    process.exit(1);
                } else {
                    throw new Error(
                        "Database connection failed: " + error.message
                    );
                }
            }

            // Calculate delay with exponential backoff: 5s, 10s, 20s, etc.
            const currentDelay = retryDelay * Math.pow(2, retries - 1);
            console.log(
                `Retrying connection in ${currentDelay / 1000} seconds...`
            );

            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, currentDelay));
        }
    }
};

// Export sequelize instance and connection function
export { sequelize };
export default connectDB;
