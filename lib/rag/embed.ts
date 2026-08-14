import { GoogleGenAI } from "@google/genai";

// SERVER-ONLY (see the comment in lib/supabase/server.ts for why this file
// can't use the `server-only` package — it's also required by the
// standalone ingestion script run via tsx). Never import from a "use
// client" file: GEMINI_API_KEY is not NEXT_PUBLIC_-prefixed and is stripped
// from client bundles by Next.js.

// gemini-embedding-001, truncated to 768 dimensions to match the
// `vector(768)` column in sql/001_rag_schema.sql. 768 keeps the HNSW index
// compact while still being well above the ~256-dim floor where MTEB
// benchmarks show quality dropping off for this model.
export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSIONS = 768;

function client() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");
  return new GoogleGenAI({ apiKey });
}

/** Embeds a knowledge-base chunk at ingestion time. */
export async function embedDocument(text: string): Promise<number[]> {
  const response = await client().models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: { taskType: "RETRIEVAL_DOCUMENT", outputDimensionality: EMBEDDING_DIMENSIONS },
  });
  const values = response.embeddings?.[0]?.values;
  if (!values) throw new Error("Gemini returned no embedding for a document chunk.");
  return values;
}

/** Embeds a customer question at retrieval time (asymmetric task type). */
export async function embedQuery(text: string): Promise<number[]> {
  const response = await client().models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: { taskType: "RETRIEVAL_QUERY", outputDimensionality: EMBEDDING_DIMENSIONS },
  });
  const values = response.embeddings?.[0]?.values;
  if (!values) throw new Error("Gemini returned no embedding for a query.");
  return values;
}
