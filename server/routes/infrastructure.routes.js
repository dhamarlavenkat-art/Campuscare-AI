const express = require("express");
const authenticateToken = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const superAdminMiddleware = require("../middleware/superAdmin.middleware");
const uploadInfrastructureFile = require("../middleware/infrastructureUpload.middleware");
const {
    getInfrastructureOptions,
    getRooms,
    getRoomDetails,
    createRoom,
    updateAsset,
    seedInfrastructure
} = require("../controllers/infrastructure.controller");
const {
    downloadInfrastructureTemplate,
    previewBlueprint,
    previewInfrastructureSpreadsheet,
    publishInfrastructureImport
} = require("../controllers/infrastructureImport.controller");

const router = express.Router();

router.use(authenticateToken);
router.get("/options", getInfrastructureOptions);

router.use(adminMiddleware);
router.get("/imports/template", superAdminMiddleware, downloadInfrastructureTemplate);
router.post(
    "/imports/spreadsheet/preview",
    superAdminMiddleware,
    uploadInfrastructureFile,
    previewInfrastructureSpreadsheet
);
router.post(
    "/imports/blueprint/preview",
    superAdminMiddleware,
    uploadInfrastructureFile,
    previewBlueprint
);
router.post("/imports/:id/publish", superAdminMiddleware, publishInfrastructureImport);
router.get("/rooms", getRooms);
router.get("/rooms/:id", getRoomDetails);
router.post("/rooms", createRoom);
router.patch("/rooms/:roomId/assets/:assetId", updateAsset);
router.post("/seed", seedInfrastructure);

module.exports = router;
