import type { FunctionDeclaration } from "@google/genai";
import { getAllProducts } from "@/lib/products/queries";
import { retrievePolicyChunks } from "@/lib/rag/retrieve";
import { formatPHP } from "@/lib/products/format";
import { PRODUCT_CATEGORIES, type ProductCategory, type StockStatus } from "@/types/product";

const KNOWLEDGE_CATEGORIES = [
  "shipping",
  "preorder",
  "order-processing",
  "cancellation",
  "returns",
  "damaged-missing",
  "payment",
  "address-changes",
  "customs",
  "faq",
];

/**
 * Tool declarations Gemini can call. `search_products` hits Supabase
 * directly with exact filters — it is the ONLY path for stock/price/release
 * facts, per the brief ("do NOT use vector search for exact product
 * facts"). `search_policy` is the ONLY path for shipping/preorder/returns/
 * etc. questions, via embedding + pgvector similarity search. The model
 * decides which (or both) to call based on the system prompt's routing
 * rules; this structure also leaves room to add more tools later (order
 * lookup, restock notifications, support tickets) without touching the
 * routing logic itself.
 */
export const CHAT_TOOLS: FunctionDeclaration[] = [
  {
    name: "search_products",
    description:
      "Look up real products from the Idol Fairies PH catalog by exact filters (artist, category, availability, price range, or a name/keyword search). Use this for ANY question about what's in stock, prices, preorder status, sold-out status, or release dates. Never answer those questions from memory.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        artist: { type: "string", description: "Artist/group name to filter by, e.g. 'Stray Kids'." },
        category: { type: "string", enum: PRODUCT_CATEGORIES, description: "Product category to filter by." },
        availability: {
          type: "string",
          enum: ["In Stock", "Preorder", "Sold Out"],
          description: "Stock status to filter by.",
        },
        query: { type: "string", description: "Free-text keyword to match against the product name/description." },
        maxPrice: { type: "number", description: "Maximum price in PHP." },
        minPrice: { type: "number", description: "Minimum price in PHP." },
        limit: { type: "number", description: "Max number of results to return (default 8, max 20)." },
      },
    },
  },
  {
    name: "search_policy",
    description:
      "Search the Idol Fairies PH policy knowledge base (shipping, preorder rules, cancellation, returns/refunds, damaged or missing items, payment, address changes, customs, general FAQs). Use this for ANY question about store policy or procedures. Never answer those questions from memory — only from what this tool returns.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The customer's policy question, in English (translate if needed)." },
        category: { type: "string", enum: KNOWLEDGE_CATEGORIES, description: "Narrow to one policy category if obvious." },
      },
      required: ["query"],
    },
  },
];

export type ProductToolResult = {
  count: number;
  products: Array<{
    slug: string;
    artist: string;
    productName: string;
    category: string;
    version: string | null;
    pricePHP: string;
    stockStatus: StockStatus;
    releaseDate: string | null;
  }>;
};

export type PolicyToolResult = {
  found: boolean;
  chunks: Array<{ title: string; category: string; content: string; sourceUrl: string | null }>;
};

async function runSearchProducts(args: Record<string, unknown>): Promise<ProductToolResult> {
  const limit = Math.min(Number(args.limit) || 8, 20);
  const products = await getAllProducts({
    artist: typeof args.artist === "string" ? args.artist : undefined,
    category: typeof args.category === "string" ? (args.category as ProductCategory) : undefined,
    availability: typeof args.availability === "string" ? (args.availability as StockStatus) : undefined,
    query: typeof args.query === "string" ? args.query : undefined,
    minPrice: typeof args.minPrice === "number" ? args.minPrice : undefined,
    maxPrice: typeof args.maxPrice === "number" ? args.maxPrice : undefined,
  });

  const limited = products.slice(0, limit);
  return {
    count: products.length,
    products: limited.map((p) => ({
      slug: p.slug,
      artist: p.artist,
      productName: p.productName,
      category: p.category,
      version: p.version,
      pricePHP: formatPHP(p.pricePHP),
      stockStatus: p.stockStatus,
      releaseDate: p.releaseDate,
    })),
  };
}

async function runSearchPolicy(args: Record<string, unknown>): Promise<PolicyToolResult> {
  const query = typeof args.query === "string" ? args.query : "";
  if (!query.trim()) return { found: false, chunks: [] };

  const category = typeof args.category === "string" ? args.category : undefined;
  const matches = await retrievePolicyChunks(query, { category });

  return {
    found: matches.length > 0,
    chunks: matches.map((m) => ({ title: m.title, category: m.category, content: m.content, sourceUrl: m.sourceUrl })),
  };
}

export async function executeTool(name: string, args: Record<string, unknown>) {
  if (name === "search_products") return runSearchProducts(args);
  if (name === "search_policy") return runSearchPolicy(args);
  return { error: `Unknown tool: ${name}` };
}
