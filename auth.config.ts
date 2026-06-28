import type { NextAuthConfig } from "next-auth";

// Edge-safe config: NO bcrypt, NO Node-only imports. Used by middleware (which
// runs on the edge runtime) and spread into the full config in auth.ts.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [], // real providers are added in auth.ts (Node runtime)
  callbacks: {
    // Gate /admin behind a session. Returning false redirects to signIn page.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      if (isOnAdmin) return isLoggedIn;
      return true;
    },
  },
} satisfies NextAuthConfig;
