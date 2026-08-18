"use client";

import { FormEvent, useState } from "react";

type FormState = {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  productsInterested: string;
  estimatedQuantity: string;
  message: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  businessName: "",
  email: "",
  phone: "",
  productsInterested: "",
  estimatedQuantity: "",
  message: "",
};

export default function WholesaleSection() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>();

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(undefined);

    try {
      const response = await fetch("/api/wholesale-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          businessName: form.businessName,
          email: form.email,
          phone: form.phone,
          productsInterested: form.productsInterested,
          estimatedQuantity: form.estimatedQuantity,
          message: form.message,
        }),
      });

      const result = await response.json();
      if (!response.ok || result.status !== "ok") {
        setErrorMessage(result.message || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setForm(EMPTY_FORM);
      setStatus("success");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <section id="wholesale" className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-fairy-blue-100 bg-fairy-blue-50/50 p-5 sm:p-7">
        <h2 className="text-lg font-extrabold tracking-tight text-fairy-ink sm:text-xl">
          Wholesale &amp; Bulk Orders
        </h2>
        <p className="mt-1.5 text-sm text-fairy-ink/70">
          Ordering for a shop, fan group, or event? Contact us for reseller and bulk pricing.
        </p>

        {status === "success" ? (
          <div className="mt-5 rounded-xl border border-fairy-blue-200 bg-white px-4 py-3 text-sm text-fairy-ink/80">
            Thanks! Your inquiry has been sent — we'll follow up by email.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-fairy-ink/70">
              Name
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="rounded-lg border border-fairy-pink-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-fairy-pink-400"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-fairy-ink/70">
              Business / Shop / Group name
              <input
                required
                value={form.businessName}
                onChange={(e) => update("businessName", e.target.value)}
                className="rounded-lg border border-fairy-pink-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-fairy-pink-400"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-fairy-ink/70">
              Email
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="rounded-lg border border-fairy-pink-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-fairy-pink-400"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-fairy-ink/70">
              Phone <span className="text-fairy-ink/40">(optional)</span>
              <input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="rounded-lg border border-fairy-pink-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-fairy-pink-400"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-fairy-ink/70 sm:col-span-2">
              Products interested in
              <input
                required
                placeholder="e.g. Stray Kids albums, light sticks…"
                value={form.productsInterested}
                onChange={(e) => update("productsInterested", e.target.value)}
                className="rounded-lg border border-fairy-pink-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-fairy-pink-400"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-fairy-ink/70">
              Estimated quantity
              <input
                required
                placeholder="e.g. 30 pieces"
                value={form.estimatedQuantity}
                onChange={(e) => update("estimatedQuantity", e.target.value)}
                className="rounded-lg border border-fairy-pink-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-fairy-pink-400"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-fairy-ink/70 sm:col-span-2">
              Message
              <textarea
                rows={3}
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                className="rounded-lg border border-fairy-pink-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-fairy-pink-400"
              />
            </label>

            {status === "error" && errorMessage && (
              <p className="text-xs font-medium text-fairy-danger sm:col-span-2">{errorMessage}</p>
            )}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="rounded-lg bg-fairy-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-fairy-blue-700 disabled:opacity-50"
              >
                {status === "submitting" ? "Sending…" : "Send Inquiry"}
              </button>
              <p className="mt-2 text-[11px] text-fairy-ink/50">
                This form is for inquiries only — it doesn't place an order. We'll reach out to confirm pricing and availability.
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
