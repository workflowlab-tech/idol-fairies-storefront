"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { sendChatMessage } from "@/lib/chat/client";
import { formatPHP } from "@/lib/products/format";
import {
  MAX_HISTORY_MESSAGES,
  MAX_MESSAGE_LENGTH,
  type ChatHistoryMessage,
  type ChatProductSummary,
} from "@/types/chat";

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
  products?: ChatProductSummary[];
};

type RobotState = "idle" | "thinking" | "searching" | "success";

const ROBOT_IMAGES: Record<RobotState, string> = {
  idle: "/chatbot/idol-ai-idle.webp",
  thinking: "/chatbot/idol-ai-thinking.webp",
  searching: "/chatbot/idol-ai-searching.webp",
  success: "/chatbot/idol-ai-success.webp",
};

const AMBIENT_ROBOT_STATES: RobotState[] = ["idle", "thinking", "searching", "success"];

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
  text: "Hi! I'm Idol AI ✨ Ask me about albums, light sticks, availability, shipping, or store policies — in whatever language you're comfortable with.",
};

const PROMPTS = [
  "Do you have Stray Kids albums?",
  "Do you offer wholesale pricing?",
  "How long does shipping take?",
  "Any light sticks under ₱3,000?",
  "商品は日本に発送できますか？",
  "返品はできますか？",
];

const SPEECH_BUBBLES = [
  "Need help? ✨",
  "Looking for your bias?",
  "Ask about wholesale orders!",
  "Need a recommendation?",
];

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [productContext, setProductContext] = useState<string>();
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleIndex, setBubbleIndex] = useState(0);
  const [robotState, setRobotState] = useState<RobotState>("idle");
  const [ambientRobotState, setAmbientRobotState] = useState<RobotState>("idle");
  const [mobileScrolling, setMobileScrolling] = useState(false);
  const hideMobileLauncher =
    pathname.startsWith("/products/") ||
    pathname === "/cart" ||
    pathname.startsWith("/checkout");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const shouldRestoreFocusRef = useRef(false);

  // TypeScript/React fix:
  // useRef requires an initial value with the current project typings.
  const bubbleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollIdleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const openChat = useCallback(() => {
    restoreFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : launcherRef.current;
    setShowBubble(false);
    setOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    shouldRestoreFocusRef.current = true;
    setOpen(false);
  }, []);

  useEffect(() => {
    if (open || !shouldRestoreFocusRef.current) return;
    shouldRestoreFocusRef.current = false;
    const previous = restoreFocusRef.current;
    const target = previous?.isConnected ? previous : launcherRef.current;
    target?.focus();
  }, [open]);

  useEffect(() => {
    return () => {
      if (searchingTimeoutRef.current) clearTimeout(searchingTimeoutRef.current);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      if (scrollIdleTimeoutRef.current) clearTimeout(scrollIdleTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    function hideLauncherWhileScrolling() {
      if (open || !window.matchMedia("(max-width: 639px)").matches) return;

      setMobileScrolling(true);
      if (scrollIdleTimeoutRef.current) clearTimeout(scrollIdleTimeoutRef.current);
      scrollIdleTimeoutRef.current = setTimeout(() => {
        setMobileScrolling(false);
        scrollIdleTimeoutRef.current = null;
      }, 900);
    }

    window.addEventListener("scroll", hideLauncherWhileScrolling, { passive: true });
    return () => window.removeEventListener("scroll", hideLauncherWhileScrolling);
  }, [open]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAmbientRobotState((current) => {
        const currentIndex = AMBIENT_ROBOT_STATES.indexOf(current);
        return AMBIENT_ROBOT_STATES[(currentIndex + 1) % AMBIENT_ROBOT_STATES.length];
      });
    }, 2600);

    return () => clearInterval(interval);
  }, []);

  // Speech bubble timing: show after 2 seconds, hide after 6 seconds
  useEffect(() => {
    const desktopLauncher = window.matchMedia("(min-width: 640px)");
    if (open || !desktopLauncher.matches) return;

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

    function hideBubbleOnMobile(event: MediaQueryListEvent) {
      if (!event.matches) setShowBubble(false);
    }

    desktopLauncher.addEventListener("change", hideBubbleOnMobile);

    return () => {
      if (bubbleTimeoutRef.current) {
        clearTimeout(bubbleTimeoutRef.current);
      }
      desktopLauncher.removeEventListener("change", hideBubbleOnMobile);
    };
  }, [open]);

  useEffect(() => {
    function handler(event: Event) {
      const custom = event as CustomEvent<{
        productContext?: string;
      }>;

      setProductContext(custom.detail?.productContext);
      setRobotState("idle");
      openChat();
    }

    window.addEventListener("open-idol-ai", handler);

    return () => {
      window.removeEventListener("open-idol-ai", handler);
    };
  }, [openChat]);

  useEffect(() => {
    if (!open) return;

    window.requestAnimationFrame(() => inputRef.current?.focus());

    function handleDialogKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeChat();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleDialogKeyDown);
    return () => document.removeEventListener("keydown", handleDialogKeyDown);
  }, [closeChat, open]);

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

  return (
    <>
      {/* Chat Panel - Open State */}
      {open && (
        <section
          id="idol-ai-dialog"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="idol-ai-dialog-title"
          className="fixed bottom-24 right-4 z-50 flex h-[min(32rem,70vh)] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-fairy-pink-200 bg-white shadow-2xl"
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
              <strong id="idol-ai-dialog-title" className="text-sm">Idol AI</strong>
              <p className="truncate text-xs text-fairy-cream/70">
                Multilingual shopping assistant
              </p>
            </div>

            <button
              onClick={closeChat}
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

                  {message.products &&
                    message.products.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1.5">
                        {message.products.map((product) => {
                          return (
                            <Link
                              key={product.slug}
                              href={`/products/${product.slug}`}
                              onClick={closeChat}
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
        <div className={`chatbot-launcher-position fixed z-50 transition-opacity duration-200 ${hideMobileLauncher || mobileScrolling ? "hidden sm:block" : ""}`}>
          {showBubble && (
            <div className="absolute bottom-32 right-0 hidden animate-in fade-in duration-300 sm:block md:bottom-48">
              <div className="relative mb-2 w-48 rounded-2xl rounded-br-none border border-fairy-pink-200 bg-white px-3 py-2 text-xs text-fairy-ink shadow-lg">
                {SPEECH_BUBBLES[bubbleIndex]}

                <div className="absolute -bottom-1.5 right-8 h-0 w-0 border-l-6 border-r-0 border-t-6 border-l-transparent border-t-white" />
              </div>
            </div>
          )}

          <button
            ref={launcherRef}
            onClick={openChat}
            aria-label="Open Idol AI assistant"
            aria-expanded={open}
            aria-controls="idol-ai-dialog"
            className="chatbot-mascot-button flex items-center justify-center drop-shadow-lg"
          >
            <span className="relative block h-16 w-16 sm:h-24 sm:w-24 md:h-40 md:w-40">
              <RobotImage
                state={ambientRobotState}
                alt="Idol AI"
                sizes="(min-width: 768px) 160px, (min-width: 640px) 96px, 64px"
                priority={ambientRobotState === "idle"}
              />
            </span>
          </button>
        </div>
      )}
    </>
  );
}
