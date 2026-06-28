// The single admin account is bound to this email address. Hardcoded by
// request; can be overridden with the ADMIN_EMAIL env var if it ever changes.
export const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "toshani.s333@gmail.com"
)
  .trim()
  .toLowerCase();
