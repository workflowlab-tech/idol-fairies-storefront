/**
 * Knowledge-base ingestion: reads content/knowledge/*.md, chunks each doc,
 * embeds any chunk we haven't stored before (via content_hash), and upserts
 * into Supabase `knowledge_base`. Safe to re-run — existing hashes are
 * skipped, so nothing is ever duplicated.
 *
 * Requires sql/001_rag_schema.sql to have been run in Supabase first.
 *
 * Run with: npm run ingest-knowledge
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { chunkKnowledgeDoc } from "../lib/rag/chunk";
import { embedDocument } from "../lib/rag/embed";
import { createServiceRoleClient } from "../lib/supabase/server";

const CONTENT_DIR = join(__dirname, "..", "content", "knowledge");

async function main() {
  const supabase = createServiceRoleClient();

  const files = readdirSync(CONTENT_DIR).filter((file) => file.endsWith(".md") && file !== "REFERENCE.md");
  if (files.length === 0) {
    console.log("No knowledge docs found in content/knowledge/.");
    return;
  }

  const allChunks = files.flatMap((file) => {
    const raw = readFileSync(join(CONTENT_DIR, file), "utf8");
    try {
      return chunkKnowledgeDoc(raw);
    } catch (error) {
      throw new Error(`Failed to parse ${file}: ${(error as Error).message}`);
    }
  });

  console.log(`Parsed ${files.length} doc(s) into ${allChunks.length} chunk(s).`);

  const { data: existing, error: existingError } = await supabase.from("knowledge_base").select("content_hash");
  if (existingError) {
    throw new Error(
      `Could not read knowledge_base (has sql/001_rag_schema.sql been run in Supabase yet?): ${existingError.message}`
    );
  }
  const existingHashes = new Set((existing ?? []).map((row) => row.content_hash as string));

  let inserted = 0;
  let skipped = 0;

  for (const chunk of allChunks) {
    if (existingHashes.has(chunk.contentHash)) {
      skipped += 1;
      continue;
    }

    const embedding = await embedDocument(chunk.content);

    const { error } = await supabase.from("knowledge_base").insert({
      title: chunk.title,
      category: chunk.category,
      source_url: chunk.sourceUrl,
      content: chunk.content,
      chunk_index: chunk.chunkIndex,
      content_hash: chunk.contentHash,
      embedding,
    });

    if (error) {
      // A unique-constraint hit here means a concurrent run already inserted
      // this exact chunk — safe to treat as "already ingested", not a failure.
      if (error.code === "23505") {
        skipped += 1;
        continue;
      }
      throw new Error(`Failed to insert chunk "${chunk.title}" #${chunk.chunkIndex}: ${error.message}`);
    }
    inserted += 1;
  }

  console.log(`Ingestion complete: ${inserted} new chunk(s) embedded and stored, ${skipped} already present (skipped).`);
}

main().catch((error) => {
  console.error("[ingest-knowledge] failed:", error.message);
  process.exit(1);
});
