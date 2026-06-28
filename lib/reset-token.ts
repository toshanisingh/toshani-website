import { prisma } from "@/lib/prisma";
import { ADMIN_EMAIL } from "@/lib/admin";
import { encodeToken, decodeToken, versionFromBasis } from "@/lib/token-codec";

// Stateless, single-use password setup / reset tokens. No DB table required.
//
// The token payload carries a `v` (version) derived from the admin's CURRENT
// password state:
//   - no account yet       -> version of the literal "setup"
//   - password already set  -> version of the stored passwordHash
// Once a password is created or changed, that version changes, so any token
// minted against the old state stops verifying — giving us single-use
// semantics (and self-expiry on reset) without persisting anything. The crypto
// (sign/verify/expiry) lives in lib/token-codec.ts and is unit-tested there.

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// A short fingerprint of the current password state, used as the token version.
async function currentVersion(): Promise<string> {
  const user = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  return versionFromBasis(user?.passwordHash ?? "setup");
}

export async function createResetToken(): Promise<string> {
  return encodeToken({
    email: ADMIN_EMAIL,
    exp: Date.now() + TOKEN_TTL_MS,
    v: await currentVersion(),
  });
}

type VerifyResult =
  | { valid: true; email: string }
  | { valid: false; reason: "malformed" | "bad-signature" | "expired" | "stale" };

export async function verifyResetToken(token: string): Promise<VerifyResult> {
  const decoded = decodeToken(token);
  if (!decoded.ok) return { valid: false, reason: decoded.reason };

  const { payload } = decoded;
  if (payload.email !== ADMIN_EMAIL) return { valid: false, reason: "stale" };
  if (payload.v !== (await currentVersion())) return { valid: false, reason: "stale" };

  return { valid: true, email: ADMIN_EMAIL };
}
