import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

// Full auth config (Node runtime). Single-admin: credentials are checked
// against ADMIN_EMAIL + ADMIN_PASSWORD_HASH from the environment — no database
// lookup and no multi-user roles (see PLAN.md requirement #1).
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const adminHash = process.env.ADMIN_PASSWORD_HASH;
        if (!adminEmail || !adminHash) {
          console.error("ADMIN_EMAIL / ADMIN_PASSWORD_HASH are not configured.");
          return null;
        }

        if (email !== adminEmail) return null;
        const ok = await bcrypt.compare(password, adminHash);
        if (!ok) return null;

        return { id: "admin", email: adminEmail, name: "Admin" };
      },
    }),
  ],
});
