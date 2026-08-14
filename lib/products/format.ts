export function formatPHP(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatReleaseDate(isoDate: string | null): string | null {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-PH", { year: "numeric", month: "long", day: "numeric" }).format(date);
}

/** URL-safe slug for the category filter/nav (not the DB slug). */
export function categorySlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}
