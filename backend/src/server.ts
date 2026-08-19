import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import connectDB from "./config/db";

import dotenv from "dotenv";
dotenv.config({ override: true });

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
import { upsertLiveGps, listLiveGps, getTrack, normalizeUnitGpsId } from "./services/gpsLiveStore";
import {
  assignedGpsUnitIds,
  canPostGpsForUnit,
  filterLiveGps,
} from "./services/gpsAccess";
import { issueGpsShareTicket, peekGpsShareTicket } from "./services/gpsShareTickets";
import { verifyGmailConnection } from "./config/mailer";
import { verifyToken } from "./middlewares/auth";
import { requirePermission } from "./middlewares/authorize";
import { PERMISSIONS } from "./auth/permissions";
import { CAM_PROXY_MAX_BYTES, assertCamProxyTarget } from "./utils/camProxyGuard";
import { resolveWebBuildId } from "./utils/webBuildId";
import { getAppLinkConfig } from "./utils/appLinks";

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

function isPrivateLanHost(host: string) {
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) return true;
  const parts = host.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return false;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

function isAllowedCorsOrigin(origin?: string | null) {
  if (!origin) return true;
  const extra = String(process.env.CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
  const allow = new Set([
    "https://voltabs.mx",
    "https://www.voltabs.mx",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:19006",
    "http://127.0.0.1:19006",
    ...extra,
  ]);
  const clean = origin.replace(/\/$/, "");
  if (allow.has(clean)) return true;
  try {
    const u = new URL(origin);
    return isPrivateLanHost(u.hostname);
  } catch {
    return false;
  }
}

const corsOptions: cors.CorsOptions = {
  origin: (origin, cb) => {
    if (isAllowedCorsOrigin(origin)) return cb(null, true);
    return cb(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

const SW_PUSH = `self.addEventListener('push', (event) => {
  let data = { title: 'Volta', body: '', data: {} };
  try { data = event.data ? event.data.json() : data; } catch (e) {}
  event.waitUntil(self.registration.showNotification(data.title || 'Volta', {
    body: data.body || '',
    data: data.data || {},
    icon: '/favicon.png'
  }));
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/Dashboard'));
});
`;

app.get("/sw-push.js", (_req, res) => {
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Service-Worker-Allowed", "/");
  res.send(SW_PUSH);
});

app.get("/.well-known/apple-app-site-association", async (_req, res) => {
  const { appleTeamId } = await getAppLinkConfig();
  res.setHeader("Content-Type", "application/json");
  res.json({
    applinks: {
      apps: [],
      details: appleTeamId
        ? [{ appID: `${appleTeamId}.com.volta.app`, paths: ["*"] }]
        : [],
    },
  });
});

app.get("/.well-known/assetlinks.json", async (_req, res) => {
  const { androidCertSha256 } = await getAppLinkConfig();
  res.setHeader("Content-Type", "application/json");
  res.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.volta.app",
        sha256_cert_fingerprints: androidCertSha256 ? [androidCertSha256] : [],
      },
    },
  ]);
});

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

function verifyGpsPoster(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ticket = String(req.header("X-Gps-Ticket") || "").trim();
  if (ticket) {
    const row = peekGpsShareTicket(ticket);
    if (!row) {
      res.status(401).json({ error: "ticket inválido o expirado" });
      return;
    }
    (req as any).gpsTicket = row;
    (req as any).user = { _id: row.userId, id: row.userId };
    next();
    return;
  }
  return verifyToken(req, res, next);
}

/** GPS en vivo + última posición + recorrido del día. */
app.get("/api/gps/live", verifyToken, async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const allowed = await assignedGpsUnitIds((req as any).user);
  res.json(filterLiveGps(listLiveGps(), allowed));
});

app.get("/api/gps/track/:unitId", verifyToken, async (req, res) => {
  const unitId = normalizeUnitGpsId(req.params.unitId);
  if (!unitId) {
    res.status(400).json({ error: "unitId requerido" });
    return;
  }
  const allowed = await assignedGpsUnitIds((req as any).user);
  if (allowed && !allowed.has(unitId)) {
    res.status(403).json({ error: "No puedes ver esta unidad" });
    return;
  }
  res.setHeader("Cache-Control", "no-store");
  res.json(getTrack(unitId));
});

app.post("/api/gps/share-ticket", verifyToken, async (req, res) => {
  const unitId = normalizeUnitGpsId(req.body?.unitId ?? req.body?.unit);
  if (!unitId) {
    res.status(400).json({ error: "unitId requerido" });
    return;
  }
  const user = (req as any).user;
  if (!(await canPostGpsForUnit(user, unitId))) {
    res.status(403).json({ error: "No puedes compartir GPS de esta unidad" });
    return;
  }
  const issued = issueGpsShareTicket(String(user._id || user.id), unitId);
  res.json({ ...issued, unitId });
});

