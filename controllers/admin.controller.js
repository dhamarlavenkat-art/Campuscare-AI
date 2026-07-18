const Complaint = require("../models/complaint.model");

// Get all complaints
const getAllComplaints = async (req, res) => {
    try {

        const {
            status,
            category,
            priority,
            search,
            sort,
            page = 1,
            limit = 10
        } = req.query;

        const filter = {};

        // Search
        if (search) {
            filter.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        // Filters
        if (status) {
            filter.status = status;
        }

        if (category) {
            filter.category = category;
        }

        if (priority) {
            filter.priority = priority;
        }

        // Sorting
        const sortOption = {};

        if (sort === "newest") {
            sortOption.createdAt = -1;
        } else if (sort === "oldest") {
            sortOption.createdAt = 1;
        } else {
            // Default sorting
            sortOption.createdAt = -1;
        }

        // Fetch complaints
        const complaints = await Complaint.find(filter)
            .populate("createdBy", "name email")
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Complaint.countDocuments(filter);

        res.status(200).json({
            success: true,
            total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
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

        const {status,adminRemark} = req.body;

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
        if (adminRemark) {
            complaint.adminRemark = adminRemark;
        }
        complaint.history.push({
            action: "Status Updated",
            status: status,
            remark: adminRemark || "",
            updatedBy: "Admin"
});

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