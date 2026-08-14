import Image from "next/image";
import Link from "next/link";

export default function Hero() {
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
            <Link
              href="/shop"
              className="rounded-full bg-fairy-pink-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-fairy-pink-400"
            >
              Shop All Products
            </Link>
            <Link
              href="/new-releases"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              New Releases
            </Link>
          </div>
        </div>
        <div className="relative h-56 w-56 shrink-0 sm:h-72 sm:w-72">
          <Image src="/idol-ai-robot.png" alt="Idol AI robot mascot" fill sizes="288px" className="object-contain animate-fairy-float" priority />
        </div>
      </div>
    </section>
  );
}
