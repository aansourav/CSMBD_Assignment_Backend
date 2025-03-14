import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// First, set a default NODE_ENV if not set
process.env.NODE_ENV = process.env.NODE_ENV || "development";

// Load the environment variables from the appropriate .env file
const envFile = path.resolve(
    __dirname,
    `../.env.${process.env.NODE_ENV}.local`
);
config({ path: envFile });

// Log for debugging
console.log("Current environment:", process.env.NODE_ENV);
console.log("Loading env file:", envFile);

// Export environment variables
export const {
    PORT,
    NODE_ENV,
    DB_URI,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    COOKIE_EXPIRES_IN,
    SERVER_URL,
} = process.env;

// Validate required environment variables
if (!DB_URI) {
    throw new Error(`DB_URI is not defined in ${envFile}`);
}
