"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { sendChatMessage } from "@/lib/chat/client";
import { formatPHP } from "@/lib/products/format";
import type { Product } from "@/types/product";
import {
  MAX_HISTORY_MESSAGES,
  MAX_MESSAGE_LENGTH,
  type ChatHistoryMessage,
} from "@/types/chat";

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
  productSlugs?: string[];
};

type RobotState = "idle" | "thinking" | "searching" | "success";

const ROBOT_IMAGES: Record<RobotState, string> = {
  idle: "/chatbot/idol-ai-idle.webp",
  thinking: "/chatbot/idol-ai-thinking.webp",
  searching: "/chatbot/idol-ai-searching.webp",
  success: "/chatbot/idol-ai-success.webp",
};

function RobotImage({
  state,
  alt,
  sizes,
  priority = false,
}: {
  state: RobotState;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <Image
      key={state}
      src={ROBOT_IMAGES[state]}
      alt={alt}
      fill
      sizes={sizes}
      className={`chatbot-robot-image chatbot-robot-${state} object-contain`}
      priority={priority}
    />
  );
}

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

const SPEECH_BUBBLES = [
  "Need help? ✨",
  "Looking for your bias?",
  "Ask me about preorders!",
  "Need a recommendation?",
];

export default function ChatWidget({ products }: { products: Product[] }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [productContext, setProductContext] = useState<string>();
  const [showBubble, setShowBubble] = useState(false);
  const [hoverMascot, setHoverMascot] = useState(false);
  const [bubbleIndex, setBubbleIndex] = useState(0);
  const [robotState, setRobotState] = useState<RobotState>("idle");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // TypeScript/React fix:
  // useRef requires an initial value with the current project typings.
  const bubbleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (searchingTimeoutRef.current) clearTimeout(searchingTimeoutRef.current);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  // Speech bubble timing: show after 2 seconds, hide after 6 seconds
  useEffect(() => {
    if (open) {
      if (bubbleTimeoutRef.current) {
        clearTimeout(bubbleTimeoutRef.current);
      }

      setShowBubble(false);
      return;
    }

    const showTimer = setTimeout(() => {
      setShowBubble(true);
      setBubbleIndex(
        (prev) => (prev + 1) % SPEECH_BUBBLES.length
      );

      const hideTimer = setTimeout(() => {
        setShowBubble(false);
      }, 6000);

      bubbleTimeoutRef.current = hideTimer;
    }, 2000);

    bubbleTimeoutRef.current = showTimer;

    return () => {
      if (bubbleTimeoutRef.current) {
        clearTimeout(bubbleTimeoutRef.current);
      }
    };
  }, [open]);

  useEffect(() => {
    function handler(event: Event) {
      const custom = event as CustomEvent<{
        productContext?: string;
      }>;

      setProductContext(custom.detail?.productContext);
      setRobotState("idle");
      setOpen(true);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }

    window.addEventListener("open-idol-ai", handler);

    return () => {
      window.removeEventListener("open-idol-ai", handler);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function send(text: string) {
    const clean = text.trim();

    if (!clean || loading) return;

    const history: ChatHistoryMessage[] = messages
      .filter((item) => item.id !== WELCOME.id)
      .map((item) => ({
        role: item.role,
        text: item.text,
      }))
      .slice(-MAX_HISTORY_MESSAGES);

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        role: "user",
        text: clean,
      },
    ]);

    setInput("");
    setLoading(true);
    if (searchingTimeoutRef.current) clearTimeout(searchingTimeoutRef.current);
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    setRobotState("thinking");
    searchingTimeoutRef.current = setTimeout(() => {
      setRobotState("searching");
    }, 650);

    const reply = await sendChatMessage(
      clean,
      productContext,
      history
    );

    if (searchingTimeoutRef.current) {
      clearTimeout(searchingTimeoutRef.current);
      searchingTimeoutRef.current = null;
    }

    setMessages((current) => [
      ...current,
      {
        id: Date.now() + 1,
        role: "assistant",
        ...reply,
      },
    ]);

    setLoading(false);
    setRobotState("success");
    successTimeoutRef.current = setTimeout(() => {
      setRobotState("idle");
      successTimeoutRef.current = null;
    }, 1600);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void send(input);
  }

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <>
      {/* Chat Panel - Open State */}
      {open && (
        <section
          className="fixed bottom-24 right-4 z-50 flex h-[min(32rem,70vh)] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-fairy-pink-200 bg-white shadow-2xl"
          aria-label="Idol AI chat assistant"
        >
          <header className="flex items-center gap-3 bg-fairy-ink px-4 py-3 text-fairy-cream">
            <span className="relative block h-10 w-10 shrink-0">
              <RobotImage state={robotState} alt="" sizes="40px" />
            </span>

            <span className="sr-only" aria-live="polite">
              {robotState === "idle" && "Idol AI is ready"}
              {robotState === "thinking" && "Idol AI is thinking"}
              {robotState === "searching" && "Idol AI is searching and typing"}
              {robotState === "success" && "Idol AI found a response"}
            </span>

            <div className="min-w-0 flex-1">
              <strong className="text-sm">Idol AI</strong>
              <p className="truncate text-xs text-fairy-cream/70">
                Multilingual shopping assistant
              </p>
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
              <span className="text-fairy-ink/60">
                Currently viewing
              </span>
              <strong className="truncate text-fairy-ink">
                {productContext}
              </strong>
            </div>
          )}

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
            aria-live="polite"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
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

                  {message.productSlugs &&
                    message.productSlugs.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1.5">
                        {message.productSlugs.map((slug) => {
                          const product = products.find(
                            (item) => item.slug === slug
                          );

                          if (!product) return null;

                          return (
                            <Link
                              key={slug}
                              href={`/products/${slug}`}
                              onClick={() => setOpen(false)}
                              className="rounded-xl border border-fairy-pink-200 bg-white px-3 py-2 text-xs transition hover:border-fairy-pink-400"
                            >
                              <span className="block text-fairy-blue-600">
                                {product.artist}
                              </span>

                              <strong className="block text-fairy-ink">
                                {product.productName}
                              </strong>

                              <span className="text-fairy-ink/60">
                                {formatPHP(product.pricePHP)} ·{" "}
                                {product.stockStatus}
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
                  <span className="sr-only">
                    Idol AI is typing
                  </span>

                  {[0, 1, 2].map((dot) => (
                    <i
                      key={dot}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-fairy-blue-400"
                      style={{
                        animationDelay: `${dot * 0.12}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={submit}
            className="flex items-center gap-2 border-t border-fairy-pink-100 p-2"
          >
            <label
              className="sr-only"
              htmlFor="idol-ai-input"
            >
              Ask Idol AI
            </label>

            <input
              ref={inputRef}
              id="idol-ai-input"
              placeholder="Ask Idol AI..."
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
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

          <p className="px-4 pb-2 text-center text-[10px] text-fairy-ink/40">
            No personal data, please
          </p>
        </section>
      )}

      {/* Floating Mascot - Closed State */}
      {!open && (
        <div className="fixed bottom-4 right-4 z-50">
          {showBubble && (
            <div className="absolute bottom-32 right-0 animate-in fade-in duration-300 md:bottom-48">
              <div className="relative mb-2 w-48 rounded-2xl rounded-br-none border border-fairy-pink-200 bg-white px-3 py-2 text-xs text-fairy-ink shadow-lg">
                {SPEECH_BUBBLES[bubbleIndex]}

                <div className="absolute -bottom-1.5 right-8 h-0 w-0 border-l-6 border-r-0 border-t-6 border-l-transparent border-t-white" />
              </div>
            </div>
          )}

          <button
            onClick={() => setOpen(true)}
            onMouseEnter={() => setHoverMascot(true)}
            onMouseLeave={() => setHoverMascot(false)}
            aria-label="Open Idol AI assistant"
            aria-expanded={open}
            className={`flex items-center justify-center transition-all drop-shadow-lg ${
              hoverMascot ? "scale-110" : "scale-100"
            } ${
              prefersReducedMotion
                ? ""
                : "animate-fairy-float"
            }`}
          >
            <span className="relative block h-24 w-24 md:h-40 md:w-40">
              <RobotImage state="idle" alt="Idol AI" sizes="(min-width: 768px) 160px, 96px" priority />
            </span>
          </button>
        </div>
      )}
    </>
  );
}
