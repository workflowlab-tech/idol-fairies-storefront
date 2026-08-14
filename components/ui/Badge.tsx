import type { ReactNode } from "react";

const VARIANTS = {
  soldOut: "bg-fairy-danger/10 text-fairy-danger",
  preorder: "bg-fairy-blue-100 text-fairy-blue-700",
  new: "bg-fairy-pink-100 text-fairy-pink-700",
  sale: "bg-fairy-gold/15 text-fairy-gold",
  neutral: "bg-fairy-ink/5 text-fairy-ink/70",
} as const;

export function Badge({ variant = "neutral", children }: { variant?: keyof typeof VARIANTS; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${VARIANTS[variant]}`}>
      {children}
    </span>
  );
}

export function StockBadge({ status }: { status: string }) {
  if (status === "Sold Out") return <Badge variant="soldOut">Sold Out</Badge>;
  if (status === "Preorder") return <Badge variant="preorder">Preorder</Badge>;
  return <Badge variant="neutral">In Stock</Badge>;
}
