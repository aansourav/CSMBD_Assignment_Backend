import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import { User } from "../model/user.model.js";

const authorize = async (req, res, next) => {
    try {
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Use Sequelize's findByPk instead of MongoDB's findById
        const user = await User.findByPk(decoded.userId, {
            attributes: { exclude: ["password"] },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - User not found",
            });
        }

        // Set user info on request object
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Unauthorized - Invalid token",
            error: error.message,
        });
    }
};

export default authorize;
