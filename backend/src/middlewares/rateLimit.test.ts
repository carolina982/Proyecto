import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkRateLimit, resetRateLimitStoreForTests } from "./rateLimit";

describe("checkRateLimit", () => {
  it("bloquea al superar el máximo", () => {
    resetRateLimitStoreForTests();
    const opts = { key: "test:2fa", max: 2, windowMs: 60_000, message: "tope" };
    assert.equal(checkRateLimit(opts).ok, true);
    assert.equal(checkRateLimit(opts).ok, true);
    const blocked = checkRateLimit(opts);
    assert.equal(blocked.ok, false);
    if (!blocked.ok) assert.equal(blocked.message, "tope");
  });
});
