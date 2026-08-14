const POINTS = [
  { title: "Live catalog", body: "Stock, price, and preorder status come straight from our database — never guessed." },
  { title: "Guaranteed authentic", body: "Every item is guaranteed authentic and sourced directly from Korea." },
  { title: "Idol AI on standby", body: "Ask about products or store policy anytime, in your own language." },
  { title: "Nationwide PH shipping", body: "Ships from the Philippines to Philippine addresses only — no overseas shipping, no customs surprises." },
  { title: "Fair preorder policy", body: "Preorders ship at least 20 days after the item's release in Korea — no guessing games." },
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
