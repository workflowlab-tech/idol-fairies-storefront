import type { Metadata } from "next";
import { faqGroups } from "@/lib/faq/knowledge";
import FaqAccordion from "@/components/ui/FaqAccordion";

export const metadata: Metadata = { title: "FAQ" };

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-fairy-ink sm:text-3xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-1 text-sm text-fairy-ink/60">
          Shipping, availability, wholesale orders, returns, and more — the same policies Idol AI answers from.
        </p>
      </header>
      <FaqAccordion groups={faqGroups} />
    </div>
  );
}
