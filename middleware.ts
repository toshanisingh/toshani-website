import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Run the edge-safe auth check on admin routes only. The `authorized` callback
// in auth.config.ts decides access.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};
