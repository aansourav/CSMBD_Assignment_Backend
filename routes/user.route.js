import { Router } from "express";
import {
    addYoutubeLink,
    getAllContent,
    getProfile,
    getProfilePicture,
    getUserById,
    getUsers,
    removeYoutubeLink,
    updateProfile,
} from "../controllers/user.controller.js";
import authorize from "../middlewares/auth.middleware.js";
import {
    handleMulterError,
    uploadProfilePicture,
} from "../middlewares/upload.middleware.js";

const userRouter = Router();

// Public routes - Visitor Access
// /api/v1/users - Get list of all users
userRouter.get("/", getUsers);
// /api/v1/users/content - Get all content (YouTube links) across users
userRouter.get("/content", getAllContent);
// /api/v1/users/:id - Get specific user by ID
userRouter.get("/:id", getUserById);
// /api/v1/users/:id/profile-picture - Get user's profile picture
userRouter.get("/:id/profile-picture", getProfilePicture);

// Protected routes - User Profile Management
// /api/v1/users/profile/me - Get own profile
userRouter.get("/profile/me", authorize, getProfile);
// /api/v1/users/profile/me - Update own profile (with profile picture upload)
userRouter.put(
    "/profile/me",
    authorize,
    uploadProfilePicture,
    handleMulterError,
    updateProfile
);
// /api/v1/users/profile/youtube - Add YouTube link to profile
userRouter.post("/profile/youtube", authorize, addYoutubeLink);
// /api/v1/users/profile/youtube/:linkId - Remove YouTube link from profile
userRouter.delete("/profile/youtube/:linkId", authorize, removeYoutubeLink);

export default userRouter;
