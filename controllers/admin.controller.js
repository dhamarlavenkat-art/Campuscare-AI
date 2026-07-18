const Complaint = require("../models/complaint.model");

// Get all complaints
const getAllComplaints = async (req, res) => {
    try {

        const complaints = await Complaint.find()
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: complaints.length,
            data: complaints
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Update complaint status
const updateComplaintStatus = async (req, res) => {
    try {

        const { status } = req.body;

        const validStatus = [
            "Pending",
            "In Progress",
            "Resolved",
            "Rejected"
        ];

        if (!validStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Status"
            });
        }

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint Not Found"
            });
        }

        complaint.status = status;

        await complaint.save();

        res.status(200).json({
            success: true,
            message: "Complaint Status Updated",
            data: complaint
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getDashboardStats = async (req, res) => {
    try {

        const totalComplaints = await Complaint.countDocuments();

        const pending = await Complaint.countDocuments({
            status: "Pending"
        });

        const inProgress = await Complaint.countDocuments({
            status: "In Progress"
        });

        const resolved = await Complaint.countDocuments({
            status: "Resolved"
        });

        const rejected = await Complaint.countDocuments({
            status: "Rejected"
        });

        const highPriority = await Complaint.countDocuments({
            priority: "High"
        });

        const anonymous = await Complaint.countDocuments({
            anonymous: true
        });

        res.status(200).json({
            success: true,
            data: {
                totalComplaints,
                pending,
                inProgress,
                resolved,
                rejected,
                highPriority,
                anonymous
            }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};



module.exports = {
    getAllComplaints,
    updateComplaintStatus,
    getDashboardStats
};