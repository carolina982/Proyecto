"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const announcementController_1 = require("../controllers/announcementController");
const upload_1 = require("../middlewares/upload");
const validate_1 = require("../middlewares/validate");
const announcementValidator_1 = require("../validators/announcementValidator");
const router = express_1.default.Router();
router.get("/", announcementController_1.getAnnouncements);
router.post("/", upload_1.upload.single("image"), announcementValidator_1.createAnnouncementsValidator, validate_1.validate, announcementController_1.createAnnouncements);
router.put("/:id", upload_1.upload.single("image"), announcementValidator_1.updateAnnouncementValidator, validate_1.validate, announcementController_1.updateAnnouncement);
router.delete("/:id", announcementController_1.deleteAnnouncement);
exports.default = router;
