# Comments — Plan

Add a **Comments** section at the end of every published post (`/[section]/[slug]`).
Chosen behavior:
- **Anonymous, name-only** commenting (email optional, never shown publicly)
- **Moderated**: new comments are hidden until the admin approves them
- **Threaded replies**: anyone can reply; admin replies get an "Author" badge
- **Likes**: like button with count, one like per visitor (cookie dedup)

> "All pages" = all published posts. Section/tag/home listing pages won't get a
> comment form unless you want that too.

## Data model (one Prisma migration)
```prisma
enum CommentStatus { PENDING APPROVED SPAM }

model Comment {
  id          String        @id @default(cuid())
  page        Page          @relation(fields: [pageId], references: [id], onDelete: Cascade)
  pageId      String
  parent      Comment?      @relation("Thread", fields: [parentId], references: [id], onDelete: Cascade)
  parentId    String?
  replies     Comment[]     @relation("Thread")
  authorName  String
  authorEmail String?       // hidden; for notify only
  body        String        // PLAIN TEXT (escaped on render — no HTML)
  isAdmin     Boolean       @default(false)
  status      CommentStatus @default(PENDING)
  likeCount   Int           @default(0)
  likes       CommentLike[]
  createdAt   DateTime      @default(now())
  @@index([pageId, status, createdAt])
}

model CommentLike {
  id        String   @id @default(cuid())
  comment   Comment  @relation(fields: [commentId], references: [id], onDelete: Cascade)
  commentId String
  visitorId String   // anonymous cookie id
  createdAt DateTime @default(now())
  @@unique([commentId, visitorId])
}
```
Deleting a comment cascade-deletes its replies and likes. (Option: soft-delete
mid-thread comments to a "[removed]" tombstone so replies survive — can add.)

## Public flow (UNAUTHENTICATED — security lives in validation, not auth)
**Submit** (`submitComment` server action):
1. Honeypot hidden field — if filled, silently accept-and-drop (bot).
2. Validate: name 1–80 chars, body 1–3000 chars, email format if present.
3. Rate-limit via **DB count** (comments from this visitor cookie/IP in the last
   N min), NOT an in-memory Map — in-memory resets per serverless instance and
   does nothing in prod. With moderation on, the goal is just "don't let a bot
   hammer the DB/queue."
4. Store **plain text** (no HTML parsed). `parentId` validated to exist, belong
   to the same page, and be APPROVED; reply depth capped (render flattens deep).
5. `status = PENDING` → reader sees "Thanks — awaiting approval."
6. **`isAdmin` is derived server-side from `auth()` only — never a form field.**
   If the requester is the admin, auto-approve + `isAdmin = true`; otherwise
   PENDING. Any client-sent isAdmin is ignored.
7. (Optional) email admin via Resend — the link points to the `requireAdmin`-gated
   `/admin/comments` **UI**, never a one-click `GET` that mutates state (mail
   clients prefetch links and would auto-approve). Approval stays a POST behind auth.

**Like** (`likeComment` server action): visitor cookie id; upsert `CommentLike`
(unique on commentId+visitorId) → toggle like/unlike, adjust `likeCount`. Only
on APPROVED comments. Rate-limited.

## Rendering (on the post page)
- "Comments (N)" heading + comment form at the end of the article.
- Approved comments, threaded (oldest-first top level, replies chronological),
  with name, relative date, **HTML-escaped body** (newlines → `<br>` only; NO
  URL auto-linking in v1 — it re-opens the injection surface), like button +
  count + liked state, and a Reply button opening an inline reply form. Admin
  replies show "Author" badge.
- Thread is fetched as **one flat query** (`findMany` by page + APPROVED) and
  assembled parent→children **in JS** — no nested Prisma includes, no recursion/N+1.
- Pending comments are never shown publicly.

## Admin moderation (`/admin/comments`, all `requireAdmin`)
- Queue: pending first, then approved. Per comment: page link, author, body.
- Actions: **Approve**, **Mark spam**, **Delete**, **Reply** (auto-approved,
  Author badge). Pending count shown in the admin nav.

## Spam protection (layered, free)
Honeypot + rate-limit + moderation queue (nothing public until approved) +
length/link-count heuristics. (Later, if needed: Akismet or hCaptcha.)

## Security
- Comments stored/rendered as **plain text, HTML-escaped** → no stored XSS
  (critical: this is the first public write input in the app).
- Public `submit`/`like` are intentionally unauthenticated; honeypot +
  rate-limit + moderation carry the load. Admin actions gated by `requireAdmin`.
- `visitorId` like-dedup is best-effort (cookie clearable) — fine for likes.

## Build sub-steps
1. Schema + migration (`Comment`, `CommentLike`, enum) + `prisma generate`.
2. Submit action (validate, honeypot, rate-limit, sanitize, moderation) + form + thank-you.
3. Render approved threaded comments under "Comments".
4. Likes (cookie visitor id, toggle, dedup).
5. Replies (inline threaded form; admin auto-approve + badge).
6. Admin `/admin/comments` moderation panel + pending count.
7. (Optional) Resend notification on new comment.
8. Verify: the public submit + like + render paths are **unauthenticated, so I
   can verify them end-to-end here** (seed/curl). Admin moderation needs your login.

## Implementation traps (baked in)
- Build the comment tree in JS from one flat query (above).
- `visitorId` cookie can't be set during Server-Component render — assign it in
  the `like` action on first interaction. So server-rendered "liked" state is
  "not liked" until the visitor acts. Expected, not a bug.

## Open scope decision
- The optional **email field** is used only to notify *you* (admin) of new
  comments. **Reply-notifications to commenters** ("someone replied to you") are
  **out of scope for v1** — fine cut, just flagging it's a deliberate decision.

## Notes
- One DB migration → `npm run db:migrate` adds the enum + 2 tables. It's purely
  **additive** (no changes to existing tables), so safe to run on the live Neon
  DB. **Decide who runs it** — you locally (then commit the migration), or I can
  generate the migration SQL for you to apply.
- Post page stays dynamic; revalidate after approve so newly-approved comments appear.
- Public submit/like/render are unauthenticated, so I **can verify them
  end-to-end** here (the verification gap from earlier phases doesn't apply).
  Key assertion: a freshly-submitted comment lands PENDING and does NOT appear
  publicly. Only approve/reply need your login.
