"use server";

import { headers } from "next/headers";
import { ADMIN_EMAIL } from "@/lib/admin";
import { createResetToken } from "@/lib/reset-token";
import { sendResetEmail } from "@/lib/email";

// Build the origin for reset links from a TRUSTED, configured value only.
// Deriving it from the request Host header would allow reset-link poisoning
// (an attacker spoofs Host so the emailed link points at their server). So we
// only fall back to the request host in development.
async function baseUrl(): Promise<string> {
  const configured = process.env.AUTH_URL || process.env.APP_URL;
  if (configured) return configured.replace(/\/$/, "");

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_URL (or APP_URL) must be set in production to build reset links safely.",
    );
  }

  // Dev only: header-derived origin is acceptable on localhost.
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

// Simple in-memory throttle so the (known, hardcoded) admin address can't be
// mail-bombed and the Resend quota can't be drained. One send per minute.
const COOLDOWN_MS = 60_000;
let lastSentAt = 0;

// Always returns the same generic message regardless of the email entered, so
// the endpoint never reveals which address is the admin.
export async function requestReset(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string> {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const generic = "If that address is the admin account, a setup link has been sent.";

  if (email === ADMIN_EMAIL) {
    const now = Date.now();
    if (now - lastSentAt < COOLDOWN_MS) return generic; // throttled, silently
    lastSentAt = now;

    try {
      const token = await createResetToken();
      const link = `${await baseUrl()}/reset?token=${encodeURIComponent(token)}`;
      await sendResetEmail(ADMIN_EMAIL, link);
    } catch (err) {
      console.error("[forgot] failed to send reset link:", err);
      return "Something went wrong sending the email. Please try again.";
    }
  }

  return generic;
}
