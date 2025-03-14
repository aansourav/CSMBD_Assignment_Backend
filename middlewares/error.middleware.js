// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
    try {
        let error = { ...err };
        error.message = err.message || "Internal server error";
        error.statusCode = err.statusCode || 500;
        console.error("Error:", error.message);

        // Sequelize unique constraint violation
        if (err.name === "SequelizeUniqueConstraintError") {
            const field = err.errors[0].path;
            const message = `${field} already exists`;
            error = new Error(message);
            error.statusCode = 409;
        }

        // Sequelize validation error
        if (err.name === "SequelizeValidationError") {
            const message = err.errors.map((e) => e.message).join(", ");
            error = new Error(message);
            error.statusCode = 400;
        }

        // Sequelize database error
        if (err.name === "SequelizeDatabaseError") {
            const message = "Database error occurred";
            error = new Error(message);
            error.statusCode = 500;
        }

        // JWT errors
        if (err.name === "JsonWebTokenError") {
            const message = "Invalid token. Please log in again.";
            error = new Error(message);
            error.statusCode = 401;
        }

        if (err.name === "TokenExpiredError") {
            const message = "Your token has expired. Please log in again.";
            error = new Error(message);
            error.statusCode = 401;
        }

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    } catch (e) {
        console.error("Error handler failed:", e);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export default errorMiddleware;
