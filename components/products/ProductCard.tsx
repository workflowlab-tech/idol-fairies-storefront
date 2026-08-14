import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";
import { formatPHP } from "@/lib/products/format";
import { getProductPrimaryImage } from "@/lib/products/images";
import { Badge, StockBadge } from "@/components/ui/Badge";

export default function ProductCard({ product }: { product: Product }) {
  const image = getProductPrimaryImage(product);
  const onSale = product.originalPricePHP !== null && product.originalPricePHP > product.pricePHP;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-fairy-pink-100 bg-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-fairy-pink-100"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-fairy-pink-50">
        <Image
          src={image}
          alt={`${product.artist} ${product.productName}`}
          fill
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 40vw, 90vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.stockStatus !== "In Stock" && <StockBadge status={product.stockStatus} />}
          {product.newRelease && <Badge variant="new">New</Badge>}
          {onSale && <Badge variant="sale">Sale</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-xs font-medium text-fairy-blue-600">{product.artist}</span>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-fairy-ink">{product.productName}</h3>
        {product.version && <span className="text-xs text-fairy-ink/50">{product.version}</span>}
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-sm font-bold text-fairy-ink">{formatPHP(product.pricePHP)}</span>
          {onSale && (
            <span className="text-xs text-fairy-ink/40 line-through">{formatPHP(product.originalPricePHP!)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
