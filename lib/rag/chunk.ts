import { createHash } from "node:crypto";

export type KnowledgeChunk = {
  title: string;
  category: string;
  sourceUrl: string | null;
  content: string;
  chunkIndex: number;
  contentHash: string;
};

type ParsedDoc = {
  title: string;
  category: string;
  sourceUrl: string | null;
  body: string;
};

const MAX_CHUNK_CHARS = 900;

/** Minimal frontmatter parser — just the `key: value` pairs this project uses. */
function parseFrontmatter(raw: string): ParsedDoc {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error("Knowledge doc is missing YAML frontmatter (expected --- title/category ---).");
  }
  const [, frontmatter, body] = match;
  const fields: Record<string, string> = {};
  for (const line of frontmatter.split("\n")) {
    const fieldMatch = line.match(/^(\w+):\s*(.*)$/);
    if (fieldMatch) fields[fieldMatch[1]] = fieldMatch[2].trim();
  }
  if (!fields.title || !fields.category) {
    throw new Error("Knowledge doc frontmatter must include both `title` and `category`.");
  }
  return { title: fields.title, category: fields.category, sourceUrl: fields.source_url ?? null, body: body.trim() };
}

/** Splits markdown into ## sections, then further splits any section over MAX_CHUNK_CHARS. */
function splitIntoChunks(body: string): string[] {
  const sections = body
    .split(/\n(?=## )/)
    .map((section) => section.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  for (const section of sections) {
    if (section.length <= MAX_CHUNK_CHARS) {
      chunks.push(section);
      continue;
    }
    // Long section: split on paragraph breaks, greedily packing up to the limit.
    const paragraphs = section.split(/\n\n+/);
    let current = "";
    for (const paragraph of paragraphs) {
      if (current && (current + "\n\n" + paragraph).length > MAX_CHUNK_CHARS) {
        chunks.push(current);
        current = paragraph;
      } else {
        current = current ? `${current}\n\n${paragraph}` : paragraph;
      }
    }
    if (current) chunks.push(current);
  }
  return chunks;
}

export function chunkKnowledgeDoc(raw: string): KnowledgeChunk[] {
  const { title, category, sourceUrl, body } = parseFrontmatter(raw);
  const sectionChunks = splitIntoChunks(body);

  return sectionChunks.map((content, index) => ({
    title,
    category,
    sourceUrl,
    content,
    chunkIndex: index,
    contentHash: createHash("sha256").update(`${category}:${index}:${content}`).digest("hex"),
  }));
}
