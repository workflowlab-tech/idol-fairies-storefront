import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "About / Why Idol Fairies" };

const REASONS = [
  {
    title: "Authentic K-pop Merchandise",
    body: "We carefully source official albums, merchandise, and collectibles from trusted suppliers so fans can shop with confidence.",
  },
  {
    title: "Preorders Made Easier",
    body: "Release dates, versions, inclusions, and preorder timelines can get confusing. We make important preorder information easier to find and understand.",
  },
  {
    title: "Meet Idol AI",
    body: "Our floating Idol AI assistant can help you discover products, check product information, and answer questions about preorders, shipping, and store policies.",
  },
  {
    title: "Made for K-pop Fans",
    body: "Whether you're looking for your bias's newest album or adding another light stick to your collection, Idol Fairies is designed around the way K-pop fans actually shop.",
  },
  {
    title: "Help in Your Language",
    body: "Idol AI can assist shoppers in multiple languages, making product and store information easier to access for fans from different places.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="relative block h-20 w-20 overflow-hidden rounded-3xl bg-fairy-ink">
          <Image src="/idol-fairies-logo.jpg" alt="Idol Fairies" fill sizes="80px" className="object-cover" />
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-fairy-ink">Why Idol Fairies</h1>
        <p className="max-w-xl text-sm leading-relaxed text-fairy-ink/60">
          Idol Fairies is a K-pop store created to make collecting easier, clearer, and a little more magical.
          <br />
          <br />
          From albums and light sticks to photobooks and collectibles, we bring together carefully sourced K-pop
          merchandise with clear product information, preorder updates, and helpful support throughout your shopping
          journey.
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
