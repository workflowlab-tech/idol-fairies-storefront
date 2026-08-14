"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/context";
import type { Product } from "@/types/product";

export default function AddToCartPanel({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = product.stockStatus === "Sold Out";

  function handleAdd() {
    if (soldOut) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  if (soldOut) {
    return (
      <button
        disabled
        className="w-full cursor-not-allowed rounded-full bg-fairy-ink/10 px-6 py-3 text-sm font-semibold text-fairy-ink/40"
      >
        Sold Out — Not Available
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-full border border-fairy-pink-200">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-3 py-2 text-fairy-ink/70 hover:text-fairy-pink-600"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => setQuantity((q) => Math.min(20, q + 1))}
          className="px-3 py-2 text-fairy-ink/70 hover:text-fairy-pink-600"
        >
          +
        </button>
      </div>
      <button
        onClick={handleAdd}
        className="flex-1 rounded-full bg-fairy-pink-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-fairy-pink-600"
      >
        {added ? "Added to Cart ✓" : product.stockStatus === "Preorder" ? "Preorder Now" : "Add to Cart"}
      </button>
    </div>
  );
}
