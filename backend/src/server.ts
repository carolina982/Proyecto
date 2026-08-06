import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import connectDB from "./config/db";

import dotenv from "dotenv";
dotenv.config();

import announcement from "./routes/announcementRoutes";
import authRoutes from "./routes/authRoutes";
import { startChecklistInicioPurgeJob } from "./jobs/purgeChecklistInicio";
import { errorHandeler } from "./middlewares/errorHandler";
import { blockFacturaStatic } from "./middlewares/blockFacturaStatic";
import notificationRoutes from "./routes/notificationRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import tripRoutes from "./routes/tripRoutes";
import unitRoutes from "./routes/unitRoutes";
import userRoutes from "./routes/userRoutes";
import viaticRoutes from "./routes/viaticRoutes";
import { getActiveMailer } from "./services/emailService";
import { verifyGmailConnection } from "./config/mailer";
import { resolveWebBuildId } from "./utils/webBuildId";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
// Necesario si hay proxy/nginx para rate-limit por IP real
app.set("trust proxy", 1);
connectDB();
startChecklistInicioPurgeJob();
console.log(`Mailer activo: ${getActiveMailer()} (solo Gmail SMTP)`);
void verifyGmailConnection();

const uploadsPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Frontend web (Expo export) — misma máquina / mismo dominio
const webDist = process.env.VOLTA_WEB_DIST
  ? path.resolve(process.env.VOLTA_WEB_DIST)
  : path.join(__dirname, "../../volta-frontend/dist");

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors());

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use("/uploads", blockFacturaStatic, express.static(uploadsPath));

app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/viatics", viaticRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/announcements", announcement);
app.use("/api/auth", authRoutes);

app.get("/api", (_req, res) => {
  res.status(200).json({ ok: true, service: "volta-api" });
});

/** Build id del frontend (entry-*.js) para forzar reload en clientes. */
app.get("/api/app-version", (_req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.json({
    buildId: resolveWebBuildId(webDist),
    version: "1.0.5",
  });
});

function setStaticCacheHeaders(res: express.Response, filePath: string) {
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

if (fs.existsSync(webDist)) {
  app.use(
    express.static(webDist, {
      extensions: ["html"],
      index: "index.html",
      etag: true,
      lastModified: true,
      setHeaders: setStaticCacheHeaders,
    })
  );

  app.get("*", (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next();

    const clean = req.path.replace(/\/+$/, "") || "/";
    const candidates = [
      path.join(webDist, clean + ".html"),
      path.join(webDist, clean, "index.html"),
      path.join(webDist, "index.html"),
    ];
    for (const file of candidates) {
      if (fs.existsSync(file) && file.startsWith(webDist)) {
        setStaticCacheHeaders(res, file);
        return res.sendFile(file);
      }
    }
    const notFound = path.join(webDist, "+not-found.html");
    if (fs.existsSync(notFound)) {
      setStaticCacheHeaders(res, notFound);
      return res.status(404).sendFile(notFound);
    }
    return res.status(404).json({ message: "No encontrado" });
  });
  console.log(`Web UI desde ${webDist} (build ${resolveWebBuildId(webDist)})`);
} else {
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

app.use(errorHandeler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
