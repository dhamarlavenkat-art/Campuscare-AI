const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            required: true,
            trim: true
        },
        assetCode: {
            type: String,
            trim: true,
            default: ""
        },
        quantity: {
            type: Number,
            min: 1,
            default: 1
        },
        working: {
            type: Number,
            min: 0,
            default: 1
        },
        faulty: {
            type: Number,
            min: 0,
            default: 0
        },
        underMaintenance: {
            type: Number,
            min: 0,
            default: 0
        }
    },
    { timestamps: true }
);

const roomSchema = new mongoose.Schema(
    {
        building: {
            type: String,
            required: true,
            trim: true
        },
        buildingCode: {
            type: String,
            trim: true,
            default: ""
        },
        floor: {
            type: Number,
            required: true,
            min: 0
        },
        floorLabel: {
            type: String,
            trim: true,
            default: ""
        },
        roomNumber: {
            type: String,
            required: true,
            trim: true
        },
        name: {
            type: String,
            trim: true,
            default: ""
        },
        roomType: {
            type: String,
            trim: true,
            default: "Classroom"
        },
        capacity: {
            type: Number,
            min: 0,
            default: 0
        },
        department: {
            type: String,
            trim: true,
            default: "General"
        },
        assets: {
            type: [assetSchema],
            default: []
        },
        active: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

roomSchema.index(
    { building: 1, floor: 1, roomNumber: 1 },
    { unique: true }
);

module.exports = mongoose.model("Room", roomSchema);
