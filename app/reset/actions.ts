"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ADMIN_EMAIL } from "@/lib/admin";
import { verifyResetToken } from "@/lib/reset-token";

export async function setPassword(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const token = formData.get("token") as string | null;
  const password = formData.get("password") as string | null;
  const confirm = formData.get("confirm") as string | null;

  if (!token) return "Missing or invalid link.";
  if (!password || password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (password !== confirm) return "Passwords do not match.";

  // Re-verify the token at submit time (it self-invalidates once used).
  const result = await verifyResetToken(token);
  if (!result.valid) {
    return "This link is invalid or has expired. Please request a new one.";
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash },
    create: { email: ADMIN_EMAIL, passwordHash },
  });

  redirect("/login?reset=1");
}
