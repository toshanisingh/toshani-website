"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

// Returns an error message string on failure, or redirects to /admin on success.
export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
  } catch (error) {
    // A successful signIn throws a redirect (NEXT_REDIRECT) that must propagate.
    if (error instanceof AuthError) {
      return "Invalid email or password.";
    }
    throw error;
  }
}
