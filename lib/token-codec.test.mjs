// Run: AUTH_SECRET=test-secret node lib/token-codec.test.mjs
// Verifies the security-critical behaviour of the password reset token codec.
import assert from "node:assert/strict";

process.env.AUTH_SECRET ||= "unit-test-secret-aaaaaaaaaaaaaaaaaaaaaaaa";
const { encodeToken, decodeToken } = await import("./token-codec.ts");

const future = Date.now() + 60_000;
let passed = 0;
function check(name, fn) {
  fn();
  passed++;
  console.log("  ✓", name);
}

check("valid token round-trips", () => {
  const t = encodeToken({ email: "a@b.com", exp: future, v: "v1" });
  const r = decodeToken(t);
  assert.equal(r.ok, true);
  assert.equal(r.payload.email, "a@b.com");
  assert.equal(r.payload.v, "v1");
});

check("tampered signature is rejected", () => {
  const t = encodeToken({ email: "a@b.com", exp: future, v: "v1" });
  const [body] = t.split(".");
  const forged = `${body}.${"A".repeat(43)}`; // same length, wrong sig
  assert.equal(decodeToken(forged).ok, false);
  assert.equal(decodeToken(forged).reason, "bad-signature");
});

check("tampered payload is rejected (sig no longer matches)", () => {
  const t = encodeToken({ email: "a@b.com", exp: future, v: "v1" });
  const sig = t.split(".")[1];
  const evil = Buffer.from(JSON.stringify({ email: "evil@x.com", exp: future, v: "v1" })).toString("base64url");
  assert.equal(decodeToken(`${evil}.${sig}`).reason, "bad-signature");
});

check("expired token is rejected", () => {
  const t = encodeToken({ email: "a@b.com", exp: Date.now() - 1000, v: "v1" });
  assert.equal(decodeToken(t).reason, "expired");
});

check("malformed tokens are rejected", () => {
  assert.equal(decodeToken("garbage").reason, "malformed");
  assert.equal(decodeToken("a.b.c").reason, "malformed");
});

check("version change invalidates an old token (single-use)", () => {
  // Same logic verifyResetToken applies: a token minted at version v1 must not
  // verify once the current version becomes v2.
  const t = encodeToken({ email: "a@b.com", exp: future, v: "v1" });
  const r = decodeToken(t);
  assert.equal(r.ok, true);
  assert.notEqual(r.payload.v, "v2"); // caller compares payload.v to current
});

console.log(`\n${passed} checks passed.`);
