"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PRODUCT_CATEGORIES } from "@/types/product";

export default function ProductFilterBar({ showCategory = true }: { showCategory?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [artist, setArtist] = useState(searchParams.get("artist") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [availability, setAvailability] = useState(searchParams.get("availability") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  function apply(event?: FormEvent) {
    event?.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (artist) params.set("artist", artist);
    if (showCategory && category) params.set("category", category);
    if (availability) params.set("availability", availability);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function reset() {
    setQ("");
    setArtist("");
    setCategory("");
    setAvailability("");
    setMinPrice("");
    setMaxPrice("");
    router.push("?", { scroll: false });
  }

  return (
    <form
      onSubmit={apply}
      className="grid grid-cols-2 gap-2 rounded-2xl border border-fairy-pink-100 bg-white p-3 sm:grid-cols-3 lg:grid-cols-7 lg:items-end lg:gap-3"
    >
      <label className="col-span-2 flex flex-col gap-1 text-xs font-medium text-fairy-ink/70 lg:col-span-2">
        Search
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Product name, keyword…"
          className="rounded-lg border border-fairy-pink-200 px-2.5 py-1.5 text-sm outline-none focus:border-fairy-pink-400"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-fairy-ink/70">
        Artist
        <input
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="e.g. Stray Kids"
          className="rounded-lg border border-fairy-pink-200 px-2.5 py-1.5 text-sm outline-none focus:border-fairy-pink-400"
        />
      </label>

      {showCategory && (
        <label className="flex flex-col gap-1 text-xs font-medium text-fairy-ink/70">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-fairy-pink-200 px-2.5 py-1.5 text-sm outline-none focus:border-fairy-pink-400"
          >
            <option value="">Any</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="flex flex-col gap-1 text-xs font-medium text-fairy-ink/70">
        Availability
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="rounded-lg border border-fairy-pink-200 px-2.5 py-1.5 text-sm outline-none focus:border-fairy-pink-400"
        >
          <option value="">Any</option>
          <option value="In Stock">In Stock</option>
          <option value="Preorder">Preorder</option>
          <option value="Sold Out">Sold Out</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-fairy-ink/70">
        Min ₱
        <input
          type="number"
          min={0}
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="rounded-lg border border-fairy-pink-200 px-2.5 py-1.5 text-sm outline-none focus:border-fairy-pink-400"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-fairy-ink/70">
        Max ₱
        <input
          type="number"
          min={0}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="rounded-lg border border-fairy-pink-200 px-2.5 py-1.5 text-sm outline-none focus:border-fairy-pink-400"
        />
      </label>

      <div className="col-span-2 flex gap-2 sm:col-span-3 lg:col-span-1">
        <button type="submit" className="flex-1 rounded-lg bg-fairy-pink-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-fairy-pink-600">
          Apply
        </button>
        <button type="button" onClick={reset} className="rounded-lg border border-fairy-pink-200 px-3 py-1.5 text-sm text-fairy-ink/60 hover:bg-fairy-pink-50">
          Reset
        </button>
      </div>
    </form>
  );
}
