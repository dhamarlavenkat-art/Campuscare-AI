const { PDFParse } = require("pdf-parse");
const InfrastructureImport = require("../models/infrastructureImport.model");
const Room = require("../models/room.model");
const { extractInfrastructureFromBlueprint } = require("../services/ai.service");
const {
    createTemplateWorkbook,
    normalizeImportRows,
    parseSpreadsheet
} = require("../services/infrastructureImport.service");

const importSummary = (rooms, errors) => ({
    totalValid: rooms.length,
    creates: rooms.filter((room) => room.action === "create").length,
    updates: rooms.filter((room) => room.action === "update").length,
    invalid: errors.length,
    assets: rooms.reduce(
        (total, room) => total + room.assets.reduce((sum, asset) => sum + asset.quantity, 0),
        0
    )
});

const downloadInfrastructureTemplate = async (req, res) => {
    try {
        const workbook = await createTemplateWorkbook();
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Disposition", "attachment; filename=campuscare-infrastructure-template.xlsx");
        return res.send(workbook);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const saveDraft = async ({ req, sourceType, rooms, errors, notes = [] }) => {
    const draft = await InfrastructureImport.create({
        sourceType,
        originalFilename: req.file.originalname,
        rooms,
        validationErrors: errors,
        extractionNotes: notes,
        createdBy: req.user.id
    });

    return draft;
};

const previewInfrastructureSpreadsheet = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Choose an Excel or CSV file" });
        }

        const rawRows = await parseSpreadsheet(req.file.buffer, req.file.originalname);
        if (!rawRows.length) {
            return res.status(400).json({ success: false, message: "The spreadsheet has no data rows" });
        }
        if (rawRows.length > 2000) {
            return res.status(400).json({ success: false, message: "Import a maximum of 2,000 rooms at a time" });
        }

        const { rooms, errors } = await normalizeImportRows(rawRows);
        const draft = await saveDraft({ req, sourceType: "spreadsheet", rooms, errors });

        return res.status(200).json({
            success: true,
            message: "Spreadsheet analyzed. Review it before publishing.",
            data: { importId: draft._id, rooms, errors, notes: [], summary: importSummary(rooms, errors) }
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const previewBlueprint = async (req, res) => {
    let parser;
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Choose a PDF, PNG or JPG blueprint" });
        }

        const isPdf = req.file.mimetype === "application/pdf";
        const isImage = req.file.mimetype.startsWith("image/");
        if (!isPdf && !isImage) {
            return res.status(400).json({ success: false, message: "Blueprints must be PDF, PNG or JPG" });
        }

        let extracted;
        if (isPdf) {
            parser = new PDFParse({ data: req.file.buffer });
            const result = await parser.getText();
            const documentText = result.text?.trim();
            if (!documentText) {
                return res.status(422).json({
                    success: false,
                    message: "This PDF has no readable text. Export the floor plan as PNG/JPG and upload that instead."
                });
            }
            extracted = await extractInfrastructureFromBlueprint({ text: documentText });
        } else {
            if (req.file.size > 4 * 1024 * 1024) {
                return res.status(400).json({
                    success: false,
                    message: "For AI reading, use an image smaller than 4 MB"
                });
            }
            extracted = await extractInfrastructureFromBlueprint({
                buffer: req.file.buffer,
                mimeType: req.file.mimetype
            });
        }

        const defaultBuilding = String(req.body.defaultBuilding || "").trim();
        const defaultFloor = req.body.defaultFloor === "" || req.body.defaultFloor === undefined
            ? null
            : Number(req.body.defaultFloor);
        const enrichedRooms = (extracted.rooms || []).map((room) => ({
            ...room,
            building: String(room.building || "").trim() || defaultBuilding,
            floor: room.floor === null || room.floor === undefined ? defaultFloor : room.floor
        }));
        const { rooms, errors } = await normalizeImportRows(enrichedRooms);
        const notes = [
            "AI extraction is a draft. Verify every room before publishing.",
            ...(extracted.notes || [])
        ];
        const draft = await saveDraft({ req, sourceType: "blueprint", rooms, errors, notes });

        return res.status(200).json({
            success: true,
            message: "AI created a blueprint draft. Review it before publishing.",
            data: { importId: draft._id, rooms, errors, notes, summary: importSummary(rooms, errors) }
        });
    } catch (error) {
        return res.status(422).json({ success: false, message: error.message });
    } finally {
        if (parser) await parser.destroy().catch(() => {});
    }
};

const publishInfrastructureImport = async (req, res) => {
    try {
        const draft = await InfrastructureImport.findOne({
            _id: req.params.id,
            createdBy: req.user.id,
            status: "draft"
        });

        if (!draft) {
            return res.status(404).json({ success: false, message: "Import draft not found or already published" });
        }

        const submittedRooms = Array.isArray(req.body.rooms)
            ? req.body.rooms
            : draft.rooms.map((room) => room.toObject());
        if (!submittedRooms.length || submittedRooms.length > 2000) {
            return res.status(400).json({ success: false, message: "The import must contain 1 to 2,000 rooms" });
        }

        const { rooms, errors } = await normalizeImportRows(submittedRooms);
        if (errors.length) {
            return res.status(400).json({
                success: false,
                message: "Correct the highlighted rows before publishing",
                errors
            });
        }

        const updateExisting = req.body.updateExisting !== false;
        const publishableRooms = updateExisting ? rooms : rooms.filter((room) => room.action === "create");

        if (!publishableRooms.length) {
            return res.status(400).json({ success: false, message: "There are no new rooms to publish" });
        }

        const operations = publishableRooms.map((room) => {
            const assets = room.assets.map((asset) => ({
                name: asset.type,
                type: asset.type,
                assetCode: "",
                quantity: asset.quantity,
                working: asset.quantity,
                faulty: 0,
                underMaintenance: 0
            }));

            return {
                updateOne: {
                    filter: {
                        building: room.building,
                        floor: room.floor,
                        roomNumber: room.roomNumber
                    },
                    update: {
                        $set: {
                            roomType: room.roomType,
                            capacity: room.capacity,
                            department: room.department,
                            assets,
                            active: true
                        },
                        $setOnInsert: {
                            building: room.building,
                            buildingCode: "",
                            floor: room.floor,
                            floorLabel: "",
                            roomNumber: room.roomNumber,
                            name: ""
                        }
                    },
                    upsert: true
                }
            };
        });

        const result = await Room.bulkWrite(operations, { ordered: false });
        draft.rooms = rooms;
        draft.status = "published";
        draft.publishedAt = new Date();
        draft.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await draft.save();

        return res.status(200).json({
            success: true,
            message: `${publishableRooms.length} rooms were published to the college blueprint`,
            data: {
                processed: publishableRooms.length,
                created: result.upsertedCount || 0,
                updated: result.modifiedCount || 0,
                skippedExisting: updateExisting ? 0 : rooms.length - publishableRooms.length
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    downloadInfrastructureTemplate,
    previewBlueprint,
    previewInfrastructureSpreadsheet,
    publishInfrastructureImport
};
