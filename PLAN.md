# Toshani Website — Plan

A personal website for a student to write blogs, with admin-only content management.

## Choices
- **Custom-coded** Next.js app (full control, lives in this repo)
- Built by someone **comfortable with code**
- **Free / cheapest-possible** hosting

## Tech stack (all free-tier)
| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) + React + TypeScript | Site + admin + API in one repo |
| Styling | Tailwind CSS | Light-blue design tokens |
| Database | **Neon Postgres** (Vercel Postgres) | NOT SQLite — Vercel FS is ephemeral |
| ORM | Prisma | Migrations, type safety |
| Auth | Auth.js (NextAuth), Credentials, single admin | No RBAC; admin from env |
| Editor | **Tiptap** | "Word-like" inline rich text; store JSON |
| Images | **Vercel Blob** (or Cloudinary) | Upload endpoint → blob → URL (no local disk) |
| Hosting | Vercel free tier | Git push = deploy |

## Data model
```
Section   id, name, slug, order, createdAt          # admin-created (req #1)
Page      id, sectionId, title, slug, body(Tiptap JSON),
          excerpt, coverImageUrl, draft, publishedAt,
          createdAt, updatedAt
Tag       id, name, slug
PageTag   pageId, tagId   (many-to-many)            # req #3, #4
User      id, email, passwordHash                    # single admin
```

## Requirements → implementation
1. **Admin-only sections** — `/admin` gated by Auth.js; public site read-only.
2. **Word-like editor** — Tiptap toolbar (headings, bold/italic, lists, links, quotes, code, images). Image upload → `/api/upload` → Vercel Blob → URL. Save Tiptap JSON; sanitize on render.
3. **Tagging** — tag input on editor; `/tags/[slug]`; search via tag filter + Postgres full-text / ILIKE.
4. **Blog organization** — `/blogs` sortable by `publishedAt` or tag.
5. **Light-blue educational theme** — tokens below.
6. **Social sharing on every page** — share bar (X, LinkedIn, WhatsApp, Copy) via intent URLs + per-page Open Graph / Twitter-card meta via `generateMetadata`.
7. **About + social links** — About is a Section/Page; social links in config/SiteSettings, shown in About + footer.

## Theme tokens
```
primary    #2563EB
sky        #E0F2FE / #BAE6FD
accent     #0EA5E9
ink        #0F172A on #F8FAFC
fonts      Inter (UI) + Lora (article body)
```

## Routes
```
/                     home / latest
/[section]            section landing
/[section]/[slug]     page/post (+ share bar, OG)
/tags/[tag]           pages by tag
/search?q=            search
/admin                dashboard (auth)
/admin/sections      manage sections
/admin/pages/new     editor
/admin/pages/[id]    edit
/api/upload          image upload → blob
/api/auth/...        Auth.js
```

## Build phases
1. Scaffold — Next.js + TS + Tailwind, theme, layout/header/footer
2. DB + Prisma — Neon, schema, migrate
3. Auth — Auth.js single-admin, protect /admin
4. Sections CRUD + public section pages
5. Pages + Tiptap editor + image upload + draft/publish
6. Tags + search + blog date/tag organization
7. Share bar + OG metadata sitewide
8. About + social links, SEO (sitemap, RSS), deploy
