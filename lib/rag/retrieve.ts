import { supabase } from "@/lib/supabase/client";
import { embedQuery } from "./embed";

export type KnowledgeMatch = {
  title: string;
  category: string;
  sourceUrl: string | null;
  content: string;
  similarity: number;
};

type MatchRow = {
  title: string;
  category: string;
  source_url: string | null;
  content: string;
  similarity: number;
};

const DEFAULT_MATCH_THRESHOLD = 0.5;

/**
 * Embeds a customer question and runs cosine-similarity search against
 * knowledge_base via the match_knowledge_base RPC (sql/001_rag_schema.sql).
 * Uses the PUBLIC/publishable client, not the service-role key — the RPC is
 * `security definer`, so it can safely run under the public client while the
 * underlying table stays locked (no direct public SELECT policy). Service
 * role is reserved for ingestion (writes) only, per the brief.
 * Returns [] rather than throwing when the table is empty/unreachable, so
 * the chat route can degrade to "that information isn't available yet"
 * instead of a hard error.
 */
export async function retrievePolicyChunks(
  query: string,
  options: { category?: string; matchCount?: number } = {}
): Promise<KnowledgeMatch[]> {
  const embedding = await embedQuery(query);

  const { data, error } = await supabase.rpc("match_knowledge_base", {
    query_embedding: embedding,
    match_threshold: DEFAULT_MATCH_THRESHOLD,
    match_count: options.matchCount ?? 5,
    filter_category: options.category ?? null,
  });

  if (error) {
    console.error("[rag/retrieve] match_knowledge_base failed:", error.message);
    return [];
  }

  return ((data ?? []) as MatchRow[]).map((row) => ({
    title: row.title,
    category: row.category,
    sourceUrl: row.source_url,
    content: row.content,
    similarity: row.similarity,
  }));
}
