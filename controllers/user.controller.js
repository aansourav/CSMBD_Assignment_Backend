import { User } from "../model/user.model.js";

export const getUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count: totalUsers, rows: users } = await User.findAndCountAll({
            attributes: { exclude: ["password"] },
            limit: limit,
            offset: offset,
            order: [["created_at", "DESC"]],
        });

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: users,
            pagination: {
                total: totalUsers,
                limit: limit,
                totalPages: Math.ceil(totalUsers / limit),
                currentPage: page,
                hasNextPage: offset + limit < totalUsers,
                hasPreviousPage: page > 1,
                nextPage: offset + limit < totalUsers ? page + 1 : null,
                previousPage: page > 1 ? page - 1 : null,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        const userId = req.params.id;

        const user = await User.findByPk(userId, {
            attributes: { exclude: ["password"] },
        });

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};
