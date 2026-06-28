import Link from "next/link";

// Placeholder section cards — replaced by real Sections from the DB in Phase 4.
const sections = [
  {
    href: "/blogs",
    title: "Blogs",
    desc: "Thoughts, notes, and things I'm learning along the way.",
  },
  {
    href: "/books",
    title: "Books",
    desc: "Reading notes and short reviews of what I've been reading.",
  },
  {
    href: "/about",
    title: "About Me",
    desc: "Who I am, what I study, and where to find me online.",
  },
];

export default function Home() {
  return (
    <div className="space-y-14">
      <section className="rounded-2xl bg-gradient-to-br from-sky-soft to-sky-softer p-8 sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          Welcome
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          A quiet corner of the web for writing &amp; learning.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          I write about what I&apos;m studying, the books I read, and ideas worth
          keeping. Have a look around.
        </p>
        <Link
          href="/blogs"
          className="mt-6 inline-block rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Read the blog →
        </Link>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight text-ink">Explore</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group rounded-xl border border-sky-edge/60 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-primary">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
