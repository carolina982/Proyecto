import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeAndroidCertSha256, normalizeAppleTeamId } from "./appLinks";

describe("appLinks", () => {
  it("normaliza Team ID", () => {
    assert.equal(normalizeAppleTeamId(" ab12cd34ef "), "AB12CD34EF");
  });
  it("normaliza SHA-256 con o sin dos puntos", () => {
    const hex = "A".repeat(64);
    const colon = "AA:".repeat(31) + "AA";
    assert.equal(normalizeAndroidCertSha256(hex), colon);
    assert.equal(normalizeAndroidCertSha256(colon.toLowerCase()), colon);
  });
  it("rechaza SHA inválido", () => {
    assert.equal(normalizeAndroidCertSha256("abc"), "");
  });
});
