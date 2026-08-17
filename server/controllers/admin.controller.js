const Complaint = require("../models/complaint.model");
const { generateAdminSuggestions } = require("../services/ai.service");

const escapeRegex = (value = "") =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildDepartmentFilter = (department) => ({
    department: {
        $regex: `^${escapeRegex(department?.trim())}$`,
        $options: "i"
    }
});

const addInfrastructureFilters = (filter, query) => {
    if (query.building) filter["location.building"] = query.building;
    if (query.floor !== undefined && query.floor !== "") {
        filter["location.floor"] = Number(query.floor);
    }
    if (query.room) filter["location.room"] = query.room;
    if (query.assetType) filter["location.assetType"] = query.assetType;
};

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
        const department = req.user.department?.trim();

const filter = buildDepartmentFilter(department);
        addInfrastructureFilters(filter, req.query);

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
const getAdminComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findOne({
            _id: req.params.id,
            department: req.user.department
        }).populate("createdBy", "name email");

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found in your department"
            });
        }

        return res.status(200).json({
            success: true,
            data: complaint
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
    department: {
        $regex: `^${req.user.department.trim()}$`,
        $options: "i"
    }
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
const getDashboardStats = async (req, res) => {
    try {
        const department = req.user.department?.trim();

        const departmentFilter = {
            department: {
                $regex: `^${department}$`,
                $options: "i"
            }
        };

        const totalComplaints = await Complaint.countDocuments(
            departmentFilter
        );

        const pending = await Complaint.countDocuments({
            ...departmentFilter,
            status: "Pending"
        });

        const inProgress = await Complaint.countDocuments({
            ...departmentFilter,
            status: "In Progress"
        });

        const resolved = await Complaint.countDocuments({
            ...departmentFilter,
            status: "Resolved"
        });

        const rejected = await Complaint.countDocuments({
            ...departmentFilter,
            status: "Rejected"
        });

        const highPriority = await Complaint.countDocuments({
            ...departmentFilter,
            priority: "High"
        });

        const anonymous = await Complaint.countDocuments({
            ...departmentFilter,
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

const getAdminComplaintSuggestions = async (req, res) => {
    try {
        const complaint = await Complaint.findOne({
            _id: req.params.id,
            ...buildDepartmentFilter(req.user.department)
        });

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found in your department"
            });
        }

        const suggestions = await generateAdminSuggestions(complaint);

        return res.status(200).json({
            success: true,
            data: suggestions.slice(0, 4)
        });
    } catch (error) {
        return res.status(502).json({
            success: false,
            message: error.message
        });
    }
};

const getAnalytics = async (req, res) => {
    try {
        const now = new Date();
        let startDate;
        let endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);

        switch (req.query.period) {
            case "today":
                startDate = new Date(now);
                startDate.setHours(0, 0, 0, 0);
                break;
            case "thisWeek": {
                startDate = new Date(now);
                const day = startDate.getDay() || 7;
                startDate.setDate(startDate.getDate() - day + 1);
                startDate.setHours(0, 0, 0, 0);
                break;
            }
            case "lastMonth":
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
                break;
            case "thisYear":
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case "custom":
                startDate = req.query.startDate
                    ? new Date(`${req.query.startDate}T00:00:00`)
                    : new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = req.query.endDate
                    ? new Date(`${req.query.endDate}T23:59:59.999`)
                    : endDate;
                break;
            case "thisMonth":
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
        }

        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid date range" });
        }

        const filter = req.user.role === "super_admin"
            ? {}
            : buildDepartmentFilter(req.user.department);
        if (req.user.role === "super_admin" && req.query.department) {
            Object.assign(filter, buildDepartmentFilter(req.query.department));
        }
        addInfrastructureFilters(filter, req.query);
        if (req.query.category) filter.category = req.query.category;
        if (req.query.priority) filter.priority = req.query.priority;
        if (req.query.status) filter.status = req.query.status;

        const complaints = await Complaint.find(filter)
            .select("title category priority department status location history createdAt updatedAt")
            .sort({ createdAt: -1 });

        const eventInRange = (complaint, status) =>
            complaint.history?.some((entry) => {
                const date = new Date(entry.date);
                return entry.status === status && date >= startDate && date <= endDate;
            });

        const received = complaints.filter(
            (complaint) => complaint.createdAt >= startDate && complaint.createdAt <= endDate
        );
        const resolved = complaints.filter((complaint) => eventInRange(complaint, "Resolved"));
        const rejected = complaints.filter((complaint) => eventInRange(complaint, "Rejected"));
        const pending = complaints.filter((complaint) => complaint.status === "Pending");
        const inProgress = complaints.filter((complaint) => complaint.status === "In Progress");
        const resolvedFromReceived = received.filter((complaint) =>
            complaint.history?.some((entry) => {
                const date = new Date(entry.date);
                return entry.status === "Resolved" && date >= complaint.createdAt && date <= endDate;
            })
        );

        const resolutionHours = complaints.flatMap((complaint) => {
            const resolvedEntry = complaint.history
                ?.filter((entry) => {
                    const date = new Date(entry.date);
                    return entry.status === "Resolved" && date >= startDate && date <= endDate;
                })
                .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

            if (!resolvedEntry) return [];
            const hours = (new Date(resolvedEntry.date) - complaint.createdAt) / (1000 * 60 * 60);
            return hours >= 0 ? [hours] : [];
        });

        const averageResolutionHours = resolutionHours.length
            ? Number((resolutionHours.reduce((sum, hours) => sum + hours, 0) / resolutionHours.length).toFixed(1))
            : 0;

        const reportComplaints = complaints.filter((complaint) => {
            if (req.query.status === "Resolved") return eventInRange(complaint, "Resolved");
            if (req.query.status === "Rejected") return eventInRange(complaint, "Rejected");

            const createdInRange = complaint.createdAt >= startDate && complaint.createdAt <= endDate;
            if (req.query.status === "Pending" || req.query.status === "In Progress") {
                return createdInRange;
            }

            return createdInRange ||
                eventInRange(complaint, "Resolved") ||
                eventInRange(complaint, "Rejected");
        });

        const statusBreakdown = ["Pending", "In Progress", "Resolved", "Rejected"].map(
            (status) => ({
                status,
                count: complaints.filter((complaint) => complaint.status === status).length
            })
        );

        const countBy = (items, field) => {
            const counts = new Map();
            items.forEach((item) => {
                const key = item[field] || "Other";
                counts.set(key, (counts.get(key) || 0) + 1);
            });
            return [...counts.entries()]
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
        };

        const categoryBreakdown = countBy(received, "category");
        const departmentBreakdown = countBy(received, "department");

        const dateKey = (value) => {
            const date = new Date(value);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };

        const trendMap = new Map();
        const cursor = new Date(startDate);
        cursor.setHours(0, 0, 0, 0);

        while (cursor <= endDate) {
            const key = dateKey(cursor);
            trendMap.set(key, {
                date: key,
                received: 0,
                resolved: 0,
                rejected: 0
            });
            cursor.setDate(cursor.getDate() + 1);
        }

        complaints.forEach((complaint) => {
            if (complaint.createdAt >= startDate && complaint.createdAt <= endDate) {
                const point = trendMap.get(dateKey(complaint.createdAt));
                if (point) point.received += 1;
            }

            const resolvedDays = new Set();
            const rejectedDays = new Set();

            complaint.history?.forEach((entry) => {
                const entryDate = new Date(entry.date);
                if (entryDate < startDate || entryDate > endDate) return;
                if (entry.status === "Resolved") resolvedDays.add(dateKey(entryDate));
                if (entry.status === "Rejected") rejectedDays.add(dateKey(entryDate));
            });

            resolvedDays.forEach((key) => {
                const point = trendMap.get(key);
                if (point) point.resolved += 1;
            });
            rejectedDays.forEach((key) => {
                const point = trendMap.get(key);
                if (point) point.rejected += 1;
            });
        });

        return res.status(200).json({
            success: true,
            data: {
                range: { startDate, endDate },
                summary: {
                    received: received.length,
                    resolved: resolved.length,
                    rejected: rejected.length,
                    pending: pending.length,
                    inProgress: inProgress.length,
                    resolvedFromReceived: resolvedFromReceived.length,
                    averageResolutionHours,
                    resolutionRate: received.length
                        ? Number(((resolvedFromReceived.length / received.length) * 100).toFixed(1))
                        : 0
                },
                statusBreakdown,
                categoryBreakdown,
                departmentBreakdown,
                trend: [...trendMap.values()],
                complaints: reportComplaints.slice(0, 100)
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllComplaints,
    getAdminComplaintById,
    getAdminComplaintSuggestions,
    updateComplaintStatus,
    getDashboardStats,
    getAnalytics
};
