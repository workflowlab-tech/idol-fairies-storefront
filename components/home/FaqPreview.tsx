import Link from "next/link";
import { faqGroups } from "@/data/faq";

export default function FaqPreview() {
  const preview = faqGroups.flatMap((group) => group.items).slice(0, 4);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-extrabold tracking-tight text-fairy-ink sm:text-2xl">Frequently Asked</h2>
        <Link href="/faq" className="text-sm font-semibold text-fairy-pink-600 hover:underline">
          View all FAQs
        </Link>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {preview.map((item) => (
          <div key={item.id} className="rounded-2xl border border-fairy-pink-100 bg-white p-4">
            <h3 className="text-sm font-bold text-fairy-ink">{item.question}</h3>
            <p className="mt-1.5 line-clamp-2 text-sm text-fairy-ink/60">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
