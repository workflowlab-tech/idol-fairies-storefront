import type { ChatHistoryMessage, ChatReply } from "@/types/chat";

const FALLBACK_TEXT = "Idol AI is temporarily unavailable. Please try again in a moment.";

/**
 * Client-side helper for /api/chat. Never throws — any failure degrades to
 * the same friendly fallback message the API route itself uses, so the
 * widget never needs special-case error handling.
 */
export async function sendChatMessage(
  message: string,
  productContext: string | undefined,
  history: ChatHistoryMessage[]
): Promise<ChatReply> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, productContext, history }),
    });

    if (!response.ok) return { text: FALLBACK_TEXT };

    const data: unknown = await response.json();
    if (typeof data === "object" && data !== null && "text" in data && typeof (data as { text: unknown }).text === "string") {
      const productSlugs = (data as { productSlugs?: unknown }).productSlugs;
      return {
        text: (data as { text: string }).text,
        ...(Array.isArray(productSlugs)
          ? { productSlugs: productSlugs.filter((slug): slug is string => typeof slug === "string") }
          : {}),
      };
    }
    return { text: FALLBACK_TEXT };
  } catch (error) {
    console.error("[chat/client] request to /api/chat failed:", error);
    return { text: FALLBACK_TEXT };
  }
}
