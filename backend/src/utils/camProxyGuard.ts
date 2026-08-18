const ALLOWED_PORTS = new Set([80, 443, 554, 8000, 8080, 8081, 8443, 8554, 34567, 37777]);
const MAX_BYTES = 5 * 1024 * 1024;

function isPrivateLanIpv4(host: string): boolean {
  const parts = host.split(".").map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return false;
  }
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

/** Solo IPs LAN de cámaras (sin DNS, loopback, metadata ni redirects). */
export function assertCamProxyTarget(raw: string): URL {
  const target = String(raw || "").trim();
  if (!target || !/^https?:\/\//i.test(target)) {
    throw new Error("u inválida");
  }
  let url: URL;
  try {
    url = new URL(target);
  } catch {
    throw new Error("u inválida");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("u inválida");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host) || !isPrivateLanIpv4(host)) {
    throw new Error("host no permitido");
  }
  const port = url.port ? Number(url.port) : url.protocol === "https:" ? 443 : 80;
  if (!ALLOWED_PORTS.has(port)) {
    throw new Error("puerto no permitido");
  }
  if (url.username || url.password) {
    throw new Error("u inválida");
  }
  return url;
}

export { MAX_BYTES as CAM_PROXY_MAX_BYTES };
