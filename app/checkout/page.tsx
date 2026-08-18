"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { useCart } from "@/lib/cart/context";
import { formatPHP } from "@/lib/products/format";
import { getProductPlaceholderImage } from "@/lib/products/images";
import ProductImage from "@/components/products/ProductImage";

type CustomerForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

type SubmissionMessage = {
  kind: "error" | "duplicate" | "needs_review";
  message: string;
  details?: string;
} | null;

function createOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase();
  return `IF-WEB-${date}-${random}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalPHP, clear } = useCart();
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [customer, setCustomer] = useState<CustomerForm>({ name: "", email: "", phone: "", address: "" });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CustomerForm, string>>>({});
  const [orderNumber, setOrderNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<SubmissionMessage>(null);
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  function updateField(field: keyof CustomerForm, value: string) {
    setCustomer((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  function continueToPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors: Partial<Record<keyof CustomerForm, string>> = {};
    if (!customer.name.trim()) errors.name = "Full name is required.";
    if (!customer.email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) errors.email = "Enter a valid email.";
    if (!customer.phone.trim()) errors.phone = "Phone is required.";
    if (!customer.address.trim()) errors.address = "Shipping address is required.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setOrderNumber((current) => current || createOrderNumber());
    setSubmissionMessage(null);
    setStep("payment");
  }

  async function placeOrder() {
    if (submitting || items.length === 0 || !orderNumber) return;
    setSubmitting(true);
    setSubmissionMessage(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          customer,
          items: items.map((item) => ({ slug: item.slug, quantity: item.quantity })),
        }),
      });
      const result = (await response.json()) as {
        status?: string;
        message?: string;
        details?: string;
        orderNumber?: string;
      };

      if (response.ok && result.status === "ok") {
        clear();
        router.replace(`/checkout/confirmation?order=${encodeURIComponent(result.orderNumber ?? orderNumber)}`);
        return;
      }

      setSubmissionMessage({
        kind: result.status === "duplicate" ? "duplicate" : result.status === "needs_review" ? "needs_review" : "error",
        message: result.message || "The test order could not be placed. Your cart was kept.",
        details: result.details,
      });
    } catch {
      setSubmissionMessage({
        kind: "error",
        message: "The checkout service could not be reached. Your cart was kept; please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-extrabold text-fairy-ink">Your cart is empty</h1>
        <p className="mt-2 text-sm text-fairy-ink/60">Add a product before starting the demo checkout.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-fairy-pink-500 px-6 py-3 text-sm font-semibold text-white hover:bg-fairy-pink-600">
          Go to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-fairy-ink sm:text-3xl">Demo Checkout</h1>
        <p className="mt-1 text-sm text-fairy-ink/60">Portfolio test flow — no real payment will be charged.</p>
        <ol className="mt-5 flex max-w-md items-center text-xs font-semibold text-fairy-ink/50" aria-label="Checkout progress">
          <li className="text-fairy-pink-700">Cart</li>
          <li className="mx-3 h-px flex-1 bg-fairy-pink-200" />
          <li className={step === "shipping" ? "text-fairy-pink-700" : "text-fairy-ink/50"}>Shipping</li>
          <li className="mx-3 h-px flex-1 bg-fairy-pink-200" />
          <li className={step === "payment" ? "text-fairy-pink-700" : "text-fairy-ink/50"}>Demo Payment</li>
        </ol>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="rounded-2xl border border-fairy-pink-100 bg-white p-5 sm:p-6">
          {step === "shipping" ? (
            <form onSubmit={continueToPayment} noValidate>
              <h2 className="text-lg font-bold text-fairy-ink">Shipping & Contact</h2>
              <p className="mt-1 text-sm text-fairy-ink/60">Enter the details needed for this test order.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <CheckoutField label="Full name" value={customer.name} error={fieldErrors.name} autoComplete="name" onChange={(value) => updateField("name", value)} />
                <CheckoutField label="Email" type="email" value={customer.email} error={fieldErrors.email} autoComplete="email" onChange={(value) => updateField("email", value)} />
                <CheckoutField label="Phone" type="tel" value={customer.phone} error={fieldErrors.phone} autoComplete="tel" onChange={(value) => updateField("phone", value)} />
                <div className="sm:col-span-2">
                  <CheckoutField label="Shipping address" value={customer.address} error={fieldErrors.address} autoComplete="street-address" multiline onChange={(value) => updateField("address", value)} />
                </div>
              </div>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link href="/cart" className="text-center text-sm font-medium text-fairy-ink/60 hover:text-fairy-pink-700">← Back to cart</Link>
                <button type="submit" className="rounded-full bg-fairy-pink-500 px-6 py-3 text-sm font-semibold text-white hover:bg-fairy-pink-600">Continue to Demo Payment</button>
              </div>
            </form>
          ) : (
            <div>
              <div className="rounded-2xl border border-fairy-blue-200 bg-fairy-blue-50 p-5">
                <span className="inline-flex rounded-full bg-fairy-blue-100 px-3 py-1 text-xs font-bold text-fairy-blue-800">Test Mode</span>
                <h2 className="mt-3 text-xl font-extrabold text-fairy-ink">Demo Payment / Test Mode</h2>
                <p className="mt-2 text-sm leading-relaxed text-fairy-ink/65">No real payment method is collected and no real payment will be charged. Clicking below sends this test order to SALES_V1 for recording.</p>
              </div>

              <dl className="mt-5 grid gap-3 rounded-2xl border border-fairy-pink-100 p-4 text-sm sm:grid-cols-2">
                <div><dt className="text-fairy-ink/50">Customer</dt><dd className="font-semibold text-fairy-ink">{customer.name}</dd></div>
                <div><dt className="text-fairy-ink/50">Email</dt><dd className="break-all font-semibold text-fairy-ink">{customer.email}</dd></div>
                <div><dt className="text-fairy-ink/50">Phone</dt><dd className="font-semibold text-fairy-ink">{customer.phone}</dd></div>
                <div className="sm:col-span-2"><dt className="text-fairy-ink/50">Shipping address</dt><dd className="whitespace-pre-line font-semibold text-fairy-ink">{customer.address}</dd></div>
                <div className="sm:col-span-2"><dt className="text-fairy-ink/50">Test order number</dt><dd className="break-all font-mono text-xs font-semibold text-fairy-ink">{orderNumber}</dd></div>
              </dl>

              {submissionMessage && (
                <div className={`mt-5 rounded-2xl border p-4 text-sm ${submissionMessage.kind === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-fairy-blue-200 bg-fairy-blue-50 text-fairy-blue-900"}`} role="alert">
                  <p className="font-semibold">{submissionMessage.kind === "duplicate" ? "Duplicate test order" : submissionMessage.kind === "needs_review" ? "Order needs review" : "Order not placed"}</p>
                  <p className="mt-1">{submissionMessage.message}</p>
                  {submissionMessage.details && <p className="mt-1 text-xs opacity-80">{submissionMessage.details}</p>}
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" onClick={() => { setStep("shipping"); setSubmissionMessage(null); }} disabled={submitting} className="text-sm font-medium text-fairy-ink/60 hover:text-fairy-pink-700 disabled:opacity-50">← Edit shipping details</button>
                {submissionMessage?.kind === "duplicate" || submissionMessage?.kind === "needs_review" ? (
                  <Link href="/cart" className="rounded-full border border-fairy-pink-200 px-6 py-3 text-center text-sm font-semibold text-fairy-ink hover:bg-fairy-pink-50">Return to Cart</Link>
                ) : (
                  <button type="button" onClick={placeOrder} disabled={submitting} className="rounded-full bg-fairy-pink-500 px-6 py-3 text-sm font-semibold text-white hover:bg-fairy-pink-600 disabled:cursor-wait disabled:opacity-60">
                    {submitting ? "Placing Test Order…" : "Pay & Place Test Order"}
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        <aside className="h-fit rounded-2xl border border-fairy-pink-100 bg-fairy-pink-50/40 p-5">
          <h2 className="font-bold text-fairy-ink">Order Summary</h2>
          <p className="mt-1 text-xs text-fairy-ink/50">{itemCount} item{itemCount === 1 ? "" : "s"}</p>
          <ul className="mt-4 divide-y divide-fairy-pink-100">
            {items.map((item) => (
              <li key={item.slug} className="flex gap-3 py-3 first:pt-0">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
                  <ProductImage
                    src={item.imageUrl || getProductPlaceholderImage(item.category)}
                    fallbackSrc={getProductPlaceholderImage(item.category)}
                    alt={`${item.artist} ${item.productName}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-semibold text-fairy-ink">{item.productName}</p>
                  <p className="text-[11px] text-fairy-ink/50">{item.version || item.artist} · Qty {item.quantity}</p>
                  <p className="mt-1 text-xs font-bold text-fairy-ink">{formatPHP(item.pricePHP * item.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center justify-between border-t border-fairy-pink-200 pt-4">
            <span className="text-sm font-semibold text-fairy-ink">Order total</span>
            <span className="text-xl font-extrabold text-fairy-ink">{formatPHP(subtotalPHP)}</span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-fairy-ink/45">The server verifies current SKUs and prices from the catalog before sending the order.</p>
        </aside>
      </div>
    </div>
  );
}

function CheckoutField({
  label,
  value,
  error,
  type = "text",
  autoComplete,
  multiline = false,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  type?: string;
  autoComplete: string;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  const fieldClass = `mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-fairy-ink outline-none transition focus:ring-2 ${error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-fairy-pink-200 focus:border-fairy-pink-400 focus:ring-fairy-pink-100"}`;
  return (
    <label className="block text-sm font-medium text-fairy-ink/75">
      {label}
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} rows={4} maxLength={500} required aria-invalid={Boolean(error)} className={fieldClass} />
      ) : (
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} maxLength={type === "email" ? 160 : 120} required aria-invalid={Boolean(error)} className={fieldClass} />
      )}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
