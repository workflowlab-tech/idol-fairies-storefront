import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type WholesaleInquiryRequest = {
  name?: unknown;
  businessName?: unknown;
  email?: unknown;
  phone?: unknown;
  productsInterested?: unknown;
  estimatedQuantity?: unknown;
  message?: unknown;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function errorResponse(message: string, status: number) {
  return Response.json({ status: "error", message }, { status });
}

/**
 * Inquiry only. This never touches sales_orders, customer_invoices,
 * accounts_receivable, or inventory_movements -- it only writes to the
 * standalone wholesale_inquiries table (sql/012_wholesale_inquiries.sql).
 * A real wholesale order is a separate, deliberate step the owner takes
 * later (via 02_SALES_WHOLESALE_AR_V1) once terms are agreed -- not
 * something this form can trigger.
 */
export async function POST(request: Request) {
  let body: WholesaleInquiryRequest;

  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return errorResponse("The inquiry request must be a JSON object.", 400);
    }
    body = parsed as WholesaleInquiryRequest;
  } catch {
    return errorResponse("The inquiry request was not valid JSON.", 400);
  }

  const name = text(body.name, 120);
  const businessName = text(body.businessName, 160);
  const email = text(body.email, 160).toLowerCase();
  const phone = text(body.phone, 40);
  const productsInterested = text(body.productsInterested, 500);
  const estimatedQuantity = text(body.estimatedQuantity, 100);
  const message = text(body.message, 2000);

  const errors: string[] = [];
  if (!name) errors.push("Name is required.");
  if (!businessName) errors.push("Business / Shop / Group name is required.");
  if (!email || !EMAIL_PATTERN.test(email)) errors.push("A valid email is required.");
  if (!productsInterested) errors.push("Please note which products you're interested in.");
  if (!estimatedQuantity) errors.push("Please provide an estimated quantity.");

  if (errors.length > 0) {
    return Response.json({ status: "error", message: "Please correct the form and try again.", errors }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("wholesale_inquiries").insert({
    name,
    business_name: businessName,
    email,
    phone: phone || null,
    products_interested: productsInterested,
    estimated_quantity: estimatedQuantity,
    message: message || null,
  });

  if (error) {
    console.error("Wholesale inquiry insert failed:", error.message);
    return errorResponse("We couldn't submit your inquiry right now. Please try again shortly.", 502);
  }

  return Response.json({ status: "ok" });
}
