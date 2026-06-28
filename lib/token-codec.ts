import { createHmac, timingSafeEqual } from "crypto";

// Pure, DB-free token codec for password setup / reset links.
// Token format: `base64url(JSON payload).base64url(HMAC-SHA256(payload))`.
// Kept free of any app/db imports so it can be unit-tested in isolation.

export type Payload = { email: string; exp: number; v: string };

export type DecodeResult =
  | { ok: true; payload: Payload }
  | { ok: false; reason: "malformed" | "bad-signature" | "expired" };

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return s;
}

function sign(body: string): string {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

export function encodeToken(payload: Payload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

// Verifies the signature, structure and expiry. Does NOT check the version
// (that requires a DB read; done by verifyResetToken in reset-token.ts).
export function decodeToken(token: string): DecodeResult {
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "malformed" };
  const [body, sig] = parts;

  const expected = sign(body);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return { ok: false, reason: "bad-signature" };
  }

  let data: Partial<Payload>;
  try {
    data = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (
    typeof data.email !== "string" ||
    typeof data.exp !== "number" ||
    typeof data.v !== "string"
  ) {
    return { ok: false, reason: "malformed" };
  }
  if (Date.now() > data.exp) return { ok: false, reason: "expired" };

  return { ok: true, payload: { email: data.email, exp: data.exp, v: data.v } };
}
