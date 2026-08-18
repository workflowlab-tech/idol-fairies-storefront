-- =============================================================================
-- Idol Fairies — Wholesale & Bulk Order inquiries (V1)
-- Run once in the Supabase SQL Editor.
--
-- Public homepage inquiry form only. This table is intentionally NOT linked
-- to sales_orders, customer_invoices, accounts_receivable, or
-- inventory_movements -- submitting this form must never create a sale,
-- invoice, AR balance, or stock movement. It's a lead for the owner to
-- follow up on manually (e.g. via 02_SALES_WHOLESALE_AR_V1 once terms are
-- agreed), not an order.
-- =============================================================================

create table if not exists public.wholesale_inquiries (
    id                  bigint generated always as identity primary key,
    name                text not null,
    business_name       text not null,
    email               text not null,
    phone               text,
    products_interested text not null,
    estimated_quantity  text not null,
    message             text,
    status              text not null default 'new' check (status in ('new', 'contacted', 'closed')),
    created_at          timestamptz not null default now()
);

create index if not exists idx_wholesale_inquiries_created_at on public.wholesale_inquiries(created_at desc);

alter table public.wholesale_inquiries enable row level security;

-- No public read/update/delete policy -- only the service-role key (server-only,
-- used by the API route) can write or read these. The publishable/anon key
-- used by the browser has no access at all, matching the pattern already used
-- for the rest of this storefront's write paths.
