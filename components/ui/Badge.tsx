import type { ReactNode } from "react";

const VARIANTS = {
  soldOut: "bg-fairy-danger/10 text-fairy-danger",
  new: "bg-fairy-pink-100 text-fairy-pink-700",
  sale: "bg-fairy-gold/15 text-fairy-gold",
  neutral: "bg-fairy-ink/5 text-fairy-ink/70",
} as const;

export function Badge({
  variant = "neutral",
  children,
  className = "",
}: {
  variant?: keyof typeof VARIANTS;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function StockBadge({ status, className }: { status: string; className?: string }) {
  if (status === "Sold Out") return <Badge variant="soldOut" className={className}>Sold Out</Badge>;
  return <Badge variant="neutral" className={className}>Available</Badge>;
}
