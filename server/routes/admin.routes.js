const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

const {
    getAllComplaints,
    getAdminComplaintById,
    getAdminComplaintSuggestions,
    updateComplaintStatus,
    getDashboardStats,
    getAnalytics
} = require("../controllers/admin.controller");

// All admin routes below require login and admin role
router.use(authenticateToken, adminMiddleware);

// Get complaints belonging to logged-in admin department
router.get("/complaints", getAllComplaints);

// Get one complaint from logged-in admin department
router.get("/complaints/:id", getAdminComplaintById);

// Generate expert suggestions only when the admin requests them
router.post("/complaints/:id/suggestions", getAdminComplaintSuggestions);

// Update complaint status
router.patch("/status/:id", updateComplaintStatus);

// Department dashboard statistics
router.get("/dashboard", getDashboardStats);

router.get("/analytics", getAnalytics);

module.exports = router;
