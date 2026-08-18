"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { PRODUCT_CATEGORIES } from "@/types/product";

export default function ProductFilterBar({
  showCategory = true,
  showAvailability = true,
}: {
  showCategory?: boolean;
  showAvailability?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterPanelId = useId();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    if (showAvailability && availability) params.set("availability", availability);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    const sort = searchParams.get("sort");
    if (sort && sort !== "newest") params.set("sort", sort);
    router.push(`?${params.toString()}`, { scroll: false });
    setMobileOpen(false);
  }

  function reset() {
    setQ("");
    setArtist("");
    setCategory("");
    setAvailability("");
    setMinPrice("");
    setMaxPrice("");
    router.push("?", { scroll: false });
    setMobileOpen(false);
  }

  const activeFilters = [
    searchParams.get("q") ? { key: "q", label: `Search: ${searchParams.get("q")}` } : null,
    searchParams.get("artist") ? { key: "artist", label: `Artist: ${searchParams.get("artist")}` } : null,
    showCategory && searchParams.get("category")
      ? { key: "category", label: `Category: ${searchParams.get("category")}` }
      : null,
    showAvailability && searchParams.get("availability")
      ? {
          key: "availability",
          label: searchParams.get("availability") === "In Stock" ? "Available" : searchParams.get("availability")!,
        }
      : null,
    searchParams.get("minPrice") ? { key: "minPrice", label: `From ₱${searchParams.get("minPrice")}` } : null,
    searchParams.get("maxPrice") ? { key: "maxPrice", label: `Up to ₱${searchParams.get("maxPrice")}` } : null,
  ].filter((filter): filter is { key: string; label: string } => filter !== null);

  function removeFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    if (key === "q") setQ("");
    if (key === "artist") setArtist("");
    if (key === "category") setCategory("");
    if (key === "availability") setAvailability("");
    if (key === "minPrice") setMinPrice("");
    if (key === "maxPrice") setMaxPrice("");
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setMobileOpen((current) => !current)}
        aria-expanded={mobileOpen}
        aria-controls={filterPanelId}
        className="flex w-full items-center justify-between rounded-xl border border-fairy-pink-200 bg-white px-4 py-2.5 text-sm font-semibold text-fairy-ink sm:hidden"
      >
        <span>Filters{activeFilters.length > 0 ? ` (${activeFilters.length})` : ""}</span>
        <span aria-hidden="true">{mobileOpen ? "−" : "+"}</span>
      </button>

      {activeFilters.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2" aria-label="Active filters">
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => removeFilter(filter.key)}
              aria-label={`Remove ${filter.label} filter`}
              className="inline-flex items-center gap-1 rounded-full bg-fairy-blue-50 px-2.5 py-1 text-xs font-medium text-fairy-blue-700 hover:bg-fairy-blue-100"
            >
              {filter.label} <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}

      <form
        id={filterPanelId}
        onSubmit={apply}
        className={`${mobileOpen ? "grid" : "hidden"} mt-3 grid-cols-2 gap-2 rounded-2xl border border-fairy-pink-100 bg-white p-3 sm:grid sm:grid-cols-3 lg:grid-cols-7 lg:items-end lg:gap-3`}
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

      {showAvailability && (
        <label className="flex flex-col gap-1 text-xs font-medium text-fairy-ink/70">
          Availability
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="rounded-lg border border-fairy-pink-200 px-2.5 py-1.5 text-sm outline-none focus:border-fairy-pink-400"
          >
            <option value="">Any</option>
            <option value="In Stock">Available</option>
            <option value="Sold Out">Sold Out</option>
          </select>
        </label>
      )}

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
    </div>
  );
}
