import Link from "next/link";

// Social links live here for now; in a later phase they move to SiteSettings
// so they can be edited from the admin area and reused on the About page.
const socials = [
  { href: "https://twitter.com/", label: "X" },
  { href: "https://www.linkedin.com/", label: "LinkedIn" },
  { href: "https://github.com/", label: "GitHub" },
];

export function Footer() {
  return (
    <footer className="border-t border-sky-edge/60 bg-sky-softer">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} Toshani. Built with Next.js.
        </p>
        <nav className="flex items-center gap-4">
          {socials.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted transition-colors hover:text-primary"
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
