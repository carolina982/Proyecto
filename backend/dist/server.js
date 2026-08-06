"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("./config/db"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const announcementRoutes_1 = __importDefault(require("./routes/announcementRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const purgeChecklistInicio_1 = require("./jobs/purgeChecklistInicio");
const errorHandler_1 = require("./middlewares/errorHandler");
const blockFacturaStatic_1 = require("./middlewares/blockFacturaStatic");
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const settingsRoutes_1 = __importDefault(require("./routes/settingsRoutes"));
const tripRoutes_1 = __importDefault(require("./routes/tripRoutes"));
const unitRoutes_1 = __importDefault(require("./routes/unitRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const viaticRoutes_1 = __importDefault(require("./routes/viaticRoutes"));
const emailService_1 = require("./services/emailService");
const mailer_1 = require("./config/mailer");
const webBuildId_1 = require("./utils/webBuildId");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
// Necesario si hay proxy/nginx para rate-limit por IP real
app.set("trust proxy", 1);
(0, db_1.default)();
(0, purgeChecklistInicio_1.startChecklistInicioPurgeJob)();
console.log(`Mailer activo: ${(0, emailService_1.getActiveMailer)()} (solo Gmail SMTP)`);
void (0, mailer_1.verifyGmailConnection)();
const uploadsPath = path_1.default.join(__dirname, "../uploads");
if (!fs_1.default.existsSync(uploadsPath)) {
    fs_1.default.mkdirSync(uploadsPath, { recursive: true });
}
// Frontend web (Expo export) — misma máquina / mismo dominio
const webDist = process.env.VOLTA_WEB_DIST
    ? path_1.default.resolve(process.env.VOLTA_WEB_DIST)
    : path_1.default.join(__dirname, "../../volta-frontend/dist");
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options("*", (0, cors_1.default)());
app.use(express_1.default.json({ limit: "20mb" }));
app.use(express_1.default.urlencoded({ limit: "20mb", extended: true }));
app.use("/uploads", blockFacturaStatic_1.blockFacturaStatic, express_1.default.static(uploadsPath));
app.use("/api/users", userRoutes_1.default);
app.use("/api/notifications", notificationRoutes_1.default);
app.use("/api/trips", tripRoutes_1.default);
app.use("/api/units", unitRoutes_1.default);
app.use("/api/viatics", viaticRoutes_1.default);
app.use("/api/settings", settingsRoutes_1.default);
app.use("/api/announcements", announcementRoutes_1.default);
app.use("/api/auth", authRoutes_1.default);
app.get("/api", (_req, res) => {
    res.status(200).json({ ok: true, service: "volta-api" });
});
/** Build id del frontend (entry-*.js) para forzar reload en clientes. */
app.get("/api/app-version", (_req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.json({
        buildId: (0, webBuildId_1.resolveWebBuildId)(webDist),
        version: "1.0.5",
    });
});
function setStaticCacheHeaders(res, filePath) {
    const lower = filePath.toLowerCase().replace(/\\/g, "/");
    if (lower.endsWith(".html")) {
        // HTML nunca en caché: apunta al JS hasheado correcto tras cada deploy
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        return;
    }
    if (lower.includes("/_expo/static/")) {
        // Bundles con hash: cache largo (el nombre cambia en cada build)
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        return;
    }
    res.setHeader("Cache-Control", "public, max-age=300, must-revalidate");
}
if (fs_1.default.existsSync(webDist)) {
    app.use(express_1.default.static(webDist, {
        extensions: ["html"],
        index: "index.html",
        etag: true,
        lastModified: true,
        setHeaders: setStaticCacheHeaders,
    }));
    app.get("*", (req, res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD")
            return next();
        if (req.path.startsWith("/api") || req.path.startsWith("/uploads"))
            return next();
        const clean = req.path.replace(/\/+$/, "") || "/";
        const candidates = [
            path_1.default.join(webDist, clean + ".html"),
            path_1.default.join(webDist, clean, "index.html"),
            path_1.default.join(webDist, "index.html"),
        ];
        for (const file of candidates) {
            if (fs_1.default.existsSync(file) && file.startsWith(webDist)) {
                setStaticCacheHeaders(res, file);
                return res.sendFile(file);
            }
        }
        const notFound = path_1.default.join(webDist, "+not-found.html");
        if (fs_1.default.existsSync(notFound)) {
            setStaticCacheHeaders(res, notFound);
            return res.status(404).sendFile(notFound);
        }
        return res.status(404).json({ message: "No encontrado" });
    });
    console.log(`Web UI desde ${webDist} (build ${(0, webBuildId_1.resolveWebBuildId)(webDist)})`);
}
else {
    app.get("/", (_req, res) => {
        res.status(200).json({
            ok: true,
            name: "Volta API",
            domain: "voltabs.mx",
            hint: "Frontend web no encontrado; API activa en /api",
        });
    });
    console.warn(`Web UI no encontrada en ${webDist}`);
}
app.use(errorHandler_1.errorHandeler);
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
