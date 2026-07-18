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
    getComplaintHistory
}=require("../controllers/complaint.controller");


router.post(
    "/create",
    authenticateToken,
    upload.single("image"),
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





module.exports = router;