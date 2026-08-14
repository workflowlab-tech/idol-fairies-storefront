import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "About / Why Idol Fairies" };

const REASONS = [
  {
    title: "Real catalog, honestly labeled",
    body: "Every product on this site comes straight from our live catalog — we don't invent stock, prices, or release dates. If we don't have a fact, we say so instead of guessing.",
  },
  {
    title: "Idol AI, not a script",
    body: "Our floating assistant answers product questions from the live catalog and policy questions from our own knowledge base — never a mix of the two pretending to be certainty.",
  },
  {
    title: "Guaranteed authentic, from Korea",
    body: "Every item we sell is guaranteed authentic and sourced directly from Korea — no reproductions, no unofficial merchandise.",
  },
  {
    title: "Built for PH fans",
    body: "Idol Fairies PH ships from the Philippines to Philippine addresses nationwide — no overseas shipping, and no customs surprises on delivery.",
  },
  {
    title: "Multilingual by default",
    body: "Idol AI replies in whatever language you write in — English, Filipino, Korean, Japanese, and beyond — because the K-pop fandom is global.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="relative block h-20 w-20 overflow-hidden rounded-3xl bg-fairy-ink">
          <Image src="/idol-fairies-logo.jpg" alt="Idol Fairies PH" fill sizes="80px" className="object-cover" />
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-fairy-ink">Why Idol Fairies</h1>
        <p className="max-w-xl text-sm leading-relaxed text-fairy-ink/60">
          Idol Fairies PH is a modern K-pop e-commerce storefront built as a portfolio system — a real Supabase-backed
          catalog, a working cart, and a hybrid AI assistant that combines live product data with a proper policy
          knowledge base, instead of stuffing everything into one giant prompt.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {REASONS.map((reason) => (
          <div key={reason.title} className="rounded-2xl border border-fairy-pink-100 bg-white p-5">
            <h2 className="text-sm font-bold text-fairy-pink-600">{reason.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-fairy-ink/70">{reason.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
