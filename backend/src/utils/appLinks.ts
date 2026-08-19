import Settings, { SETTINGS_KEY } from "../models/Settings";

export function normalizeAppleTeamId(raw: string): string {
  return String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
}

/** SHA-256 de firma Android: 32 bytes en pares hex separados por : */
export function normalizeAndroidCertSha256(raw: string): string {
  const hex = String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/[^0-9A-F]/g, "");
  if (hex.length !== 64) return "";
  return hex.match(/.{2}/g)!.join(":");
}

export async function getAppLinkConfig(): Promise<{
  appleTeamId: string;
  androidCertSha256: string;
}> {
  const fromEnvTeam = normalizeAppleTeamId(process.env.APPLE_TEAM_ID || "");
  const fromEnvSha = normalizeAndroidCertSha256(process.env.ANDROID_CERT_SHA256 || "");
  try {
    const doc = await Settings.findOne({ key: SETTINGS_KEY }).lean();
    const extras = ((doc as { extras?: Record<string, unknown> } | null)?.extras ||
      {}) as Record<string, unknown>;
    const fromDbTeam = normalizeAppleTeamId(String(extras.appleTeamId || ""));
    const fromDbSha = normalizeAndroidCertSha256(String(extras.androidCertSha256 || ""));
    return {
      appleTeamId: fromDbTeam || fromEnvTeam,
      androidCertSha256: fromDbSha || fromEnvSha,
    };
  } catch {
    return { appleTeamId: fromEnvTeam, androidCertSha256: fromEnvSha };
  }
}
