const POINTS = [
  { title: "Live catalog", body: "Stock, price, and preorder status come straight from our database — never guessed." },
  {
    title: "Official product sourcing",
    body: "Products listed as official merchandise are sourced from established K-pop suppliers and retailers.",
  },
  { title: "Idol AI on standby", body: "Ask about products or store policy anytime, in your own language." },
  {
    title: "Current shipping options",
    body: "Available destinations, delivery methods, and charges are confirmed through the store's current checkout options.",
  },
  {
    title: "Clear preorder details",
    body: "Timing depends on release, supplier availability, arrival, and processing. Check each product for current details.",
  },
];

export default function WhyShop() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-extrabold tracking-tight text-fairy-ink sm:text-2xl">Why Shop With Us</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {POINTS.map((point) => (
          <div key={point.title} className="rounded-2xl border border-fairy-pink-100 bg-white p-5">
            <h3 className="text-sm font-bold text-fairy-pink-600">{point.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-fairy-ink/70">{point.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
