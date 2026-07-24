const Complaint = require("../models/complaint.model");

// Get complaints only for the logged-in admin's department
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

        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        // Main department filter
        const filter = {
            department: req.user.department
        };

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
                },
                {
                    summary: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        // Additional filters
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
        const sortOption = {
            createdAt: sort === "oldest" ? 1 : -1
        };

        const complaints = await Complaint.find(filter)
            .populate("createdBy", "name email")
            .sort(sortOption)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const total = await Complaint.countDocuments(filter);

        return res.status(200).json({
            success: true,
            department: req.user.department,
            total,
            currentPage: pageNumber,
            totalPages: Math.ceil(total / limitNumber),
            data: complaints
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update complaint status only inside admin's department
const updateComplaintStatus = async (req, res) => {
    try {
        const { status, adminRemark } = req.body;

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

        // Find complaint only if it belongs to this admin's department
        const complaint = await Complaint.findOne({
            _id: req.params.id,
            department: req.user.department
        });

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found in your department"
            });
        }

        complaint.status = status;
        complaint.adminRemark = adminRemark || "";

        complaint.history.push({
            action: "Status Updated",
            status,
            remark: adminRemark || "",
            updatedBy: "Admin"
        });

        await complaint.save();

        return res.status(200).json({
            success: true,
            message: "Complaint Status Updated",
            data: complaint
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get dashboard stats only for admin's department
const getDashboardStats = async (req, res) => {
    try {
        const department = req.user.department;

        const totalComplaints = await Complaint.countDocuments({
            department
        });

        const pending = await Complaint.countDocuments({
            department,
            status: "Pending"
        });

        const inProgress = await Complaint.countDocuments({
            department,
            status: "In Progress"
        });

        const resolved = await Complaint.countDocuments({
            department,
            status: "Resolved"
        });

        const rejected = await Complaint.countDocuments({
            department,
            status: "Rejected"
        });

        const highPriority = await Complaint.countDocuments({
            department,
            priority: "High"
        });

        const anonymous = await Complaint.countDocuments({
            department,
            anonymous: true
        });

        return res.status(200).json({
            success: true,
            department,
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
        return res.status(500).json({
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