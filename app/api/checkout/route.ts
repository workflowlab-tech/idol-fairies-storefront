import { supabase } from "@/lib/supabase/client";

export const runtime = "nodejs";

type CheckoutRequest = {
  orderNumber?: unknown;
  customer?: {
    name?: unknown;
    email?: unknown;
    phone?: unknown;
    address?: unknown;
  };
  items?: Array<{ slug?: unknown; quantity?: unknown }>;
};

type SalesV1Response = {
  status?: unknown;
  message?: unknown;
  details?: unknown;
  order_number?: unknown;
  sales_order_id?: unknown;
  items_saved?: unknown;
  unmatched_skus?: unknown;
};

const ORDER_NUMBER_PATTERN = /^IF-WEB-\d{8}-[A-F0-9]{12}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function errorResponse(message: string, status: number, details?: string) {
  return Response.json({ status: "error", message, ...(details ? { details } : {}) }, { status });
}

export async function POST(request: Request) {
  let body: CheckoutRequest;

  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return errorResponse("The checkout request must be a JSON object.", 400);
    }
    body = parsed as CheckoutRequest;
  } catch {
    return errorResponse("The checkout request was not valid JSON.", 400);
  }

  const orderNumber = text(body.orderNumber, 40).toUpperCase();
  const customer = {
    name: text(body.customer?.name, 120),
    email: text(body.customer?.email, 160).toLowerCase(),
    phone: text(body.customer?.phone, 40),
    address: text(body.customer?.address, 500),
  };

  const validationErrors: string[] = [];
  if (!ORDER_NUMBER_PATTERN.test(orderNumber)) validationErrors.push("The test order number is invalid.");
  if (!customer.name) validationErrors.push("Full name is required.");
  if (!customer.email || !EMAIL_PATTERN.test(customer.email)) validationErrors.push("A valid email is required.");
  if (!customer.phone) validationErrors.push("Phone is required.");
  if (!customer.address) validationErrors.push("Shipping address is required.");

  if (!Array.isArray(body.items) || body.items.length === 0) {
    validationErrors.push("Your cart is empty.");
  } else if (body.items.length > 20) {
    validationErrors.push("A maximum of 20 different products is allowed per test order.");
  }

  const requestedItems = Array.isArray(body.items)
    ? body.items.map((item) => {
        const safeItem = item && typeof item === "object" ? item : {};
        return {
          slug: text(safeItem.slug, 220),
          quantity: typeof safeItem.quantity === "number" ? safeItem.quantity : Number(safeItem.quantity),
        };
      })
    : [];

  const seenSlugs = new Set<string>();
  requestedItems.forEach((item, index) => {
    if (!item.slug) validationErrors.push(`Item ${index + 1} is missing its product identifier.`);
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
      validationErrors.push(`Item ${index + 1} has an invalid quantity.`);
    }
    if (seenSlugs.has(item.slug)) validationErrors.push(`Item ${index + 1} is duplicated in the cart.`);
    seenSlugs.add(item.slug);
  });

  if (validationErrors.length > 0) {
    return errorResponse("Please correct the checkout details and try again.", 400, validationErrors.join(" "));
  }

  const { data: catalogItems, error: catalogError } = await supabase
    .from("products")
    .select("id, slug, sku, price_php, stock_status")
    .in(
      "slug",
      requestedItems.map((item) => item.slug)
    );

  if (catalogError) {
    console.error("Checkout catalog lookup failed:", catalogError.message);
    return errorResponse("We could not verify the cart against the catalog. Please try again.", 502);
  }

  const productsBySlug = new Map((catalogItems ?? []).map((product) => [product.slug, product]));
  const canonicalItems: Array<{ productId: number; sku: string; quantity: number; unitPrice: number }> = [];

  for (const requestedItem of requestedItems) {
    const product = productsBySlug.get(requestedItem.slug);
    if (!product) {
      return errorResponse("A product in your cart is no longer available in the catalog. Please review your cart.", 409);
    }
    if (product.stock_status === "Sold Out") {
      return errorResponse("A product in your cart is now sold out. Please review your cart.", 409);
    }
    if (typeof product.sku !== "string" || !product.sku.trim()) {
      return errorResponse("A product in your cart does not have a verified SKU yet. The test order was not sent.", 409);
    }

    const unitPrice = Number(product.price_php);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return errorResponse("A product in your cart has an invalid catalog price. The test order was not sent.", 409);
    }

    canonicalItems.push({
      productId: product.id,
      sku: product.sku.trim(),
      quantity: requestedItem.quantity,
      unitPrice,
    });
  }

  const totalAmount = Math.round(
    canonicalItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) * 100
  ) / 100;
  const webhookUrl = process.env.SALES_V1_WEBHOOK_URL?.trim();

  if (!webhookUrl) {
    return errorResponse("Demo checkout is not configured yet. Add the SALES_V1 webhook URL and try again.", 503);
  }

  let webhookResponse: Response;
  try {
    webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_number: orderNumber,
        customer,
        total_amount: totalAmount,
        shipping_address: customer.address,
        notes: "",
        items: canonicalItems.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        })),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    console.error("SALES_V1 webhook request failed:", error instanceof Error ? error.message : error);
    return errorResponse("SALES_V1 could not be reached. Your cart was kept; please try again.", 502);
  }

  let result: SalesV1Response = {};
  try {
    result = (await webhookResponse.json()) as SalesV1Response;
  } catch {
    return errorResponse("SALES_V1 returned an unreadable response. Your cart was kept; please try again.", 502);
  }

  if (result.status === "duplicate") {
    return Response.json(
      {
        status: "duplicate",
        message: "This test order number was already recorded. Your cart has not been cleared.",
        orderNumber,
      },
      { status: 409 }
    );
  }

  if (!webhookResponse.ok || result.status === "error") {
    const upstreamDetails = typeof result.details === "string" ? result.details : undefined;
    return errorResponse("SALES_V1 rejected the test order. Your cart was kept; please check the form and retry.", 502, upstreamDetails);
  }

  if (result.status === "needs_review") {
    return Response.json(
      {
        status: "needs_review",
        message: "The order was received but one or more SKUs need review. Your cart has not been cleared.",
        orderNumber,
      },
      { status: 202 }
    );
  }

  const unmatchedSkus = Array.isArray(result.unmatched_skus) ? result.unmatched_skus : [];
  if (!result.sales_order_id || unmatchedSkus.length > 0) {
    return errorResponse("SALES_V1 did not confirm every order item. Your cart was kept for safety.", 502);
  }

  return Response.json({
    status: "ok",
    orderNumber,
    salesOrderId: result.sales_order_id,
    totalAmount,
  });
}
