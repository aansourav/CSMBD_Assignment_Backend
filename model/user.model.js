import bcrypt from "bcryptjs";
import Joi from "joi";
import { DataTypes } from "sequelize";
import { sequelize } from "../database/postgresql.js";

// Define User model using Sequelize
const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notNull: { msg: "Name is required" },
                len: {
                    args: [3, 50],
                    msg: "Name must be between 3 and 50 characters long",
                },
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notNull: { msg: "Email is required" },
                isEmail: { msg: "Please enter a valid email address" },
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Password is required" },
                len: {
                    args: [8],
                    msg: "Password must be at least 8 characters long",
                },
            },
        },
        // Add new fields for profile management
        bio: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        location: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        // Profile picture field to store image path
        profilePicture: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: "profile_picture",
        },
        // Array to store YouTube embed links as JSON
        youtubeLinks: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: [],
            field: "youtube_links",
        },
    },
    {
        tableName: "users",
        underscored: true,
        timestamps: true,
        hooks: {
            // Hash password before saving to database
            beforeCreate: async (user) => {
                if (user.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed("password")) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
        },
    }
);

// Instance method to compare password
User.prototype.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Joi validation schemas
const userValidation = {
    register: Joi.object({
        name: Joi.string().min(3).max(50).required().messages({
            "string.empty": "Name is required",
            "string.min": "Name must be at least 3 characters long",
            "string.max": "Name must be less than 50 characters",
        }),
        email: Joi.string().email().required().messages({
            "string.empty": "Email is required",
            "string.email": "Please enter a valid email address",
        }),
        password: Joi.string().min(8).required().messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 8 characters long",
        }),
    }),

    login: Joi.object({
        email: Joi.string().email().required().messages({
            "string.empty": "Email is required",
            "string.email": "Please enter a valid email address",
        }),
        password: Joi.string().required().messages({
            "string.empty": "Password is required",
        }),
    }),

    updateProfile: Joi.object({
        name: Joi.string().min(3).max(50).messages({
            "string.min": "Name must be at least 3 characters long",
            "string.max": "Name must be less than 50 characters",
        }),
        email: Joi.string().email().messages({
            "string.email": "Please enter a valid email address",
        }),
        bio: Joi.string().allow("").optional(),
        location: Joi.string().max(100).allow("").optional(),
        // Profile picture is handled by multer middleware
    }),

    // Add validation for YouTube link
    addYoutubeLink: Joi.object({
        youtubeUrl: Joi.string()
            .required()
            .pattern(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.*$/)
            .messages({
                "string.empty": "YouTube URL is required",
                "string.pattern.base": "Invalid YouTube URL format",
            }),
        title: Joi.string().max(100).required().messages({
            "string.empty": "Title is required",
            "string.max": "Title must be less than 100 characters",
        }),
    }),
};

export { User, userValidation };
export default User;
