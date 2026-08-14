import { GoogleGenAI, type Content } from "@google/genai";
import { NextResponse, type NextRequest } from "next/server";
import { CHAT_TOOLS, executeTool, type ProductToolResult } from "@/lib/chat/tools";
import { SYSTEM_PROMPT } from "@/lib/chat/systemPrompt";
import { MAX_HISTORY_MESSAGES, MAX_MESSAGE_LENGTH, type ChatHistoryMessage, type ChatReply } from "@/types/chat";

// Calls Gemini + Supabase directly — must run in the Node.js runtime, never
// statically cached.
export const runtime = "nodejs";

// Pinned rather than "gemini-flash-latest": that alias currently resolves
// to gemini-3.6-flash, whose free-tier daily quota (20 req/day) this key
// exhausted during testing. A pinned model avoids both the quota
// collision and any surprise behavior change if Google repoints "-latest".
const MODEL = "gemini-3.5-flash";
const MAX_CONTEXT_LENGTH = 200;
const MAX_REPLY_LENGTH = 1200;
const MAX_TOOL_CALLS_PER_TURN = 4;
const MAX_TOOL_ROUNDS = 4;
const FALLBACK_TEXT = "Idol AI is temporarily unavailable. Please try again in a moment.";

type ChatRequestBody = {
  message?: unknown;
  productContext?: unknown;
  history?: unknown;
};

type ValidatedRequest = {
  message: string;
  productContext?: string;
  history: ChatHistoryMessage[];
};

function validateBody(body: ChatRequestBody): ValidatedRequest | null {
  if (typeof body.message !== "string") return null;
  const message = body.message.trim();
  if (!message || message.length > MAX_MESSAGE_LENGTH) return null;

  let productContext: string | undefined;
  if (typeof body.productContext === "string") {
    const trimmed = body.productContext.trim();
    if (trimmed) productContext = trimmed.slice(0, MAX_CONTEXT_LENGTH);
  }

  let history: ChatHistoryMessage[] = [];
  if (Array.isArray(body.history)) {
    history = body.history
      .filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null)
      .map((entry): ChatHistoryMessage => ({
        role: entry.role === "assistant" ? "assistant" : "user",
        text: typeof entry.text === "string" ? entry.text.slice(0, MAX_MESSAGE_LENGTH) : "",
      }))
      .filter((entry) => entry.text.length > 0)
      .slice(-MAX_HISTORY_MESSAGES);
  }

  return { message, productContext, history };
}

export async function POST(request: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = validateBody((rawBody ?? {}) as ChatRequestBody);
  if (!parsed) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { message, productContext, history } = parsed;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[api/chat] GEMINI_API_KEY is not set.");
    return NextResponse.json<ChatReply>({ text: FALLBACK_TEXT });
  }

  // Every failure path below returns 200 with a friendly ChatReply instead
  // of an HTTP error, so the widget never needs special-case error handling.
  try {
    const ai = new GoogleGenAI({ apiKey });

    const contents: Content[] = [
      ...history.map((turn): Content => ({
        role: turn.role === "assistant" ? "model" : "user",
        parts: [{ text: turn.text }],
      })),
      {
        role: "user",
        parts: [
          {
            text: productContext ? `[Customer is currently viewing: ${productContext}]\n\n${message}` : message,
          },
        ],
      },
    ];

    const productSlugs = new Set<string>();
    let finalText = "";

    // Gemini may chain several tool calls in one turn (e.g. try search_policy,
    // get a weak/no match, then try search_products too for a mixed
    // question) before it's ready to answer in plain text — loop rather
    // than assuming a single round-trip is enough, up to a small cap so a
    // misbehaving model can't spin forever.
    for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents,
        config: { systemInstruction: SYSTEM_PROMPT, tools: [{ functionDeclarations: CHAT_TOOLS }] },
      });

      const calls = response.functionCalls;
      if (!calls || calls.length === 0) {
        finalText = (response.text ?? "").trim();
        break;
      }

      const modelTurn: Content = response.candidates?.[0]?.content ?? {
        role: "model",
        parts: calls.map((call) => ({ functionCall: call })),
      };
      contents.push(modelTurn);

      const responseParts = [];
      for (const call of calls.slice(0, MAX_TOOL_CALLS_PER_TURN)) {
        if (!call.name) continue;
        const result = await executeTool(call.name, call.args ?? {});
        if (call.name === "search_products") {
          for (const product of (result as ProductToolResult).products) productSlugs.add(product.slug);
        }
        responseParts.push({ functionResponse: { name: call.name, response: result as Record<string, unknown> } });
      }
      contents.push({ role: "user", parts: responseParts });
    }

    // Safety net: if the model was still calling tools when the round cap
    // hit, force one last text-only completion from whatever tool results
    // we already have rather than surfacing the generic fallback when we
    // may well already have a usable answer.
    if (!finalText) {
      const forced = await ai.models.generateContent({
        model: MODEL,
        contents: [
          ...contents,
          { role: "user", parts: [{ text: "Answer now in plain text using only the tool results above. Do not call any more tools." }] },
        ],
        config: { systemInstruction: SYSTEM_PROMPT },
      });
      finalText = (forced.text ?? "").trim();
    }

    const payload: ChatReply = {
      text: finalText ? finalText.slice(0, MAX_REPLY_LENGTH) : FALLBACK_TEXT,
      ...(productSlugs.size > 0 ? { productSlugs: [...productSlugs].slice(0, 6) } : {}),
    };
    return NextResponse.json(payload);
  } catch (error) {
    console.error("[api/chat] Gemini request failed:", error);
    return NextResponse.json<ChatReply>({ text: FALLBACK_TEXT });
  }
}
