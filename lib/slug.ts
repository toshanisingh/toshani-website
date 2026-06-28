// URL-safe slug from arbitrary text.
export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "") // strip accents
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "item"
  );
}

// Route segments that must not be claimed by a user-created section slug,
// otherwise the static route would shadow it (e.g. /admin, /login).
export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "login",
  "logout",
  "forgot",
  "reset",
  "_next",
  "search",
  "tags",
]);
