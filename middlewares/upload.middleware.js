import fs from "fs";
import multer from "multer";
import path from "path";

// Ensure upload directory exists
const uploadDir = "./uploads";
const profilePicturesDir = "./uploads/profile-pictures";

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

if (!fs.existsSync(profilePicturesDir)) {
    fs.mkdirSync(profilePicturesDir);
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, profilePicturesDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp and random string
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileExtension = path.extname(file.originalname);
        cb(null, "profile-" + uniqueSuffix + fileExtension);
    },
});

// File filter to allow only image files
const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 2, // 2MB max file size
    },
    fileFilter: fileFilter,
});

// Middleware for handling profile picture uploads
export const uploadProfilePicture = upload.single("profilePicture");

// Error handler middleware for multer errors
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File size too large. Maximum size is 2MB.",
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    } else if (err) {
        // An unknown error occurred
        return res.status(400).json({
            success: false,
            message: err.message || "Error uploading file",
        });
    }
    next();
};

export default { uploadProfilePicture, handleMulterError };
