import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/prisma";
import { ADMIN_EMAIL } from "@/lib/admin";

// Full auth config (Node runtime). Single-admin: the password lives in the
// database (User row keyed by ADMIN_EMAIL) and is set by the admin via the
// first-time setup / reset flow — not in the environment. No multi-user roles
// (see PLAN.md requirement #1).
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

        // Only the bound admin email can ever authenticate.
        if (email !== ADMIN_EMAIL) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null; // account not set up yet

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: "Admin" };
      },
    }),
  ],
});
