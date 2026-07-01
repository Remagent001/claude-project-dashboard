# ReviewReply Pro

A polished, local-first web app that generates **unique, SEO-friendly, brand-safe
responses to Google reviews** for a premium men's salon —
**Eighteen Eight Fine Men's Salon** (Preston Hollow & West Village, Dallas).

Paste a review, pick the details, and get three ready-to-post reply options
(Short / Standard / Personalized) in the salon's voice — with duplicate
detection so you never post the same reply twice.

---

## Features (MVP)

- **Paste a review** and select star rating, location, service type, staff/barber,
  customer name, and tone.
- **Generate 3 responses** — Short (35–60 words), Standard (70–110), and a more
  Personalized version (100–140).
- **Star-rating-aware strategy** — different, safe playbooks for 5★, 4★, 3★, and 1–2★
  reviews (apologize without admitting fault, take negatives offline, etc.).
- **Copy** and **Save to history** with one click; **Regenerate** for fresh phrasing.
- **Duplicate detection** — every saved/copied reply is normalized and stored in a
  response memory. New drafts are scored against it (cosine similarity) and flagged
  with a *"similar to a past response"* warning; overall **duplicate risk** is shown.
- **Searchable history** with **CSV export** and **delete / clear** controls.
- **Brand voice settings** — business name, brand voice, forbidden/preferred phrases,
  and SEO keywords, all editable in-app.
- **SEO keyword weaving** without keyword-stuffing.
- **Provider abstraction** — use **Anthropic (Claude)** or **OpenAI (GPT)**, swappable
  via env vars. With **no key set**, a built-in template generator runs so you can
  demo the whole flow offline.

## Tech stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS**
- **Postgres** via **Prisma ORM**
- Server-side API routes (API keys never touch the browser)

---

## Put it online (get a clickable link)

Non-technical? The easiest way to actually use this is to publish it to the web
with **Vercel** (free) and get a URL you can open anywhere.

👉 **See [DEPLOY.md](./DEPLOY.md) for a plain-English, click-by-click guide.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

> When importing, set the **Root Directory** to `reviewreply-pro` and add a
> **Postgres** store — Vercel wires up the database connection for you.

---

## Getting started (local development)

> Prefer a live link instead? Skip this and follow [DEPLOY.md](./DEPLOY.md).

You'll need a Postgres database. The quickest free option is a
[Neon](https://neon.tech) database — create one and copy its connection string.

From this `reviewreply-pro/` directory:

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#    Then open .env and set BOTH Postgres URLs to your connection string
#    (they can be identical locally):
#      POSTGRES_PRISMA_URL="postgresql://…"
#      POSTGRES_URL_NON_POOLING="postgresql://…"
#    Optionally paste an AI key where marked (or leave blank for the
#    offline template generator).

# 3. Create the database tables + generate the Prisma client
npm run db:push

# 4. (Optional) Seed default brand settings (also auto-created on first use)
npm run db:seed

# 5. Run the app
npm run dev
```

Open http://localhost:3000.

> **Where do I put my API key?** Only in `.env` (see the `>>> INSERT ... <<<`
> markers in `.env.example`). Keys are read **server-side only** — they are never
> shipped to the browser.

---

## How it works

```
src/
  app/
    page.tsx                 UI: inputs (left), responses (right), history (bottom)
    api/
      generate/route.ts      Builds prompt → calls AI → scores duplicates → persists
      responses/route.ts     Save/copy a response → records it in ResponseMemory
      history/route.ts        List/search history, CSV export, delete/clear
      settings/route.ts       Read/update brand voice settings
  lib/
    ai/                      Provider abstraction: anthropic | openai | fallback
    promptBuilder.ts         Structured system + user prompts (rating rules, SEO)
    similarity.ts            Normalize + cosine similarity (upgradeable to embeddings)
    brand.ts                 Brand settings load/update
    constants.ts             Locations, services, tones, keywords, defaults
prisma/
  schema.prisma             Review, GeneratedResponse, BrandSettings, ResponseMemory
  seed.ts                   Default brand settings
```

### AI JSON contract

The model is asked to return strict JSON:

```json
{
  "short": "...",
  "standard": "...",
  "personalized": "...",
  "riskNotes": "...",
  "seoKeywordsUsed": ["..."],
  "duplicateRisk": "low | medium | high"
}
```

### Duplicate avoidance

1. Every **saved or copied** response is normalized (lowercase, punctuation and
   filler words stripped) and stored in `ResponseMemory`.
2. On each generation, new drafts are compared to memory using cosine similarity.
3. Drafts above the threshold get a **similarity warning**, and recent saved
   responses are fed back to the model as *"avoid this phrasing"* examples.
4. The similarity function is isolated in `src/lib/similarity.ts` so it can be
   swapped for embeddings later without touching callers.

---

## Security & privacy

- API keys live only in `.env` and are used **server-side**; no keys in frontend code.
- Only the data needed for drafting and duplicate detection is stored (Postgres).
- **Delete** individual history items or **Clear all** at any time.
- **Export** your history as CSV.
- Every screen carries the disclaimer: *"Review responses should be reviewed
  before posting."*

---

## Roadmap

- **Phase 2 — Chrome extension** (`/extension`, Manifest V3): read selected review
  text on a Google Business Profile page, generate in a popup, copy back, and
  (later) inject into the reply field.
- **Phase 3 — Team & analytics**: multiple business profiles, manager approval
  workflow, and analytics (volume, avg rating handled, common services, response
  time, duplicate-risk frequency).

Authentication is intentionally **not** built yet — this MVP is local-first.
