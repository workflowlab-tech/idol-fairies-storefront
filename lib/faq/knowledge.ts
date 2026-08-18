import "server-only";

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { FaqGroup, FaqItem } from "@/types/faq";

const KNOWLEDGE_DIR = join(process.cwd(), "content", "knowledge");
const GROUP_ORDER = [
  "shipping",
  "products",
  "order-processing",
  "returns",
  "damaged-missing",
  "payment",
  "address-changes",
  "wholesale",
  "idol-ai",
  "faq",
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseKnowledgeFaq(fileName: string): FaqGroup {
  const raw = readFileSync(join(KNOWLEDGE_DIR, fileName), "utf8");
  const documentMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!documentMatch) throw new Error(`Knowledge file ${fileName} is missing frontmatter.`);

  const fields: Record<string, string> = {};
  for (const line of documentMatch[1].split("\n")) {
    const fieldMatch = line.match(/^(\w+):\s*(.*)$/);
    if (fieldMatch) fields[fieldMatch[1]] = fieldMatch[2].trim();
  }
  if (!fields.category || !fields.title) {
    throw new Error(`Knowledge file ${fileName} must define category and title.`);
  }

  const sections = documentMatch[2]
    .trim()
    .split(/\n(?=## )/)
    .map((section) => section.trim())
    .filter(Boolean);

  const items: FaqItem[] = sections.map((section) => {
    const sectionMatch = section.match(/^##\s+(.+)\n+([\s\S]+)$/);
    if (!sectionMatch) throw new Error(`Knowledge file ${fileName} contains an invalid FAQ section.`);
    const question = sectionMatch[1].trim();
    const answer = sectionMatch[2].replace(/\s+/g, " ").trim();
    return { id: `${fields.category}-${slugify(question)}`, question, answer };
  });

  return { id: fields.category, title: fields.title, items };
}

export const faqGroups: FaqGroup[] = readdirSync(KNOWLEDGE_DIR)
  .filter((fileName) => fileName.endsWith(".md") && fileName !== "REFERENCE.md")
  .map(parseKnowledgeFaq)
  .sort((a, b) => {
    const aIndex = GROUP_ORDER.indexOf(a.id);
    const bIndex = GROUP_ORDER.indexOf(b.id);
    return (aIndex === -1 ? GROUP_ORDER.length : aIndex) - (bIndex === -1 ? GROUP_ORDER.length : bIndex);
  });
