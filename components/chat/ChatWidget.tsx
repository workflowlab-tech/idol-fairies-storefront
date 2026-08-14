"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { sendChatMessage } from "@/lib/chat/client";
import { formatPHP } from "@/lib/products/format";
import type { Product } from "@/types/product";
import { MAX_HISTORY_MESSAGES, MAX_MESSAGE_LENGTH, type ChatHistoryMessage } from "@/types/chat";

type Message = { id: number; role: "assistant" | "user"; text: string; productSlugs?: string[] };

const WELCOME: Message = {
  id: 1,
  role: "assistant",
  text: "Hi! I'm Idol AI ✨ Ask me about albums, light sticks, preorders, shipping, or store policies — in whatever language you're comfortable with.",
};

const PROMPTS = [
  "Do you have Stray Kids albums?",
  "What items are on preorder?",
  "How long does shipping take?",
  "Any light sticks under ₱3,000?",
  "商品は日本に発送できますか？",
  "先注文を取り消すことはできますか？",
];

export default function ChatWidget({ products }: { products: Product[] }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [productContext, setProductContext] = useState<string>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handler(event: Event) {
      const custom = event as CustomEvent<{ productContext?: string }>;
      setProductContext(custom.detail?.productContext);
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    window.addEventListener("open-idol-ai", handler);
    return () => window.removeEventListener("open-idol-ai", handler);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || loading) return;
    const history: ChatHistoryMessage[] = messages
      .filter((item) => item.id !== WELCOME.id)
      .map((item) => ({ role: item.role, text: item.text }))
      .slice(-MAX_HISTORY_MESSAGES);
    setMessages((current) => [...current, { id: Date.now(), role: "user", text: clean }]);
    setInput("");
    setLoading(true);
    const reply = await sendChatMessage(clean, productContext, history);
    setMessages((current) => [...current, { id: Date.now() + 1, role: "assistant", ...reply }]);
    setLoading(false);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void send(input);
  }

  return (
    <>
      {open && (
        <section
          className="fixed bottom-24 right-4 z-50 flex h-[min(32rem,70vh)] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-fairy-pink-200 bg-white shadow-2xl"
          aria-label="Idol AI chat assistant"
        >
          <header className="flex items-center gap-3 bg-fairy-ink px-4 py-3 text-fairy-cream">
            <span className="relative block h-10 w-10 shrink-0">
              <Image src="/idol-ai-robot.png" alt="" fill sizes="40px" className="object-contain" />
            </span>
            <div className="min-w-0 flex-1">
              <strong className="flex items-center gap-1.5 text-sm">
                Idol AI <span className="rounded-full bg-fairy-pink-500 px-1.5 py-0.5 text-[9px] font-bold">DEMO</span>
              </strong>
              <p className="truncate text-xs text-fairy-cream/70">Multilingual shopping assistant</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1 text-fairy-cream/70 hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </header>

          {productContext && (
            <div className="flex items-center gap-2 border-b border-fairy-pink-100 bg-fairy-pink-50 px-4 py-2 text-xs">
              <span className="text-fairy-ink/60">Currently viewing</span>
              <strong className="truncate text-fairy-ink">{productContext}</strong>
            </div>
          )}

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className="max-w-[85%]">
                  <p
                    className={
                      message.role === "user"
                        ? "rounded-2xl rounded-br-sm bg-fairy-pink-500 px-3 py-2 text-sm text-white"
                        : "rounded-2xl rounded-bl-sm bg-fairy-blue-50 px-3 py-2 text-sm text-fairy-ink"
                    }
                  >
                    {message.text}
                  </p>
                  {message.productSlugs && message.productSlugs.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      {message.productSlugs.map((slug) => {
                        const product = products.find((item) => item.slug === slug);
                        if (!product) return null;
                        return (
                          <Link
                            key={slug}
                            href={`/products/${slug}`}
                            onClick={() => setOpen(false)}
                            className="rounded-xl border border-fairy-pink-200 bg-white px-3 py-2 text-xs transition hover:border-fairy-pink-400"
                          >
                            <span className="block text-fairy-blue-600">{product.artist}</span>
                            <strong className="block text-fairy-ink">{product.productName}</strong>
                            <span className="text-fairy-ink/60">
                              {formatPHP(product.pricePHP)} · {product.stockStatus}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => void send(prompt)}
                    className="rounded-full border border-fairy-pink-200 px-2.5 py-1 text-xs text-fairy-ink/70 hover:bg-fairy-pink-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-fairy-blue-50 px-3 py-2">
                  <span className="sr-only">Idol AI is typing</span>
                  {[0, 1, 2].map((dot) => (
                    <i
                      key={dot}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-fairy-blue-400"
                      style={{ animationDelay: `${dot * 0.12}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={submit} className="flex items-center gap-2 border-t border-fairy-pink-100 p-2">
            <label className="sr-only" htmlFor="idol-ai-input">
              Ask Idol AI
            </label>
            <input
              ref={inputRef}
              id="idol-ai-input"
              placeholder="Ask Idol AI..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={loading}
              maxLength={MAX_MESSAGE_LENGTH}
              className="flex-1 rounded-full border border-fairy-pink-200 px-3 py-2 text-sm outline-none focus:border-fairy-pink-400"
            />
            <button
              aria-label="Send message"
              disabled={!input.trim() || loading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fairy-pink-500 text-white disabled:opacity-40"
            >
              ↑
            </button>
          </form>
          <p className="px-4 pb-2 text-center text-[10px] text-fairy-ink/40">Demo responses · No personal data, please</p>
        </section>
      )}

      <button
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-fairy-ink py-1.5 pl-1.5 pr-4 text-sm font-semibold text-white shadow-xl transition hover:scale-105"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close Idol AI" : "Open Idol AI"}
      >
        {open ? (
          <span className="flex h-11 w-11 items-center justify-center text-lg">✕</span>
        ) : (
          <>
            <span className="relative block h-11 w-11 shrink-0 animate-fairy-float">
              <Image src="/idol-ai-robot.png" alt="" fill sizes="44px" className="object-contain" />
            </span>
            <span>Ask Idol AI</span>
          </>
        )}
      </button>
    </>
  );
}
