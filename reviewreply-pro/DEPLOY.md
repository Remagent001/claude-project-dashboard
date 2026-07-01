# Putting ReviewReply Pro online (get a clickable link)

This walks you through publishing the app to the web with **Vercel** (free) so
you get a real URL you can open in any browser and share with staff. No coding.

You'll do this once. After that, every time the code updates, the live site
updates automatically.

**Time:** ~10 minutes. **Cost:** $0 to host. (Real AI replies need an API key,
which costs a few cents of usage — optional; the app works without one.)

---

## Before you start

- You need to be able to sign in to **GitHub** (the account that owns
  `claude-project-dashboard`).
- Have this repo handy — the app lives in the **`reviewreply-pro`** folder inside it.

---

## Step 1 — Create a Vercel account

1. Go to **https://vercel.com/signup**.
2. Click **“Continue with GitHub”** and authorize it. (This lets Vercel see your repos.)

## Step 2 — Import the project

1. On the Vercel dashboard, click **“Add New…” → “Project”**.
2. Find **`claude-project-dashboard`** in the list and click **“Import”**.
3. **IMPORTANT — set the folder:** find the **“Root Directory”** setting, click
   **“Edit”**, and choose the **`reviewreply-pro`** folder. (The app lives in
   that subfolder, not the repo root.)
4. Leave the Framework as **Next.js** (Vercel detects it automatically).
5. **Don't click Deploy yet** — do Step 3 first.

## Step 3 — Add the database (one click)

1. Still on the import screen (or under the project's **“Storage”** tab after
   creating it), add a **Postgres** database:
   - Go to the **“Storage”** tab → **“Create Database” → “Postgres”** →
     accept the defaults → **“Connect”** it to this project.
2. That's it. Vercel automatically adds the database connection settings the app
   needs (`POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`). You don't type
   anything.

## Step 4 — Deploy

1. Click **“Deploy”**.
2. Wait ~1–2 minutes. When it finishes you'll get a link like
   **`https://reviewreply-pro-xxxx.vercel.app`** — **that's your app.** Open it.

The database tables are created automatically on that first deploy, and the
salon's brand settings are filled in the first time you open the app.

At this point the app fully works using the **free built-in reply generator**.

---

## Step 5 (optional) — Turn on the real AI

The built-in generator is fine for testing, but Claude/OpenAI write noticeably
better replies. To switch it on:

1. Get an API key:
   - **Anthropic (Claude):** https://console.anthropic.com/ → API Keys, or
   - **OpenAI (GPT):** https://platform.openai.com/ → API Keys.
   - (Either requires adding a payment method; real usage is typically pennies.)
2. In Vercel: your project → **“Settings” → “Environment Variables”** and add:
   - For Claude: `AI_PROVIDER` = `anthropic` and `ANTHROPIC_API_KEY` = *your key*
   - For OpenAI: `AI_PROVIDER` = `openai` and `OPENAI_API_KEY` = *your key*
3. Go to the **“Deployments”** tab → open the latest → **“Redeploy”**.

Your key is stored securely on Vercel's servers and is **never** visible in the
website or to visitors.

---

## Everyday use

- Open your Vercel link → paste a review → pick the details → **Generate**.
- **Copy** the reply you like into your Google Business Profile.
- **Save to history** to build up the duplicate-check memory so you never repeat
  yourself.
- **Export CSV** any time for a record of what you've posted.

## Updating the app later

When the code changes (e.g. new features), Vercel redeploys automatically and
your link stays the same. Nothing for you to do.

## Troubleshooting

- **Blank page or “500” right after deploy:** give it a few seconds and refresh —
  the database sets itself up on first load.
- **Replies look basic / say “template — no API key”:** that's the free
  generator. Do Step 5 to switch on the real AI.
- **Stuck on the Root Directory step:** it must be `reviewreply-pro`. If you
  deployed the repo root by mistake, delete the Vercel project and re-import,
  this time editing Root Directory before deploying.
