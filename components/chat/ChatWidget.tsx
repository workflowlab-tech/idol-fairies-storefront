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
        <div className="fixed bottom-24 right-4 z-50 w-[min(23.5rem,calc(100vw-2rem))]">
          {/* Mascot peeking over the top of the card, framing the chat */}
          <div className="pointer-events-none absolute -top-14 left-1/2 z-20 h-24 w-24 -translate-x-1/2">
            <span
              aria-hidden
              className="absolute -inset-1 rounded-full bg-fairy-pink-300/60 blur-lg animate-fairy-glow"
            />
            <span className="relative block h-24 w-24 animate-fairy-float overflow-hidden rounded-full border-4 border-fairy-cream shadow-[0_10px_22px_-4px_rgba(227,123,175,0.6)]">
              <Image
                src="/idol-ai-mascot.png"
                alt=""
                fill
                sizes="96px"
                priority
                className="scale-110 object-cover object-center"
              />
            </span>
          </div>

          <section
            className="relative flex h-[min(33rem,72vh)] animate-fairy-pop-in flex-col overflow-hidden rounded-[1.75rem] border border-fairy-pink-200 bg-fairy-cream shadow-[0_24px_60px_-12px_rgba(11,11,20,0.35)] ring-1 ring-white/60"
            aria-label="Idol AI chat assistant"
          >
            {/* Header — leaves room for the mascot's head above it */}
            <header className="relative overflow-hidden bg-gradient-to-br from-fairy-pink-500 to-fairy-pink-600 px-4 pb-3 pt-12 text-fairy-cream">
              <Sparkle aria-hidden className="absolute right-7 top-3 h-3 w-3 text-fairy-cream/70 animate-fairy-twinkle" />
              <Sparkle
                aria-hidden
                className="absolute left-5 top-7 h-2.5 w-2.5 text-fairy-cream/60 animate-fairy-twinkle"
                style={{ animationDelay: "0.6s" }}
              />
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-fairy-cream/80 transition hover:bg-white/20 hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <div className="text-center">
                <strong className="flex items-center justify-center gap-1.5 text-base font-bold tracking-tight">
                  Idol AI
                  <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                    Demo
                  </span>
                </strong>
                <p className="mt-0.5 flex items-center justify-center gap-1.5 text-xs text-fairy-cream/80">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-fairy-blue-200 shadow-[0_0_6px_1px] shadow-fairy-blue-200" />
                  Your K-pop shopping fairy
                </p>
              </div>
            </header>

            {productContext && (
              <div className="flex items-center gap-2 border-b border-fairy-pink-100 bg-fairy-pink-50 px-4 py-2 text-xs">
                <span className="text-fairy-ink/60">Currently viewing</span>
                <strong className="truncate text-fairy-ink">{productContext}</strong>
              </div>
            )}

            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-fairy-cream to-fairy-pink-50/40 px-3 py-4"
              aria-live="polite"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.role === "user"
                      ? "flex animate-fairy-msg-in justify-end"
                      : "flex animate-fairy-msg-in items-end gap-2 justify-start"
                  }
                >
                  {message.role === "assistant" && (
                    <span className="relative mb-1 block h-7 w-7 shrink-0 overflow-hidden rounded-full border border-fairy-pink-200 bg-white">
                      <Image src="/idol-ai-mascot.png" alt="" fill sizes="28px" className="scale-105 object-cover object-center" />
                    </span>
                  )}
                  <div className="max-w-[80%]">
                    <p
                      className={
                        message.role === "user"
                          ? "rounded-2xl rounded-br-md bg-fairy-pink-500 px-3.5 py-2 text-sm text-white shadow-sm"
                          : "rounded-2xl rounded-bl-md border border-fairy-pink-100 bg-white px-3.5 py-2 text-sm text-fairy-ink shadow-sm"
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
                              className="group flex items-center gap-3 rounded-2xl border border-fairy-pink-200 bg-white p-2 shadow-sm transition hover:-translate-y-0.5 hover:border-fairy-pink-400 hover:shadow-md"
                            >
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fairy-pink-50 text-fairy-pink-500">
                                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                                  <path
                                    d="M9 18V6l10-2v12"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <circle cx="6.5" cy="18" r="2.5" fill="currentColor" />
                                  <circle cx="16.5" cy="16" r="2.5" fill="currentColor" />
                                </svg>
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-[11px] font-medium text-fairy-blue-600">
                                  {product.artist}
                                </span>
                                <strong className="block truncate text-xs text-fairy-ink">{product.productName}</strong>
                                <span className="text-[11px] text-fairy-ink/60">
                                  {formatPHP(product.pricePHP)} · {product.stockStatus}
                                </span>
                              </span>
                              <span className="shrink-0 text-fairy-pink-400 transition group-hover:translate-x-0.5">
                                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
                                  <path
                                    d="M9 6l6 6-6 6"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
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
                      className="rounded-full border border-fairy-pink-200 bg-white/70 px-2.5 py-1 text-xs text-fairy-ink/70 transition hover:border-fairy-pink-400 hover:bg-fairy-pink-50 hover:text-fairy-ink"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {loading && (
                <div className="flex items-end gap-2 justify-start">
                  <span className="relative mb-1 block h-7 w-7 shrink-0 overflow-hidden rounded-full border border-fairy-pink-200 bg-white">
                    <Image src="/idol-ai-mascot.png" alt="" fill sizes="28px" className="scale-125 object-contain" />
                  </span>
                  <div className="flex gap-1 rounded-2xl rounded-bl-md border border-fairy-pink-100 bg-white px-3.5 py-2.5 shadow-sm">
                    <span className="sr-only">Idol AI is typing</span>
                    {[0, 1, 2].map((dot) => (
                      <i
                        key={dot}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-fairy-pink-400"
                        style={{ animationDelay: `${dot * 0.12}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={submit} className="flex items-center gap-2 border-t border-fairy-pink-100 bg-white p-2.5">
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
                className="flex-1 rounded-full border border-fairy-pink-200 bg-fairy-pink-50/40 px-4 py-2 text-sm outline-none transition focus:border-fairy-pink-400 focus:bg-white"
              />
              <button
                aria-label="Send message"
                disabled={!input.trim() || loading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fairy-pink-500 to-fairy-pink-600 text-white shadow-md transition hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
                  <path
                    d="M12 19V5M6 11l6-6 6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
            <p className="bg-white px-4 pb-2 text-center text-[10px] text-fairy-ink/40">
              Demo responses · No personal data, please
            </p>
          </section>
        </div>
      )}

      <button
        className="group fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-gradient-to-br from-fairy-pink-500 to-fairy-pink-600 py-1.5 pl-1.5 pr-4 text-sm font-semibold text-white shadow-xl shadow-fairy-pink-500/30 transition hover:scale-105"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close Idol AI" : "Open Idol AI"}
      >
        {open ? (
          <span className="flex h-11 w-11 items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        ) : (
          <>
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-white/40 blur-md animate-fairy-glow"
              />
              <span className="relative block h-11 w-11 animate-fairy-float overflow-hidden rounded-full border-2 border-white/70">
                <Image src="/idol-ai-mascot.png" alt="" fill sizes="44px" className="scale-105 object-cover object-center" />
              </span>
            </span>
            <span>Ask Idol AI</span>
          </>
        )}
      </button>
    </>
  );
}

function Sparkle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2c.5 3.9 2.1 5.5 6 6-3.9.5-5.5 2.1-6 6-.5-3.9-2.1-5.5-6-6 3.9-.5 5.5-2.1 6-6z" />
    </svg>
  );
}
