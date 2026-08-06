import fs from "fs";
import path from "path";

/**
 * Identifica el build web activo leyendo el entry-*.js referenciado en index.html.
 * Evita falsos positivos cuando quedan bundles viejos en dist/.
 */
export function resolveWebBuildId(webDist: string): string {
  try {
    const indexPath = path.join(webDist, "index.html");
    if (fs.existsSync(indexPath)) {
      const html = fs.readFileSync(indexPath, "utf8");
      const match = html.match(/entry-[a-f0-9]+\.js/i);
      if (match) return match[0].replace(/\.js$/i, "");
    }

    const jsDir = path.join(webDist, "_expo/static/js/web");
    if (!fs.existsSync(jsDir)) return "no-dist";

    const entries = fs
      .readdirSync(jsDir)
      .filter((f) => /^entry-.*\.js$/i.test(f))
      .map((f) => ({
        name: f,
        mtime: fs.statSync(path.join(jsDir, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    if (!entries.length) return "no-entry";
    return entries[0].name.replace(/\.js$/i, "");
  } catch {
    return "unknown";
  }
}
