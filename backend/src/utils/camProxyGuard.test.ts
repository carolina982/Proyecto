import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertCamProxyTarget } from "./camProxyGuard";

describe("assertCamProxyTarget", () => {
  it("acepta HTTP LAN en puerto permitido", () => {
    const url = assertCamProxyTarget("http://192.168.1.20:8080/shot.jpg");
    assert.equal(url.hostname, "192.168.1.20");
    assert.equal(url.port, "8080");
  });
  it("rechaza host público", () => {
    assert.throws(() => assertCamProxyTarget("http://8.8.8.8/shot.jpg"), /host no permitido/);
  });
  it("rechaza DNS", () => {
    assert.throws(() => assertCamProxyTarget("http://camara.local/shot.jpg"), /host no permitido/);
  });
  it("rechaza puerto fuera de lista", () => {
    assert.throws(() => assertCamProxyTarget("http://10.0.0.8:22/"), /puerto no permitido/);
  });
});
