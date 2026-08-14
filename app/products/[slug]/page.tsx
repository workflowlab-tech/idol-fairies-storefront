import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products/queries";
import { getProductGalleryImages } from "@/lib/products/images";
import { formatPHP, formatReleaseDate } from "@/lib/products/format";
import { StockBadge, Badge } from "@/components/ui/Badge";
import ProductGallery from "@/components/products/ProductGallery";
import AddToCartPanel from "@/components/products/AddToCartPanel";
import AskIdolAiButton from "@/components/products/AskIdolAiButton";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return { title: `${product.artist} — ${product.productName}` };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const images = await getProductGalleryImages(product);
  const onSale = product.originalPricePHP !== null && product.originalPricePHP > product.pricePHP;
  const releaseDate = formatReleaseDate(product.releaseDate);
  const productContext = `${product.artist} — ${product.productName}${product.version ? ` (${product.version})` : ""}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery images={images} alt={productContext} />

        <div className="flex flex-col gap-4">
          <div>
            <span className="text-sm font-semibold text-fairy-blue-600">{product.artist}</span>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-fairy-ink sm:text-3xl">{product.productName}</h1>
            {product.version && <p className="mt-1 text-sm text-fairy-ink/60">{product.version}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StockBadge status={product.stockStatus} />
            {product.newRelease && <Badge variant="new">New Release</Badge>}
            {onSale && <Badge variant="sale">On Sale</Badge>}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-fairy-ink">{formatPHP(product.pricePHP)}</span>
            {onSale && <span className="text-lg text-fairy-ink/40 line-through">{formatPHP(product.originalPricePHP!)}</span>}
          </div>

          <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-fairy-pink-100 bg-fairy-pink-50/40 p-4 text-sm">
            <div>
              <dt className="text-fairy-ink/50">Category</dt>
              <dd className="font-semibold text-fairy-ink">{product.category}</dd>
            </div>
            {releaseDate && (
              <div>
                <dt className="text-fairy-ink/50">Release date</dt>
                <dd className="font-semibold text-fairy-ink">{releaseDate}</dd>
              </div>
            )}
            <div>
              <dt className="text-fairy-ink/50">Availability</dt>
              <dd className="font-semibold text-fairy-ink">{product.stockStatus}</dd>
            </div>
            {product.dispatchNote && (
              <div className="col-span-2">
                <dt className="text-fairy-ink/50">Dispatch note</dt>
                <dd className="font-medium text-fairy-ink/80">{product.dispatchNote}</dd>
              </div>
            )}
          </dl>

          {product.shortDescription && <p className="text-sm leading-relaxed text-fairy-ink/70">{product.shortDescription}</p>}

          <div className="mt-2 flex flex-col gap-2">
            <AddToCartPanel product={product} />
            <AskIdolAiButton productContext={productContext} />
          </div>

          {!product.imageUrl && (
            <p className="text-xs text-fairy-ink/40">
              Gallery images are branded placeholders — no verified real photo was available from the source listing
              for this product yet. We never invent a source photo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
