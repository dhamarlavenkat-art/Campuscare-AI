const mongoose = require("mongoose");
const Room = require("../models/room.model");
const Complaint = require("../models/complaint.model");

const normalizeText = (value) => value?.trim();

const getInfrastructureOptions = async (req, res) => {
    try {
        const rooms = await Room.find({ active: true })
            .select("building floor floorLabel roomNumber name roomType assets")
            .sort({ building: 1, floor: 1, roomNumber: 1 });

        return res.status(200).json({ success: true, data: rooms });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getRooms = async (req, res) => {
    try {
        const filter = { active: true };

        if (req.query.building) {
            filter.building = normalizeText(req.query.building);
        }

        if (req.query.floor !== undefined && req.query.floor !== "") {
            filter.floor = Number(req.query.floor);
        }

        const rooms = await Room.find(filter).sort({
            building: 1,
            floor: 1,
            roomNumber: 1
        });

        const roomIds = rooms.map((room) => room._id);
        const complaintCounts = await Complaint.aggregate([
            {
                $match: {
                    "location.room": { $in: roomIds },
                    department: {
                        $regex: `^${req.user.department.trim()}$`,
                        $options: "i"
                    },
                    status: { $in: ["Pending", "In Progress"] }
                }
            },
            {
                $group: {
                    _id: "$location.room",
                    count: { $sum: 1 }
                }
            }
        ]);

        const counts = new Map(
            complaintCounts.map((item) => [item._id.toString(), item.count])
        );

        const data = rooms.map((room) => ({
            ...room.toObject(),
            openComplaintCount: counts.get(room._id.toString()) || 0
        }));

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getRoomDetails = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid room ID" });
        }

        const room = await Room.findOne({ _id: req.params.id, active: true });

        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        const complaintFilter = {
            "location.room": room._id,
            department: {
                $regex: `^${req.user.department.trim()}$`,
                $options: "i"
            }
        };

        if (req.query.status) {
            complaintFilter.status = req.query.status;
        }

        if (req.query.assetType) {
            complaintFilter["location.assetType"] = req.query.assetType;
        }

        const complaints = await Complaint.find(complaintFilter)
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        const assetIssues = await Complaint.aggregate([
            {
                $match: {
                    "location.room": room._id,
                    "location.assetId": { $ne: null },
                    department: {
                        $regex: `^${req.user.department.trim()}$`,
                        $options: "i"
                    },
                    status: { $in: ["Pending", "In Progress"] }
                }
            },
            {
                $group: {
                    _id: "$location.assetId",
                    affected: { $sum: { $ifNull: ["$location.affectedQuantity", 1] } },
                    complaints: { $sum: 1 }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            data: { room, complaints, assetIssues }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createRoom = async (req, res) => {
    try {
        const { building, floor, roomNumber, roomType, capacity, department, assets } = req.body;

        if (!building?.trim() || floor === undefined || !roomNumber?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Building, floor and room number are required"
            });
        }

        const normalizedAssets = Array.isArray(assets) ? assets : [];
        const invalidAsset = normalizedAssets.some(
            (asset) => !asset.type?.trim() || Number(asset.quantity) < 1
        );

        if (invalidAsset) {
            return res.status(400).json({
                success: false,
                message: "Each asset needs a type and a quantity of at least one"
            });
        }

        const assetsWithNames = normalizedAssets.map((asset) => ({
            ...asset,
            name: asset.type.trim(),
            assetCode: "",
            quantity: Number(asset.quantity),
            working: Number(asset.quantity),
            faulty: 0,
            underMaintenance: 0
        }));

        const room = await Room.create({
            building: building.trim(),
            buildingCode: "",
            floor: Number(floor),
            floorLabel: "",
            roomNumber: roomNumber.trim(),
            name: "",
            roomType: normalizeText(roomType) || "Classroom",
            capacity: Number(capacity) || 0,
            department: normalizeText(department) || "General",
            assets: assetsWithNames
        });

        return res.status(201).json({ success: true, message: "Room created", data: room });
    } catch (error) {
        const status = error.code === 11000 ? 409 : 500;
        const message = error.code === 11000
            ? "This room already exists in the selected building and floor"
            : error.message;
        return res.status(status).json({ success: false, message });
    }
};

const updateAsset = async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId);
        const asset = room?.assets.id(req.params.assetId);

        if (!room || !asset) {
            return res.status(404).json({ success: false, message: "Room or asset not found" });
        }

        ["name", "type", "assetCode", "quantity", "working", "faulty", "underMaintenance"].forEach((field) => {
            if (req.body[field] !== undefined) {
                asset[field] = req.body[field];
            }
        });

        if (asset.working + asset.faulty + asset.underMaintenance > asset.quantity) {
            return res.status(400).json({
                success: false,
                message: "Working, faulty and maintenance counts cannot exceed total quantity"
            });
        }

        await room.save();
        return res.status(200).json({ success: true, message: "Asset updated", data: room });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const seedInfrastructure = async (req, res) => {
    try {
        const existing = await Room.countDocuments({ building: "Main Block" });

        if (existing > 0) {
            return res.status(409).json({
                success: false,
                message: "Main Block infrastructure has already been initialized"
            });
        }

        const rooms = Array.from({ length: 20 }, (_, index) => {
            const roomNumber = String(301 + index);
            const isLab = roomNumber === "312";
            const isRoom319 = roomNumber === "319";

            return {
                building: "Main Block",
                buildingCode: "MB",
                floor: 3,
                floorLabel: "3rd Floor",
                roomNumber,
                name: isLab ? "Computer Lab" : `Classroom ${roomNumber}`,
                roomType: isLab ? "Computer Lab" : "Classroom",
                capacity: isLab ? 40 : 60,
                department: isLab ? "IT" : "General",
                assets: isRoom319
                    ? [
                          { name: "Ceiling Fans", type: "Fan", quantity: 6, working: 5, faulty: 1 },
                          { name: "Tube Lights", type: "Light", quantity: 12, working: 10, faulty: 2 },
                          { name: "Classroom Projector", type: "Projector", quantity: 1, working: 0, faulty: 1 },
                          { name: "Smart Board", type: "Smart Board", quantity: 1, working: 1, faulty: 0 },
                          { name: "Air Conditioners", type: "AC", quantity: 2, working: 2, faulty: 0 },
                          { name: "Plug Points", type: "Plug Point", quantity: 8, working: 7, faulty: 1 }
                      ]
                    : isLab
                      ? [
                            { name: "Lab Computers", type: "Computer", quantity: 40, working: 37, faulty: 3 },
                            { name: "Air Conditioners", type: "AC", quantity: 4, working: 3, faulty: 1 },
                            { name: "Lab Projector", type: "Projector", quantity: 1, working: 1, faulty: 0 }
                        ]
                      : [
                            { name: "Ceiling Fans", type: "Fan", quantity: 6, working: 6, faulty: 0 },
                            { name: "Tube Lights", type: "Light", quantity: 10, working: 10, faulty: 0 },
                            { name: "Classroom Projector", type: "Projector", quantity: 1, working: 1, faulty: 0 }
                        ]
            };
        });

        const created = await Room.insertMany(rooms);
        return res.status(201).json({
            success: true,
            message: "Main Block 3rd Floor was initialized",
            data: created
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getInfrastructureOptions,
    getRooms,
    getRoomDetails,
    createRoom,
    updateAsset,
    seedInfrastructure
};
