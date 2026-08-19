import fs from "fs";
import path from "path";
import webpush from "web-push";
import User from "../models/User";

type VapidKeys = { publicKey: string; privateKey: string };

const vapidFile = path.join(__dirname, "../../data/vapid.json");

function readEnvKeys(): VapidKeys | null {
  const publicKey = String(process.env.WEB_PUSH_PUBLIC_KEY || "").trim();
  const privateKey = String(process.env.WEB_PUSH_PRIVATE_KEY || "").trim();
  if (publicKey && privateKey) return { publicKey, privateKey };
  return null;
}

function loadOrCreateKeys(): VapidKeys {
  const fromEnv = readEnvKeys();
  if (fromEnv) return fromEnv;
  try {
    if (fs.existsSync(vapidFile)) {
      const parsed = JSON.parse(fs.readFileSync(vapidFile, "utf8")) as VapidKeys;
      if (parsed?.publicKey && parsed?.privateKey) return parsed;
    }
  } catch (err) {
    console.warn("[web-push] No se pudo leer vapid.json:", err);
  }
  const generated = webpush.generateVAPIDKeys();
  try {
    fs.mkdirSync(path.dirname(vapidFile), { recursive: true });
    fs.writeFileSync(vapidFile, JSON.stringify(generated, null, 2));
    console.log("[web-push] Claves VAPID generadas en data/vapid.json");
  } catch (err) {
    console.warn("[web-push] No se pudieron guardar claves VAPID:", err);
  }
  return generated;
}

const keys = loadOrCreateKeys();
const subject = `mailto:${process.env.EMAIL_USER || "noreply@voltabs.mx"}`;
webpush.setVapidDetails(subject, keys.publicKey, keys.privateKey);

export function getVapidPublicKey() {
  return keys.publicKey;
}

export async function sendWebPushToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  const user = await User.findById(userId).select("webPushSubscriptions");
  const subs = user?.webPushSubscriptions || [];
  if (!subs.length) return;

  const payload = JSON.stringify({ title, body, data: data || {} });
  const stale: string[] = [];

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) stale.push(sub.endpoint);
        else console.warn("[web-push] Envío falló:", status || err);
      }
    })
  );

  if (stale.length) {
    await User.findByIdAndUpdate(userId, {
      $pull: { webPushSubscriptions: { endpoint: { $in: stale } } },
    });
  }
}
