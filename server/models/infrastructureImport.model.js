const mongoose = require("mongoose");

const importRoomSchema = new mongoose.Schema(
    {
        building: { type: String, required: true, trim: true },
        floor: { type: Number, required: true, min: 0 },
        roomNumber: { type: String, required: true, trim: true },
        roomType: { type: String, default: "Classroom", trim: true },
        department: { type: String, default: "General", trim: true },
        capacity: { type: Number, default: 0, min: 0 },
        assets: {
            type: [{ type: { type: String, required: true }, quantity: { type: Number, min: 1 } }],
            default: []
        },
        action: { type: String, enum: ["create", "update"], default: "create" },
        warnings: { type: [String], default: [] }
    },
    { _id: false }
);

const infrastructureImportSchema = new mongoose.Schema(
    {
        sourceType: {
            type: String,
            enum: ["spreadsheet", "blueprint"],
            required: true
        },
        originalFilename: { type: String, required: true, trim: true },
        status: {
            type: String,
            enum: ["draft", "published", "failed"],
            default: "draft"
        },
        rooms: { type: [importRoomSchema], default: [] },
        validationErrors: { type: [String], default: [] },
        extractionNotes: { type: [String], default: [] },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        publishedAt: { type: Date, default: null },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
    },
    { timestamps: true }
);

infrastructureImportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("InfrastructureImport", infrastructureImportSchema);
