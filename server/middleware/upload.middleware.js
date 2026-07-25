const multer = require("multer");
const path = require("path");

// Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

        cb(
            null,
            uniqueName + path.extname(file.originalname)
        );
    }
});

// Allow only image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpg|jpeg|png/;

    const isValid = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );

    if (isValid) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, JPEG and PNG files are allowed."));
    }
};

// Initialize Multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;