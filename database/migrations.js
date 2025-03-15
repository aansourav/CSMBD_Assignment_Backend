import { QueryTypes } from "sequelize";
import { sequelize } from "./postgresql.js";

/**
 * Migration script to add new columns to the users table for profile management
 */
export const runMigrations = async () => {
    try {
        console.log("Running database migrations...");

        // Check if the columns already exist to avoid errors
        const tableInfo = await sequelize.query(
            `SELECT column_name 
             FROM information_schema.columns 
             WHERE table_name = 'users'`,
            { type: QueryTypes.SELECT }
        );

        const existingColumns = tableInfo.map((col) => col.column_name);

        // Add bio column if it doesn't exist
        if (!existingColumns.includes("bio")) {
            await sequelize.query(`ALTER TABLE users ADD COLUMN bio TEXT;`);
            console.log("Added 'bio' column to users table");
        }

        // Add location column if it doesn't exist
        if (!existingColumns.includes("location")) {
            await sequelize.query(
                `ALTER TABLE users ADD COLUMN location VARCHAR(100);`
            );
            console.log("Added 'location' column to users table");
        }

        // Add youtube_links column if it doesn't exist
        if (!existingColumns.includes("youtube_links")) {
            await sequelize.query(
                `ALTER TABLE users ADD COLUMN youtube_links JSONB DEFAULT '[]';`
            );
            console.log("Added 'youtube_links' column to users table");
        }

        // Add profile_picture column if it doesn't exist
        if (!existingColumns.includes("profile_picture")) {
            await sequelize.query(
                `ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255);`
            );
            console.log("Added 'profile_picture' column to users table");
        }

        console.log("Database migrations completed successfully");
    } catch (error) {
        console.error("Error running database migrations:", error);
        throw error;
    }
};

export default runMigrations;
