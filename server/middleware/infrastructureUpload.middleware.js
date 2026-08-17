const multer = require("multer");
const path = require("path");

const allowedMimeTypes = new Set([
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "application/pdf",
    "image/png",
    "image/jpeg"
]);
const allowedExtensions = new Set([".xlsx", ".csv", ".pdf", ".png", ".jpg", ".jpeg"]);

const infrastructureUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const knownMimeType = allowedMimeTypes.has(file.mimetype);
        const genericMimeType = file.mimetype === "application/octet-stream";

        if (!allowedExtensions.has(extension) || (!knownMimeType && !genericMimeType)) {
            return callback(new Error("Upload an XLSX, CSV, PDF, PNG or JPG file"));
        }

        return callback(null, true);
    }
});

const uploadInfrastructureFile = (req, res, next) => {
    infrastructureUpload.single("file")(req, res, (error) => {
        if (!error) return next();

        const message = error.code === "LIMIT_FILE_SIZE"
            ? "The selected file is larger than 10 MB"
            : error.message;
        return res.status(400).json({ success: false, message });
    });
};

module.exports = uploadInfrastructureFile;
