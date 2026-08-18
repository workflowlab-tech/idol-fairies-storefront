"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";

const STORAGE_KEY = "idol-fairies-cart";

// Module-level store (there is a single CartProvider mounted in the root
// layout) synced via useSyncExternalStore — this is the idiomatic way to
// read/write an external mutable source like localStorage from React
// without the "setState synchronously inside an effect" anti-pattern or a
// server/client hydration mismatch (getServerSnapshot always returns []).
let cachedRaw: string | null = null;
let cachedItems: CartItem[] = [];
let listeners: Array<() => void> = [];

function readItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedItems;
  cachedRaw = raw;
  try {
    cachedItems = raw ? JSON.parse(raw) : [];
  } catch {
    cachedItems = [];
  }
  return cachedItems;
}

function writeItems(items: CartItem[]) {
  cachedItems = items;
  cachedRaw = JSON.stringify(items);
  window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
    window.removeEventListener("storage", listener);
  };
}

// Must be a stable reference — useSyncExternalStore warns/loops if
// getServerSnapshot returns a new array literal on every call.
const EMPTY_ITEMS: CartItem[] = [];
function getServerSnapshot(): CartItem[] {
  return EMPTY_ITEMS;
}

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  subtotalPHP: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, readItems, getServerSnapshot);

  const addItem = useCallback((product: Product, quantity = 1) => {
    // Sold Out products are never addable — enforced here too, not just in the UI.
    if (product.stockStatus === "Sold Out") return;
    const current = readItems();
    const existing = current.find((item) => item.slug === product.slug);
    const next = existing
      ? current.map((item) => (item.slug === product.slug ? { ...item, quantity: item.quantity + quantity } : item))
      : [
          ...current,
          {
            slug: product.slug,
            productName: product.productName,
            artist: product.artist,
            version: product.version,
            category: product.category,
            imageUrl: product.imageUrl,
            pricePHP: product.pricePHP,
            quantity,
          },
        ];
    writeItems(next);
  }, []);

  const removeItem = useCallback((slug: string) => {
    writeItems(readItems().filter((item) => item.slug !== slug));
  }, []);

  const updateQuantity = useCallback(
    (slug: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(slug);
        return;
      }
      writeItems(readItems().map((item) => (item.slug === slug ? { ...item, quantity } : item)));
    },
    [removeItem]
  );

  const clear = useCallback(() => writeItems([]), []);

  const subtotalPHP = useMemo(() => items.reduce((sum, item) => sum + item.pricePHP * item.quantity, 0), [items]);
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear, subtotalPHP, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
