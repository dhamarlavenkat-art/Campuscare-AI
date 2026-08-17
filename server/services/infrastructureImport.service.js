const ExcelJS = require("exceljs");
const { parse: parseCsv } = require("csv-parse/sync");
const Room = require("../models/room.model");

const departments = [
    "General", "Administration", "IT", "Library", "Hostel", "Transport",
    "Examination", "Maintenance", "Accounts", "Sports", "Placement", "Security"
];

const assetColumns = {
    fans: "Fan",
    fan: "Fan",
    lights: "Light",
    light: "Light",
    projectors: "Projector",
    projector: "Projector",
    computers: "Computer",
    computer: "Computer",
    servers: "Server",
    server: "Server",
    routers: "Router",
    router: "Router",
    switches: "Switch",
    switch: "Switch",
    ac: "AC",
    airconditioners: "AC",
    smartboards: "Smart Board",
    smartboard: "Smart Board",
    cctv: "CCTV",
    ups: "UPS",
    printers: "Printer",
    printer: "Printer",
    plugpoints: "Plug Point",
    furniture: "Furniture",
    labequipment: "Lab Equipment"
};

const cleanHeader = (value = "") => String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const cleanText = (value) => String(value ?? "").trim();

const valueFrom = (row, aliases) => {
    const entries = Object.entries(row);
    const match = entries.find(([key]) => aliases.includes(cleanHeader(key)));
    return match ? match[1] : undefined;
};

const parseAssetList = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) {
        return value
            .map((asset) => ({
                type: cleanText(asset?.type),
                quantity: Number(asset?.quantity)
            }))
            .filter((asset) => asset.type && Number.isInteger(asset.quantity) && asset.quantity > 0);
    }

    return String(value)
        .split(/[;,]/)
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
            const [type, quantity] = part.split(/[:=]/).map((item) => item.trim());
            return { type, quantity: Number(quantity) };
        })
        .filter((asset) => asset.type && Number.isFinite(asset.quantity) && asset.quantity > 0);
};

const normalizeImportRows = async (rawRows) => {
    const errors = [];
    const normalized = [];
    const seen = new Set();

    rawRows.forEach((row, index) => {
        const rowNumber = index + 2;
        const building = cleanText(valueFrom(row, ["building", "block", "buildingname"]));
        const floorValue = valueFrom(row, ["floor", "floornumber", "level"]);
        const floor = floorValue === null || floorValue === undefined || floorValue === ""
            ? Number.NaN
            : Number(floorValue);
        const roomNumber = cleanText(valueFrom(row, ["roomnumber", "roomno", "room", "roomid"]));
        const roomType = cleanText(valueFrom(row, ["roomtype", "spacetype", "type"])) || "Classroom";
        const departmentValue = cleanText(valueFrom(row, ["department", "responsibledepartment"]));
        const department = departments.find(
            (item) => item.toLowerCase() === departmentValue.toLowerCase()
        ) || "General";
        const capacityValue = valueFrom(row, ["capacity", "seats", "strength"]);
        const capacity = capacityValue === undefined || capacityValue === "" ? 0 : Number(capacityValue);

        const rowErrors = [];
        if (!building) rowErrors.push("building is required");
        if (!Number.isInteger(floor) || floor < 0) rowErrors.push("floor must be a whole number of 0 or more");
        if (!roomNumber) rowErrors.push("room number is required");
        if (!Number.isFinite(capacity) || capacity < 0) rowErrors.push("capacity must be 0 or more");

        const key = `${building.toLowerCase()}|${floor}|${roomNumber.toLowerCase()}`;
        if (seen.has(key)) rowErrors.push("room is duplicated in this file");
        seen.add(key);

        const assets = [];
        Object.entries(row).forEach(([header, value]) => {
            const assetType = assetColumns[cleanHeader(header)];
            if (!assetType || value === "" || value === undefined || value === null) return;

            const quantity = Number(value);
            if (!Number.isInteger(quantity) || quantity < 0) {
                rowErrors.push(`${header} must be a whole number of 0 or more`);
            } else if (quantity > 0) {
                assets.push({ type: assetType, quantity });
            }
        });

        assets.push(...parseAssetList(valueFrom(row, ["assets", "otherassets"])));

        if (rowErrors.length) {
            errors.push(`Row ${rowNumber}: ${rowErrors.join(", ")}`);
            return;
        }

        const warnings = [];
        if (departmentValue && department === "General" && departmentValue.toLowerCase() !== "general") {
            warnings.push(`Unknown department “${departmentValue}” was changed to General`);
        }

        normalized.push({
            building,
            floor,
            roomNumber,
            roomType,
            department,
            capacity,
            assets,
            action: "create",
            warnings
        });
    });

    if (normalized.length) {
        const existing = await Room.find({
            $or: normalized.map((room) => ({
                building: room.building,
                floor: room.floor,
                roomNumber: room.roomNumber
            }))
        }).select("building floor roomNumber");

        const existingKeys = new Set(
            existing.map((room) => `${room.building.toLowerCase()}|${room.floor}|${room.roomNumber.toLowerCase()}`)
        );

        normalized.forEach((room) => {
            const key = `${room.building.toLowerCase()}|${room.floor}|${room.roomNumber.toLowerCase()}`;
            room.action = existingKeys.has(key) ? "update" : "create";
        });
    }

    return { rooms: normalized, errors };
};

const cellValue = (cell) => {
    const value = cell.value;
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
        if (value.result !== undefined) return value.result;
        if (value.text !== undefined) return value.text;
        if (Array.isArray(value.richText)) return value.richText.map((part) => part.text).join("");
    }
    return value;
};

const parseSpreadsheet = async (buffer, filename = "") => {
    if (filename.toLowerCase().endsWith(".csv")) {
        return parseCsv(buffer, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            bom: true,
            relax_column_count: true
        });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new Error("The workbook does not contain a sheet");

    const headers = [];
    sheet.getRow(1).eachCell({ includeEmpty: true }, (cell, columnNumber) => {
        headers[columnNumber] = cleanText(cellValue(cell));
    });

    const rows = [];
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const record = {};
        let hasValue = false;
        headers.forEach((header, columnNumber) => {
            if (!header) return;
            const value = cellValue(row.getCell(columnNumber));
            record[header] = value;
            if (cleanText(value)) hasValue = true;
        });
        if (hasValue) rows.push(record);
    });

    return rows;
};

const createTemplateWorkbook = async () => {
    const rows = [
        {
            Building: "PG Block", Floor: 3, "Room Number": "319", "Room Type": "Classroom",
            Department: "Maintenance", Capacity: 60, Fans: 6, Lights: 12,
            Projectors: 1, Computers: 0, AC: 2, Servers: 0, "Smart Boards": 1, CCTV: 0
        },
        {
            Building: "PG Block", Floor: 3, "Room Number": "320", "Room Type": "Computer Lab",
            Department: "IT", Capacity: 40, Fans: 4, Lights: 10,
            Projectors: 1, Computers: 40, AC: 2, Servers: 1, "Smart Boards": 0, CCTV: 1
        }
    ];
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Infrastructure");
    sheet.columns = Object.keys(rows[0]).map((header, index) => ({
        header,
        key: header,
        width: [18, 9, 14, 18, 20, 10, 9, 9, 12, 12, 8, 10, 14, 9][index] || 14
    }));
    sheet.addRows(rows);
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } };
    sheet.views = [{ state: "frozen", ySplit: 1 }];
    return Buffer.from(await workbook.xlsx.writeBuffer());
};

module.exports = {
    createTemplateWorkbook,
    normalizeImportRows,
    parseSpreadsheet
};
