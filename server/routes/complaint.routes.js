const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const{
    createComplaint,
    getMyComplaints,
    getComplaintById,
    updateComplaint,
    deleteComplaint,
    getComplaintHistory,
    supportComplaint
}=require("../controllers/complaint.controller");
const {
    complaintValidation,
    validate
}=require("../validation/complaint.validation");


router.post(
    "/create",
    authenticateToken,
    upload.single("image"),
    complaintValidation,
    validate,
    createComplaint
);
router.get(
    "/my",
    authenticateToken,
    getMyComplaints
);
router.get(
    "/history/:id",
    authenticateToken,
    getComplaintHistory
)
router.get(
    "/:id",
    authenticateToken,
    getComplaintById
)
router.put(
    "/update/:id",
    authenticateToken,
    updateComplaint
)
router.delete(
    "/delete/:id",
    authenticateToken,
    deleteComplaint
)
router.post(
    "/support/:id",
    authenticateToken,
    supportComplaint
)





module.exports = router;