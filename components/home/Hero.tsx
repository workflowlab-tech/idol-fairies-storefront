import type { Product } from "@/types/product";
import FeaturedCarousel from "./FeaturedCarousel";

export default function Hero({ products }: { products: Product[] }) {
  return (
    <section className="relative overflow-hidden bg-fairy-ink">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(227,123,175,0.35),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(90,147,221,0.35),transparent_45%)]" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-14 sm:px-6 lg:flex-row lg:py-20">
        <div className="flex-1 text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-fairy-pink-200">
            ✨ Albums · Light Sticks · Photobooks · Magazines
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Your K-pop shelf,
            <br />
            <span className="text-fairy-pink-300">wherever you are.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-fairy-cream/70 lg:mx-0">
            Guaranteed authentic, straight from Korea — shipped nationwide across the Philippines. Real stock, real
            prices, no guesswork, and Idol AI on standby for preorder, shipping, and policy questions in your
            language.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
            <a
              href="#featured"
              className="rounded-full bg-fairy-pink-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-fairy-pink-400"
            >
              Shop Featured
            </a>
            <a
              href="/shop"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View All
            </a>
          </div>
        </div>
        <div className="w-full flex-1 lg:w-auto">
          <FeaturedCarousel products={products} />
        </div>
      </div>
    </section>
  );
}
