-- ============================================================================
-- Idol Fairies PH v2 — RAG schema (run ONCE in the Supabase SQL Editor)
--
-- This is purely additive: it does not touch the existing `products` table
-- or any of its rows/policies. It only enables pgvector and creates a new
-- `knowledge_base` table + similarity-search function for the chatbot's
-- policy/FAQ retrieval (product facts are looked up separately, directly
-- against `products`, by the app's publishable-key client — no RPC needed
-- there). The service-role key is used only by the ingestion script
-- (scripts/ingest-knowledge.ts) to write rows — never for reads.
--
-- Safe to re-run: every statement is idempotent (IF NOT EXISTS / OR REPLACE).
-- ============================================================================

-- 1. pgvector extension --------------------------------------------------
create extension if not exists vector;

-- 2. knowledge_base table ------------------------------------------------
create table if not exists public.knowledge_base (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  source_url text,
  content text not null,
  chunk_index int not null default 0,
  -- sha256 of `content`, used by the ingestion script to skip chunks it has
  -- already embedded/stored, so re-running ingestion never duplicates rows.
  content_hash text not null unique,
  embedding vector(768),
  created_at timestamptz not null default now()
);

create index if not exists idx_knowledge_base_category on public.knowledge_base (category);

-- HNSW index for fast approximate cosine-similarity search.
create index if not exists idx_knowledge_base_embedding
  on public.knowledge_base
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- 3. Row Level Security ---------------------------------------------------
-- No public SELECT/INSERT/UPDATE/DELETE policies are defined on the table
-- itself — direct REST access to knowledge_base (e.g. GET /rest/v1/
-- knowledge_base) stays blocked for the anon/publishable key. Writes only
-- ever happen via the service-role key (ingestion script), which bypasses
-- RLS entirely. Reads at chat time go through match_knowledge_base below —
-- a `security definer` function, callable by the publishable key, that
-- exposes only the curated similarity-search shape, not raw table access.
alter table public.knowledge_base enable row level security;

-- 4. Similarity search RPC -------------------------------------------------
create or replace function public.match_knowledge_base(
  query_embedding vector(768),
  match_threshold float default 0.65,
  match_count int default 5,
  filter_category text default null
)
returns table (
  id uuid,
  title text,
  category text,
  source_url text,
  content text,
  similarity float
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    kb.id,
    kb.title,
    kb.category,
    kb.source_url,
    kb.content,
    1 - (kb.embedding <=> query_embedding) as similarity
  from public.knowledge_base kb
  where kb.embedding is not null
    and (filter_category is null or kb.category = filter_category)
    and 1 - (kb.embedding <=> query_embedding) > match_threshold
  order by kb.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- security definer + explicit search_path so the function runs with the
-- privileges/schema of its owner regardless of caller, without being
-- hijackable via a mutated search_path.
--
-- Explicit grants (not relying on Postgres's default PUBLIC-execute
-- behavior, which Supabase projects commonly lock down): the publishable
-- client calls this directly at chat time, so anon/authenticated need
-- EXECUTE. They still can't read knowledge_base any other way — this
-- function is the only door, and it only returns similarity-search results,
-- never arbitrary rows.
grant execute on function public.match_knowledge_base(vector, float, int, text) to anon, authenticated;
