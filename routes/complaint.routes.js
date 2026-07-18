const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/auth.middleware");

const{
    createComplaint,
    getMyComplaints,
    getComplaintById,
    updateComplaint,
    deleteComplaint
}=require("../controllers/complaint.controller");


router.post(
    "/create",
    authenticateToken,
    createComplaint
);
router.get(
    "/my",
    authenticateToken,
    getMyComplaints
);
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