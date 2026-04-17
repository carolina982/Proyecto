"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("./config/db"));
const announcementRoutes_1 = __importDefault(require("./routes/announcementRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const tripRoutes_1 = __importDefault(require("./routes/tripRoutes"));
const unitRoutes_1 = __importDefault(require("./routes/unitRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const viaticRoutes_1 = __importDefault(require("./routes/viaticRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
(0, db_1.default)();
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options("*", (0, cors_1.default)());
app.use(express_1.default.json());
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
app.use("/api/users", userRoutes_1.default);
app.use("/api/trips", tripRoutes_1.default);
app.use("/api/units", unitRoutes_1.default);
app.use("/api/viatics", viaticRoutes_1.default);
app.use("/api/announcements", announcementRoutes_1.default);
app.use("/api/auth", authRoutes_1.default);
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
