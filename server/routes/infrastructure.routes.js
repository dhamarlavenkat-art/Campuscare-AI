const express = require("express");
const authenticateToken = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const {
    getInfrastructureOptions,
    getRooms,
    getRoomDetails,
    createRoom,
    updateAsset,
    seedInfrastructure
} = require("../controllers/infrastructure.controller");

const router = express.Router();

router.use(authenticateToken);
router.get("/options", getInfrastructureOptions);

router.use(adminMiddleware);
router.get("/rooms", getRooms);
router.get("/rooms/:id", getRoomDetails);
router.post("/rooms", createRoom);
router.patch("/rooms/:roomId/assets/:assetId", updateAsset);
router.post("/seed", seedInfrastructure);

module.exports = router;
