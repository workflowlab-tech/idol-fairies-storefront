# Idol Fairies PH v2

A modern K-pop e-commerce storefront (Next.js + TypeScript + Supabase) with
a hybrid Gemini-powered chatbot: structured product lookups against a live
Supabase catalog, plus a real RAG (pgvector) knowledge base for shipping,
preorder, and store-policy questions — routed by tool-calling, not a
prompt-stuffed hack.

Rebuilt clean from a set of earlier prototypes (see `../PREVIOUS/`), reusing
the same live Supabase `products` table and the existing brand assets.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Supabase/Postgres + pgvector, via `@supabase/supabase-js`
- Gemini (`@google/genai`) — `gemini-3.5-flash` for chat, `gemini-embedding-001` (768-dim) for embeddings
  (pinned rather than the `gemini-flash-latest` alias — that alias currently resolves to a model whose
  free-tier daily quota this key exhausted during testing; a pinned name also avoids surprise behavior
  changes if Google repoints "-latest")
- No other runtime dependencies

## Setup

```bash
npm install
```

`.env.local` already contains the real Supabase publishable/service-role
keys and the Gemini API key for local development — never commit it (it's
gitignored). `.env.example` documents the shape without values.

### One-time database setup (do this once)

`knowledge_base` (the RAG table) doesn't exist until you run it:

1. Open the Supabase SQL Editor for this project (`igsavpvqpxgcnntciudo`).
2. Paste and run **[`sql/001_rag_schema.sql`](sql/001_rag_schema.sql)** — it's idempotent (safe to re-run) and purely additive; it never touches `products`.
3. Run the ingestion script to embed and store the policy content:
   ```bash
   npm run ingest-knowledge
   ```
   Safe to re-run any time you edit `content/knowledge/*.md` — it skips chunks it has already embedded (by content hash) and only inserts what changed.

That's the only manual step. Everything else — schema, content, ingestion logic, chatbot wiring — is already built.

### Run it

```bash
npm run dev
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run ingest-knowledge` | Chunk + embed `content/knowledge/*.md` into Supabase `knowledge_base` |

## Architecture

```
app/                  Routes: home, shop, category pages, product detail,
                       search, cart, faq, about, api/chat
components/            layout / home / products / chat / ui
lib/
  supabase/            client.ts (publishable key, public reads)
                       server.ts (service-role key, server-only)
  products/            queries.ts, format.ts, filters.ts, images.ts
  rag/                 embed.ts, chunk.ts, retrieve.ts
  chat/                tools.ts (Gemini function declarations), systemPrompt.ts
  cart/                context.tsx (localStorage cart via useSyncExternalStore)
content/knowledge/     Original Idol Fairies PH policy docs (RAG source)
scripts/
  ingest-knowledge.ts  Chunk → embed → idempotent upsert
  generate-placeholders.mjs  One-off branded placeholder image generator
sql/001_rag_schema.sql The one migration to run in Supabase
types/                 product.ts, chat.ts, cart.ts
                       (RAG chunk/match types live next to their usage in lib/rag/)
```

### Product data

Read-only via the Supabase publishable key against the existing `products`
table (110 rows: Album, Light Stick, Magazine, DICON, Photobook,
Collectable). Never written to. Since none of the 110 rows currently have a
real `image_url`, every product falls back to 3 branded placeholder images
per category (`public/placeholders/`, `scripts/generate-placeholders.mjs`)
— real photos always win once `image_url` is populated.

### Chatbot routing

`/api/chat` gives Gemini two tools and lets it decide which to call (or
both, for a mixed question):

- **`search_products`** — exact Supabase filters (artist/category/price/
  availability). The only path for stock, price, and release-date facts.
- **`search_policy`** — embeds the question and does pgvector cosine
  similarity search against `knowledge_base`. The only path for shipping,
  preorder, cancellation, returns, etc.

The system prompt (`lib/chat/systemPrompt.ts`) forbids answering either
category of question from memory, requires replying in the customer's own
language, and requires saying "not available" rather than guessing when a
tool comes back empty. This structure is what makes it straightforward to
add more tools later (order lookup, restock notifications, support
tickets) without touching the routing logic.

### Security

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are the
  only Supabase credentials ever used client-side — and the only ones the
  app needs client-side, since all storefront and chat requests are
  server-rendered or hit `/api/chat` (no direct browser→Supabase calls that
  would need broader access).
- `SUPABASE_SERVICE_ROLE_KEY` is used **only** by `scripts/ingest-knowledge.ts`
  to write `knowledge_base` rows — never for reads, and never inside the
  Next.js app itself.
- `GEMINI_API_KEY` is read only in server-only code (`lib/rag/embed.ts`,
  `app/api/chat/route.ts`, `scripts/ingest-knowledge.ts`) and is stripped
  from any client bundle by Next.js since it isn't `NEXT_PUBLIC_`-prefixed.
- `knowledge_base` has RLS enabled with **no direct SELECT policy** — the
  table itself is unreachable via REST with the publishable key. Chat-time
  retrieval instead goes through `match_knowledge_base`, a `security
  definer` RPC that exposes only similarity-search results, never raw rows.

## Known limitations

- Cart is localStorage-only — no checkout/payment gateway (matches the brief: "no real payment gateway yet").
- No products currently have `featured=true` or `bestseller=true` in the live catalog, so those homepage sections stay hidden rather than showing fabricated picks.
- No CRM/order lookup/restock notifications yet — the tool-calling architecture is structured so those can be added as new tools later without a rewrite.
- The current `GEMINI_API_KEY` is on the free tier: `gemini-3.5-flash` allows 5 requests/minute. Each chat turn uses 2 requests (a tool-calling round, then a final answer), so light real-world use is fine but bursts of several messages within the same minute will 429 (the widget shows the same friendly "temporarily unavailable" message either way). Enable billing on the key to lift this if needed.
