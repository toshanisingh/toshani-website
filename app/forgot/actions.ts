"use server";

import { headers } from "next/headers";
import { ADMIN_EMAIL } from "@/lib/admin";
import { createResetToken } from "@/lib/reset-token";
import { sendResetEmail } from "@/lib/email";

async function baseUrl(): Promise<string> {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// Always returns the same generic message regardless of the email entered, so
// the endpoint never reveals which address is the admin.
export async function requestReset(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string> {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const generic = "If that address is the admin account, a setup link has been sent.";

  if (email === ADMIN_EMAIL) {
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
