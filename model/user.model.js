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
    }),
};

export { User, userValidation };
export default User;
