import Link from "next/link";

const ORDER_NUMBER_PATTERN = /^IF-WEB-\d{8}-[A-F0-9]{12}$/;

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string | string[] }>;
}) {
  const params = await searchParams;
  const candidate = Array.isArray(params.order) ? params.order[0] : params.order;
  const orderNumber = candidate?.toUpperCase() ?? "";
  const validOrderNumber = ORDER_NUMBER_PATTERN.test(orderNumber);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <div className="rounded-3xl border border-fairy-pink-100 bg-white p-8 shadow-sm sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-fairy-blue-100 text-2xl text-fairy-blue-800" aria-hidden="true">✓</div>
        <p className="mt-5 text-xs font-bold uppercase tracking-widest text-fairy-blue-700">Demo order recorded</p>
        <h1 className="mt-2 text-2xl font-extrabold text-fairy-ink sm:text-3xl">Order Confirmation</h1>
        <p className="mt-3 text-sm leading-relaxed text-fairy-ink/60">Your test order was accepted by SALES_V1. No real payment was charged.</p>
        {validOrderNumber ? (
          <div className="mt-6 rounded-2xl bg-fairy-pink-50 p-4">
            <p className="text-xs text-fairy-ink/50">Order number</p>
            <p className="mt-1 break-all font-mono text-sm font-bold text-fairy-ink">{orderNumber}</p>
          </div>
        ) : (
          <p className="mt-6 rounded-2xl bg-fairy-pink-50 p-4 text-sm text-fairy-ink/60">The confirmation link does not contain a valid test order number.</p>
        )}
        <Link href="/shop" className="mt-7 inline-block rounded-full bg-fairy-pink-500 px-6 py-3 text-sm font-semibold text-white hover:bg-fairy-pink-600">Continue Shopping</Link>
      </div>
    </div>
  );
}
