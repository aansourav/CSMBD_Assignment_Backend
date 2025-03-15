import fs from "fs";
import path from "path";
import { User, userValidation } from "../model/user.model.js";

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

        // Add profile picture URLs for each user
        const usersWithProfilePicUrl = users.map((user) => {
            const userData = user.toJSON();
            userData.profilePictureUrl = `/api/v1/users/${user.id}/profile-picture`;
            return userData;
        });

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: usersWithProfilePicUrl,
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

        // Add profile picture URL
        const userData = user.toJSON();
        userData.profilePictureUrl = `/api/v1/users/${user.id}/profile-picture`;

        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: userData,
        });
    } catch (error) {
        next(error);
    }
};

// Get own profile - requires authentication
export const getProfile = async (req, res, next) => {
    try {
        // req.user is set by the authorize middleware
        const userId = req.user.id;

        const user = await User.findByPk(userId, {
            attributes: { exclude: ["password"] },
        });

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        // Add profile picture URL
        const userData = user.toJSON();
        userData.profilePictureUrl = `/api/v1/users/${user.id}/profile-picture`;

        res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: userData,
        });
    } catch (error) {
        next(error);
    }
};

// Update own profile - requires authentication
export const updateProfile = async (req, res, next) => {
    try {
        // Validate request body using Joi
        const { error } = userValidation.updateProfile.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const userId = req.user.id;
        const { name, email, bio, location } = req.body;

        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        // If email is being changed, check if it's already taken
        if (email && email !== user.email) {
            const existingUser = await User.findOne({
                where: { email },
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "Email already in use",
                });
            }
        }

        // Prepare update data
        const updateData = {
            name: name || user.name,
            email: email || user.email,
            bio: bio !== undefined ? bio : user.bio,
            location: location !== undefined ? location : user.location,
        };

        // If profile picture was uploaded (handled by multer middleware)
        if (req.file) {
            // Delete the old profile picture if it exists
            if (user.profilePicture) {
                try {
                    const oldPicturePath = path.join(
                        process.cwd(),
                        user.profilePicture
                    );
                    if (fs.existsSync(oldPicturePath)) {
                        fs.unlinkSync(oldPicturePath);
                    }
                } catch (err) {
                    console.error("Error deleting old profile picture:", err);
                    // Continue with update even if old file deletion fails
                }
            }

            // Save the new profile picture path relative to server root
            updateData.profilePicture = req.file.path.replace(/\\/g, "/");
        }

        // Update user
        await user.update(updateData);

        // Return updated user without password
        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ["password"] },
        });

        // Add profile picture URL
        const userData = updatedUser.toJSON();
        userData.profilePictureUrl = `/api/v1/users/${updatedUser.id}/profile-picture`;

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: userData,
        });
    } catch (error) {
        next(error);
    }
};

// Add YouTube link to profile - requires authentication
export const addYoutubeLink = async (req, res, next) => {
    try {
        // Validate request body using Joi
        const { error } = userValidation.addYoutubeLink.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const userId = req.user.id;
        const { youtubeUrl, title } = req.body;

        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        // Parse current YouTube links
        const currentLinks = user.youtubeLinks || [];

        // Add new link
        const newLink = {
            id: Date.now().toString(), // Simple unique ID
            url: youtubeUrl,
            title,
            addedAt: new Date().toISOString(),
        };

        // Update user's YouTube links
        await user.update({
            youtubeLinks: [...currentLinks, newLink],
        });

        // Return updated user without password
        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ["password"] },
        });

        // Add profile picture URL
        const userData = updatedUser.toJSON();
        userData.profilePictureUrl = `/api/v1/users/${updatedUser.id}/profile-picture`;

        res.status(201).json({
            success: true,
            message: "YouTube link added successfully",
            data: {
                newLink,
                user: userData,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Remove YouTube link from profile - requires authentication
export const removeYoutubeLink = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const linkId = req.params.linkId;

        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        // Parse current YouTube links
        const currentLinks = user.youtubeLinks || [];

        // Filter out the link to remove
        const updatedLinks = currentLinks.filter((link) => link.id !== linkId);

        // Check if link was found and removed
        if (currentLinks.length === updatedLinks.length) {
            return res.status(404).json({
                success: false,
                message: "YouTube link not found",
            });
        }

        // Update user's YouTube links
        await user.update({
            youtubeLinks: updatedLinks,
        });

        // Return updated user without password
        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ["password"] },
        });

        // Add profile picture URL
        const userData = updatedUser.toJSON();
        userData.profilePictureUrl = `/api/v1/users/${updatedUser.id}/profile-picture`;

        res.status(200).json({
            success: true,
            message: "YouTube link removed successfully",
            data: userData,
        });
    } catch (error) {
        next(error);
    }
};

// Get profile picture
export const getProfilePicture = async (req, res, next) => {
    try {
        const userId = req.params.id;

        // Find the user to get their profile picture path
        const user = await User.findByPk(userId, {
            attributes: ["profilePicture"],
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // If user doesn't have a profile picture, return the default one
        if (!user.profilePicture) {
            return res.sendFile(
                path.join(
                    process.cwd(),
                    "uploads",
                    "profile-pictures",
                    "default.png"
                )
            );
        }

        // Send the profile picture file
        res.sendFile(path.join(process.cwd(), user.profilePicture));
    } catch (error) {
        next(error);
    }
};