app.post("/api/gps/live", verifyGpsPoster, async (req, res) => {
  const unitId = normalizeUnitGpsId(req.body?.unitId ?? req.body?.unit);
  const lat = Number(req.body?.lat);
  const lng = Number(req.body?.lng);
  if (!unitId) {
    res.status(400).json({ error: "unitId requerido" });
    return;
  }
  const ticketRow = (req as any).gpsTicket as { unitId: string } | undefined;
  if (ticketRow) {
    if (unitId !== ticketRow.unitId) {
      res.status(403).json({ error: "ticket no corresponde a esta unidad" });
      return;
    }
  } else if (!(await canPostGpsForUnit((req as any).user, unitId))) {
    res.status(403).json({ error: "No puedes enviar GPS de esta unidad" });
    return;
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    res.status(400).json({ error: "lat/lng inválidos" });
    return;
  }
  if (lat === 0 && lng === 0) {
    res.status(400).json({ error: "coordenadas vacías" });
    return;
  }
  const row = upsertLiveGps(
    unitId,
    lat,
    lng,
    String(req.body?.ubicacion || "Celular · GPS")
  );
  res.json({ ok: true, unitId, lat: row.lat, lng: row.lng });
});

/** Página móvil: comparte GPS del teléfono a Volta (ticket corto, no JWT). */
app.get("/gps-phone", (req, res) => {
  const unit = normalizeUnitGpsId(req.query.unit) || "002"
  const ticket = String(req.query.g || "").trim()
  res.setHeader("Cache-Control", "no-store")
  res.type("html").send(`<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <title>Volta · GPS</title>
  <style>
    body{font-family:system-ui,sans-serif;margin:0;padding:24px;background:#0f1419;color:#e8eef5}
    h1{font-size:1.25rem;margin:0 0 8px}
    p{opacity:.85;line-height:1.4}
    .ok{color:#3ddc97}.err{color:#ff6b6b}
    button{margin-top:16px;width:100%;padding:14px;border:0;border-radius:10px;background:#2f6fed;color:#fff;font-size:1rem;font-weight:600}
    code{background:#1c2430;padding:2px 6px;border-radius:4px}
  </style>
</head>
<body>
  <h1>Volta · GPS unidad <code id="u">${unit}</code></h1>
  <p id="st">Pulsa para compartir ubicación con el mapa de Cámaras. Debes abrir esta página desde la app.</p>
  <button id="btn" type="button">Compartir GPS</button>
  <script>
    const unitId = ${JSON.stringify(unit)};
    const ticket = ${JSON.stringify(ticket)};
    try { history.replaceState({}, '', location.pathname + '?unit=' + encodeURIComponent(unitId)); } catch (e) {}
    const st = document.getElementById('st');
    let watchId = null;
    async function send(lat, lng) {
      const headers = { 'Content-Type': 'application/json', 'X-Gps-Ticket': ticket };
      const res = await fetch('/api/gps/live', {
        method: 'POST',
        headers,
        body: JSON.stringify({ unitId, lat, lng, ubicacion: 'Celular · GPS' })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
    }
    function start() {
      if (!ticket) {
        st.className = 'err';
        st.textContent = 'Falta autorización. Abre esta página desde Volta (Compartir GPS).';
        return;
      }
      if (!navigator.geolocation) {
        st.className = 'err';
        st.textContent = 'Este navegador no da GPS. Prueba Firefox o pega lat,lng en Volta.';
        return;
      }
      st.className = '';
      st.textContent = 'Obteniendo GPS… deja la pantalla encendida.';
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          try {
            await send(pos.coords.latitude, pos.coords.longitude);
            st.className = 'ok';
            st.textContent = 'Enviando · ' + pos.coords.latitude.toFixed(5) + ', ' + pos.coords.longitude.toFixed(5);
          } catch (e) {
            st.className = 'err';
            st.textContent = 'No se pudo enviar a Volta.';
          }
        },
        (err) => {
          st.className = 'err';
          st.textContent = 'GPS bloqueado (' + (err.message || err.code) + '). En Chrome a veces falla por HTTP; usa Firefox o pega coords en Volta.';
        },
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
      );
    }
    document.getElementById('btn').onclick = start;
  </script>
</body>
</html>`)
})

/**
 * Proxy de cámaras IP (IP Webcam / HTTP snapshot).
 * Evita CORS al pedir http://192.168.x.x desde el navegador.
 */
app.get(
  "/api/cam-proxy",
  verifyToken,
  requirePermission(PERMISSIONS.UNITS_MANAGE),
  async (req, res) => {
  try {
    let url: URL;
    try {
      url = assertCamProxyTarget(String(req.query.u || ""));
    } catch (e) {
      res.status(400).send(e instanceof Error ? e.message : "u inválida");
      return;
    }
    const upstream = await fetch(url.toString(), {
      redirect: "error",
      signal: AbortSignal.timeout(10000),
      headers: {
        Accept: "image/jpeg,multipart/x-mixed-replace,application/json,*/*",
        Connection: "close",
      },
    });
    if (!upstream.ok) {
      res.status(upstream.status).send(`upstream ${upstream.status}`);
      return;
    }
    const len = Number(upstream.headers.get("content-length") || 0);
    if (len > CAM_PROXY_MAX_BYTES) {
      res.status(502).send("respuesta demasiado grande");
      return;
    }
    const buf = Buffer.from(await upstream.arrayBuffer());
    if (buf.length > CAM_PROXY_MAX_BYTES) {
      res.status(502).send("respuesta demasiado grande");
      return;
    }
    const ct = upstream.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", ct);
    res.setHeader("Cache-Control", "no-store, no-cache");
    res.end(buf);
  } catch (err) {
    res
      .status(502)
      .send(err instanceof Error ? err.message : "No se pudo conectar a la cámara");
  }
});

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
    version: "1.0.6",
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
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads") || req.path.startsWith("/.well-known") || req.path === "/sw-push.js") return next();

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
