import Link from "next/link";
import Image from "next/image";

const CATEGORIES = [
  { href: "/albums", label: "Albums", image: "/placeholders/album-front.svg" },
  { href: "/light-sticks", label: "Light Sticks", image: "/placeholders/light-stick-front.svg" },
  { href: "/photobooks", label: "Photobooks & Magazines", image: "/placeholders/photobook-front.svg" },
  { href: "/shop?category=Collectable", label: "Collectables", image: "/placeholders/collectable-front.svg" },
];

export default function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-extrabold tracking-tight text-fairy-ink sm:text-2xl">Shop by Category</h2>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {CATEGORIES.map((category) => (
          <Link
            key={category.href}
            href={category.href}
            className="group relative aspect-[4/5] overflow-hidden rounded-2xl"
          >
            <Image src={category.image} alt="" fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-cover transition duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
            <span className="absolute bottom-3 left-3 text-sm font-bold text-white">{category.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
