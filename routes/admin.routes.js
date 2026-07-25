const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

const {
    getAllComplaints,
    getAdminComplaintById,
    updateComplaintStatus,
    getDashboardStats
} = require("../controllers/admin.controller");

// All admin routes below require login and admin role
router.use(authenticateToken, adminMiddleware);

// Get complaints belonging to logged-in admin department
router.get("/complaints", getAllComplaints);

// Get one complaint from logged-in admin department
router.get("/complaints/:id", getAdminComplaintById);

// Update complaint status
router.patch("/status/:id", updateComplaintStatus);

// Department dashboard statistics
router.get("/dashboard", getDashboardStats);

module.exports = router;