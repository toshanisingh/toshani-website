import Link from "next/link";

// Dashboard placeholder. Section + page management land in Phases 4–5.
const tiles = [
  { href: "/admin/sections", title: "Sections", desc: "Create and order site sections.", soon: false },
  { href: "/admin/pages", title: "Pages", desc: "Write and manage posts with the rich-text editor.", soon: false },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Dashboard</h1>
      <div className="grid gap-5 sm:grid-cols-2">
        {tiles.map((t) => {
          const inner = (
            <>
              <h2 className="text-lg font-semibold text-primary">{t.title}</h2>
              <p className="mt-2 text-sm text-muted">{t.desc}</p>
              {t.soon && (
                <span className="mt-3 inline-block rounded-full bg-sky-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                  Coming in a later phase
                </span>
              )}
            </>
          );
          return t.soon ? (
            <div key={t.href} className="rounded-xl border border-sky-edge/60 bg-white p-6">
              {inner}
            </div>
          ) : (
            <Link
              key={t.href}
              href={t.href}
              className="rounded-xl border border-sky-edge/60 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
