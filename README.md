# PhraseChu

PhraseChu is a mobile-first personal English-learning PWA built around useful expressions and active recall.

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:6683`. Production verification:

```bash
pnpm lint
pnpm build
```

## Kimi setup

The “How would you say…” helper is optional. Copy `.env.example` to `.env.local` and set:

```bash
MOONSHOT_API_KEY=your_server_only_key
KIMI_BASE_URL=https://api.moonshot.cn/v1
KIMI_MODEL=kimi-k2.6
```

`MOONSHOT_API_KEY` is read only inside `app/api/phrase/route.ts`. It is never bundled into browser code. Without a key, the rest of the app remains fully usable and the helper explains how to enable it.

## Supabase cloud sync setup

Cloud sync is optional. Run [`supabase/phrasechu-sync.sql`](supabase/phrasechu-sync.sql) once in **Supabase Dashboard → SQL Editor**, then set these server-side variables locally and in Vercel:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

The table has Row Level Security enabled and no direct table grants. PhraseChu reaches it through two narrowly scoped database functions. The app generates a high-entropy personal sync code and sends only its SHA-256 hash to Supabase. Keep the code private because it grants access to that backup.

## Deploy with GitHub and Vercel

1. Push this directory to GitHub.
2. Import the repository in Vercel. Vercel detects Next.js automatically; no custom build configuration is required.
3. Add the three Kimi variables in **Project Settings → Environment Variables** if you want the AI helper. Add `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` there if you want cloud sync.
4. Deploy. The manifest and service worker activate in production, so the app can be added to a phone’s home screen.

Secrets, local environment files, Next.js output, and the local `.vercel` directory are excluded by `.gitignore`.

## Data

The app ships with 200 expressions across 20 seed scenarios. Kimi suggestions can be saved into **My Phrases** and immediately join the same search, practice, progress, and favorite flows. Listen mode mixes optional TTS questions into regular practice, and single-word lookup provides IPA, a concise meaning, and browser speech. Expressions, progress, favorites, settings, session resume state, practice attempts, and completed-session summaries are stored through `LocalRepository` in browser storage. Those activity records drive the real daily plan, listening queue, weekly accuracy, focused weak-expression practice, and recent-session history. **Cloud sync** merges the complete learning history on startup, after local changes, when the app returns to the foreground, and on demand. The **Backup & transfer** controls remain available as an offline file fallback.
