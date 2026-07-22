const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const {
    getAllComplaints,
    updateComplaintStatus,
    getDashboardStats
}=require("../controllers/admin.controller");
router.get(
    "/complaints",
    authenticateToken,
    adminMiddleware,
    getAllComplaints
);
router.patch(
    "/status/:id",
    authenticateToken,
    adminMiddleware,
    updateComplaintStatus
);
router.get(
    "/dashboard",
    authenticateToken,
    adminMiddleware,
    getDashboardStats
);



module.exports = router;