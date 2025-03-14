import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
import { User, userValidation } from "../model/user.model.js";

export const signUp = async (req, res) => {
    try {
        // Validate request body using Joi
        const { error } = userValidation.register.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const { name, email, password } = req.body;

        // First check if user exists OUTSIDE of any transaction
        const existingUser = await User.findOne({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists",
            });
        }

        // Create user without transaction
        const newUser = await User.create({ name, email, password });

        // Create JWT token
        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        // Remove password from response
        const userWithoutPassword = newUser.toJSON();
        delete userWithoutPassword.password;

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                token,
                user: userWithoutPassword,
            },
        });
    } catch (error) {
        console.error("Signup error:", error.message);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create user",
        });
    }
};

export const signIn = async (req, res) => {
    try {
        // Validate request body using Joi
        const { error } = userValidation.login.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const { email, password } = req.body;

        // Find user by email - using Sequelize's findOne
        const user = await User.findOne({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Use the comparePassword method we defined in the model
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid password",
            });
        }

        // Create JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        // Remove password from response using Sequelize's toJSON
        const userWithoutPassword = user.toJSON();
        delete userWithoutPassword.password;

        res.status(200).json({
            success: true,
            message: "User signed in successfully",
            data: {
                token,
                user: userWithoutPassword,
            },
        });
    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            success: false,
            message: error.message || "Failed to sign in",
        });
    }
};

export const signOut = async (req, res) => {
    res.status(200).json({
        success: true,
        message: "User signed out successfully",
    });
};
