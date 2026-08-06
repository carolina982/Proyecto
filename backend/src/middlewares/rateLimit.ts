type Bucket = {
  count: number;
  resetAt: number;
  lastAt: number;
};

const store = new Map<string, Bucket>();

const cleanup = () => {
  const now = Date.now();
  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) store.delete(key);
  }
};

setInterval(cleanup, 60_000).unref?.();

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number; message: string };

/**
 * Límite simple en memoria (por proceso).
 * Sirve para proteger forgot-password sin dependencia extra.
 */
export function checkRateLimit(options: {
  key: string;
  /** Máximo de intentos en la ventana */
  max: number;
  /** Ventana en ms */
  windowMs: number;
  /** Mínimo entre un intento y el siguiente (ms). 0 = sin cooldown */
  minIntervalMs?: number;
  message?: string;
}): RateLimitResult {
  const now = Date.now();
  const minIntervalMs = options.minIntervalMs ?? 0;
  let bucket = store.get(options.key);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + options.windowMs, lastAt: 0 };
  }

  if (minIntervalMs > 0 && bucket.lastAt && now - bucket.lastAt < minIntervalMs) {
    const retryAfterSec = Math.ceil((minIntervalMs - (now - bucket.lastAt)) / 1000);
    store.set(options.key, bucket);
    return {
      ok: false,
      retryAfterSec,
      message:
        options.message ||
        `Espera ${retryAfterSec}s antes de solicitar otro código.`,
    };
  }

  if (bucket.count >= options.max) {
    const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    store.set(options.key, bucket);
    return {
      ok: false,
      retryAfterSec,
      message:
        options.message ||
        `Demasiados intentos. Intenta de nuevo en ${retryAfterSec}s.`,
    };
  }

  bucket.count += 1;
  bucket.lastAt = now;
  store.set(options.key, bucket);
  return { ok: true };
}

export function clientIp(req: { ip?: string; headers: Record<string, unknown> }): string {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.trim()) {
    return xf.split(",")[0].trim();
  }
  if (Array.isArray(xf) && xf[0]) return String(xf[0]).split(",")[0].trim();
  return String(req.ip || "unknown");
}
