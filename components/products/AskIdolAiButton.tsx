"use client";

export default function AskIdolAiButton({ productContext }: { productContext: string }) {
  function open() {
    window.dispatchEvent(new CustomEvent("open-idol-ai", { detail: { productContext } }));
  }

  return (
    <button
      onClick={open}
      className="flex w-full items-center justify-center gap-2 rounded-full border border-fairy-blue-300 bg-fairy-blue-50 px-6 py-3 text-sm font-semibold text-fairy-blue-700 transition hover:bg-fairy-blue-100"
    >
      Ask Idol AI about this item
    </button>
  );
}
