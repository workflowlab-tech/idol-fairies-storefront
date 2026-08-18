"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProductImage from "@/components/products/ProductImage";
import { supabase } from "@/lib/supabase/client";

const CATEGORIES = [
  {
    href: "/albums",
    label: "Albums",
    category: "Album",
    placeholder: "/placeholders/album-front.svg",
  },
  {
    href: "/light-sticks",
    label: "Light Sticks",
    category: "Light Stick",
    placeholder: "/placeholders/light-stick-front.svg",
  },
  {
    href: "/photobooks",
    label: "Photobooks & Magazines",
    category: "Photobook",
    placeholder: "/placeholders/photobook-front.svg",
  },
  {
    href: "/shop?category=Collectable",
    label: "Collectibles",
    category: "Collectable",
    placeholder: "/placeholders/collectable-front.svg",
  },
];

type ProductImageRow = {
  image_url: string | null;
};

export default function CategoryGrid() {
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    const loadImages = async () => {
      const images: Record<string, string> = {};

      const pickFirstImage = (rows: ProductImageRow[] | null) => {
        const validRows =
          rows?.filter(
            (row): row is { image_url: string } =>
              typeof row.image_url === "string" &&
              row.image_url.trim().length > 0
          ) ?? [];

        if (validRows.length === 0) return null;

        return validRows[0].image_url;
      };

      for (const cat of CATEGORIES) {
        // 1. Prefer In Stock products.
        const { data: available, error: availableError } = await supabase
          .from("products")
          .select("image_url")
          .eq("category", cat.category)
          .eq("stock_status", "In Stock")
          .not("image_url", "is", null)
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .limit(1);

        if (availableError) {
          console.error(
            `Failed to load available ${cat.category} images:`,
            availableError
          );
        }

        const availableImage = pickFirstImage(available);

        if (availableImage) {
          images[cat.category] = availableImage;
          continue;
        }

        // 2. Last fallback: Sold Out products with a real image.
        const { data: soldOut, error: soldOutError } = await supabase
          .from("products")
          .select("image_url")
          .eq("category", cat.category)
          .eq("stock_status", "Sold Out")
          .not("image_url", "is", null)
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .limit(1);

        if (soldOutError) {
          console.error(
            `Failed to load sold-out ${cat.category} images:`,
            soldOutError
          );
        }

        const soldOutImage = pickFirstImage(soldOut);

        if (soldOutImage) {
          images[cat.category] = soldOutImage;
        }
      }

      setCategoryImages(images);
    };

    loadImages();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-extrabold tracking-tight text-fairy-ink sm:text-2xl">
        Shop by Category
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="group relative aspect-[4/5] overflow-hidden rounded-2xl"
          >
            <ProductImage
              src={categoryImages[cat.category] || cat.placeholder}
              fallbackSrc={cat.placeholder}
              alt={cat.label}
              fill
              sizes="(min-width: 1024px) 22vw, 45vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />

            <span className="absolute bottom-3 left-3 text-sm font-bold text-white">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
