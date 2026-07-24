const { analyzeComplaint } = require("../services/ai.service");
const Complaint = require("../models/complaint.model");

// CREATE COMPLAINT
const createComplaint = async (req, res) => {
    try {
        const { title, description, anonymous } = req.body;

        // AI analyzes the complaint
        const aiResult = await analyzeComplaint(title, description);

        /*
         Check whether a similar unresolved complaint already exists.
         If found, do not create another complaint.
         The frontend can show the existing complaint and a support button.
        */
        const similarComplaint = await Complaint.findOne({
            summary: {
                $regex: aiResult.summary,
                $options: "i"
            },
            status: {
                $nin: ["Resolved", "Rejected"]
            }
        });

        if (similarComplaint) {
            const alreadySupported = similarComplaint.supporters?.some(
                (supporter) =>
                    supporter.user.toString() === req.user.id
            );

            return res.status(200).json({
                success: true,
                duplicate: true,
                message: "A similar complaint already exists.",
                data: {
                    complaintId: similarComplaint._id,
                    title: similarComplaint.title,
                    status: similarComplaint.status,
                    supporters: similarComplaint.supporters?.length || 0,
                    alreadySupported
                }
            });
        }

        const {
            category,
            priority,
            department,
            summary,
            troubleshooting
        } = aiResult;

        const image = req.file ? req.file.filename : "";

        const complaint = await Complaint.create({
            title,
            description,
            category,
            priority,
            department,
            summary,
            troubleshooting,
            anonymous:
                anonymous === true ||
                anonymous === "true",
            image,
            createdBy: req.user.id,

            // Complaint creator automatically supports their complaint
            supporters: [
                {
                    user: req.user.id
                }
            ],

            history: [
                {
                    action: "Complaint Created",
                    status: "Pending",
                    remark: "",
                    updatedBy: "Student"
                }
            ]
        });

        return res.status(201).json({
            success: true,
            duplicate: false,
            message: "Complaint Created Successfully",
            data: complaint
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET LOGGED-IN STUDENT COMPLAINTS
const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({
            createdBy: req.user.id
        }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            count: complaints.length,
            data: complaints
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET ONE COMPLAINT
const getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        // Check existence before accessing complaint properties
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint Not Found"
            });
        }

        // Student can only view their own complaint
        if (complaint.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access Denied"
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

// UPDATE COMPLAINT
const updateComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint Not Found"
            });
        }

        // Owner check
        if (complaint.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access Denied"
            });
        }

        // Resolved or rejected complaints cannot be modified
        if (
            complaint.status === "Resolved" ||
            complaint.status === "Rejected"
        ) {
            return res.status(400).json({
                success: false,
                message: "Complaint cannot be updated"
            });
        }

        /*
         Only allow the student to update safe fields.
         This prevents students from changing status, department,
         priority, createdBy, supporters or history.
        */
        const { title, description, anonymous } = req.body;

        let shouldRunAIAgain = false;

        if (title !== undefined) {
            complaint.title = title;
            shouldRunAIAgain = true;
        }

        if (description !== undefined) {
            complaint.description = description;
            shouldRunAIAgain = true;
        }

        if (anonymous !== undefined) {
            complaint.anonymous =
                anonymous === true ||
                anonymous === "true";
        }

        if (req.file) {
            complaint.image = req.file.filename;
        }

        /*
         If title or description changed, analyze the complaint again
         so category, priority and department remain correct.
        */
        if (shouldRunAIAgain) {
            const aiResult = await analyzeComplaint(
                complaint.title,
                complaint.description
            );

            complaint.category = aiResult.category;
            complaint.priority = aiResult.priority;
            complaint.department = aiResult.department;
            complaint.summary = aiResult.summary;
            complaint.troubleshooting =
                aiResult.troubleshooting;
        }

        complaint.history.push({
            action: "Complaint Updated",
            status: complaint.status,
            remark: "Complaint details updated by student.",
            updatedBy: "Student"
        });

        await complaint.save();

        return res.status(200).json({
            success: true,
            message: "Complaint Updated Successfully",
            data: complaint
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE COMPLAINT
const deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint Not Found"
            });
        }

        // Owner check
        if (complaint.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access Denied"
            });
        }

        // Only pending complaints can be deleted
        if (complaint.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending complaints can be deleted"
            });
        }

        await Complaint.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Complaint Deleted Successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET COMPLAINT HISTORY
const getComplaintHistory = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint Not Found"
            });
        }

        // Student can only view history of their own complaint
        if (complaint.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access Denied"
            });
        }

        return res.status(200).json({
            success: true,
            count: complaint.history?.length || 0,
            history: complaint.history || []
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// SUPPORT AN EXISTING COMPLAINT
const supportComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint Not Found"
            });
        }

        // Prevent supporting closed complaints
        if (
            complaint.status === "Resolved" ||
            complaint.status === "Rejected"
        ) {
            return res.status(400).json({
                success: false,
                message: "This complaint can no longer be supported"
            });
        }

        if (!complaint.supporters) {
            complaint.supporters = [];
        }

        /*
         Compare the supporter user ID with the currently
         logged-in user's ID, not the complaint ID.
        */
        const alreadySupported = complaint.supporters.some(
            (supporter) =>
                supporter.user.toString() === req.user.id
        );

        if (alreadySupported) {
            return res.status(409).json({
                success: false,
                message: "You have already supported this complaint"
            });
        }

        complaint.supporters.push({
            user: req.user.id
        });

        complaint.history.push({
            action: "Complaint Supported",
            status: complaint.status,
            remark: "Another student supported this complaint.",
            updatedBy: "Student"
        });

        await complaint.save();

        return res.status(200).json({
            success: true,
            message: "Complaint Supported Successfully",
            supporters: complaint.supporters.length
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createComplaint,
    getMyComplaints,
    getComplaintById,
    updateComplaint,
    deleteComplaint,
    getComplaintHistory,
    supportComplaint
};