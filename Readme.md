# Toshani

A personal website and blog with an admin-managed CMS — write posts in a
rich-text editor, organize them into sections and tags, and let readers react
and share. Built with the Next.js App Router and deployed on Vercel.

## Features

- **Admin-only content** — a single admin (bound to one email) signs in to
  manage everything; the public site is read-only.
- **Sections & pages** — create sections (e.g. _Blogs_, _Books_, _About Me_);
  add pages within them. Sections can also hold their own content, so an
  _About Me_ section can show a bio with no child page.
- **Rich-text editor** (Tiptap) — headings (H1–H6), fonts, text color,
  bold/italic/underline/strikethrough, lists, quotes, code blocks, links, and
  **images** (upload or by URL) with **size presets** (small/medium/large/full).
  Uploaded images are downscaled + compressed in the browser before upload.
- **Drafts & publishing** — write privately, publish when ready.
- **Tags & search** — tag pages; browse by tag; full-text-ish search over
  titles, excerpts, and tags.
- **Organize by date or tag** — sort section listings newest/oldest and filter
  by tag.
- **Reactions** — readers Like/Love posts, sections, and tags (one per visitor).
- **Social sharing** — share bar (X, LinkedIn, WhatsApp, Facebook, copy link)
  with per-page Open Graph / Twitter card metadata.
- **About & socials** — configurable social links shown site-wide and on the
  About section.
- **SEO** — sitemap, RSS feed, and robots.txt.
- **Light-blue, educational theme.**

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) + React + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (Neon) via Prisma 6 |
| Auth | Auth.js v5 (Credentials, single admin) |
| Editor | Tiptap v3 |
| Image storage | Vercel Blob |
| Email | Resend (password setup / reset links) |
| Hosting | Vercel |

> Prisma is pinned to v6 because v7 does not support odd-numbered Node releases.

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#    then fill in the values (see below)

# 3. Apply the database schema
npm run db:migrate

# 4. Run the dev server
npm run dev          # http://localhost:3000
```

### First-time admin setup

There is no seeded password. Visit **`/login` → "First time, or forgot your
password?"**, enter the admin email, and follow the emailed link (or, if
`RESEND_API_KEY` is unset in dev, the link printed to the server console) to set
your password.

## Environment variables

See `.env.example` for the full list. Summary:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon pooled connection (runtime) |
| `DIRECT_URL` | Neon direct connection (migrations) |
| `AUTH_SECRET` | Session signing (also signs reset links) — `npx auth secret` |
| `RESEND_API_KEY` | Sends password setup/reset emails (dev falls back to console) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store token for image uploads |
| `AUTH_URL` / `APP_URL` | Public site origin — **required in production** for reset links |
| `ADMIN_EMAIL` | Optional override of the hardcoded admin email |

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run db:migrate` | Create + apply a migration (dev) |
| `npm run db:deploy` | Apply pending migrations (CI/prod) |
| `npm run db:studio` | Open Prisma Studio |

## Deployment (Vercel)

1. Import the repo into Vercel; set **Framework Preset → Next.js**.
2. Add all environment variables (including `AUTH_URL`/`APP_URL` set to the
   deployed URL, and the **public** Blob store's `BLOB_READ_WRITE_TOKEN`).
3. Deploy. Migrations run against the same Neon database the app uses.

## Project structure

```
app/                 routes (public pages, /admin, API, sitemap/feed/robots)
components/          UI: editor, reactions, share bar, page cards, …
lib/                 prisma client, auth guard, render/sanitize, helpers
prisma/              schema + migrations
```

## Notes on safety

- Rich-text is stored as Tiptap JSON and rendered through a strict HTML
  sanitizer (allowlisted tags/attributes; inline `style` limited to
  font-family/color/text-align; image/link URL schemes restricted).
- Every admin mutation re-checks the session server-side — middleware guards
  page navigation, but server actions and route handlers verify auth themselves.
