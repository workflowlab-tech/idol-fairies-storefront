"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/context";
import { formatPHP } from "@/lib/products/format";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotalPHP, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-extrabold text-fairy-ink">Your cart is empty</h1>
        <p className="mt-2 text-sm text-fairy-ink/60">Browse the shop and add something to your cart.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-fairy-pink-500 px-6 py-3 text-sm font-semibold text-white hover:bg-fairy-pink-600"
        >
          Go to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-extrabold text-fairy-ink">Your Cart</h1>

      <ul className="mt-6 divide-y divide-fairy-pink-100 rounded-2xl border border-fairy-pink-100 bg-white">
        {items.map((item) => (
          <li key={item.slug} className="flex items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <Link href={`/products/${item.slug}`} className="block truncate text-sm font-semibold text-fairy-ink hover:text-fairy-pink-600">
                {item.productName}
              </Link>
              <p className="text-xs text-fairy-ink/50">
                {item.artist}
                {item.version ? ` · ${item.version}` : ""}
              </p>
              <p className="mt-1 text-sm font-semibold text-fairy-ink">{formatPHP(item.pricePHP)}</p>
            </div>

            <div className="flex items-center rounded-full border border-fairy-pink-200">
              <button
                aria-label={`Decrease quantity of ${item.productName}`}
                onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                className="px-2.5 py-1.5 text-fairy-ink/70 hover:text-fairy-pink-600"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
              <button
                aria-label={`Increase quantity of ${item.productName}`}
                onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                className="px-2.5 py-1.5 text-fairy-ink/70 hover:text-fairy-pink-600"
              >
                +
              </button>
            </div>

            <button
              aria-label={`Remove ${item.productName} from cart`}
              onClick={() => removeItem(item.slug)}
              className="text-fairy-ink/40 hover:text-fairy-danger"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-fairy-pink-100 bg-fairy-pink-50/40 p-4">
        <div>
          <p className="text-xs text-fairy-ink/50">Subtotal</p>
          <p className="text-xl font-extrabold text-fairy-ink">{formatPHP(subtotalPHP)}</p>
        </div>
        <button onClick={clear} className="text-sm text-fairy-ink/50 underline hover:text-fairy-danger">
          Clear cart
        </button>
      </div>

      <button
        disabled
        title="Checkout isn't wired up yet — this is a portfolio storefront demo."
        className="mt-4 w-full cursor-not-allowed rounded-full bg-fairy-ink/10 px-6 py-3 text-sm font-semibold text-fairy-ink/40"
      >
        Checkout (coming soon)
      </button>
    </div>
  );
}
