// Central site configuration: identity, canonical URL, and social links.
// Edit `socials` with your real profile URLs — empty entries are not rendered.

function resolveSiteUrl(): string {
  const explicit = process.env.APP_URL || process.env.AUTH_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export type Social = { label: string; href: string };

export const siteConfig = {
  name: "Toshani",
  description:
    "Notes, blogs, and books — a personal space for writing and learning.",
  url: resolveSiteUrl(),

  // Section slugs treated as the "About Me" page (social links shown there).
  aboutSlugs: ["about", "about-me"],

  // Fill in your profile URLs. Leave a field as "" to hide that link.
  socials: [
    { label: "X", href: "" }, // e.g. "https://x.com/yourhandle"
    { label: "LinkedIn", href: "" }, // e.g. "https://www.linkedin.com/in/you"
    { label: "GitHub", href: "" }, // e.g. "https://github.com/you"
    { label: "Instagram", href: "" }, // e.g. "https://instagram.com/you"
    { label: "Email", href: "" }, // e.g. "mailto:you@example.com"
  ] as Social[],
};

export const activeSocials = siteConfig.socials.filter(
  (s) => s.href.trim() !== "",
);

export function isAboutSlug(slug: string): boolean {
  return siteConfig.aboutSlugs.includes(slug);
}
