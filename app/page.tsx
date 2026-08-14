import Hero from "@/components/home/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import ProductSlideshow from "@/components/home/ProductSlideshow";
import WhyShop from "@/components/home/WhyShop";
import FaqPreview from "@/components/home/FaqPreview";
import { getNewReleases, getFeaturedProducts, getBestsellers, getPreorders } from "@/lib/products/queries";

export default async function HomePage() {
  const [newReleases, featured, bestsellers, preorders] = await Promise.all([
    getNewReleases(12),
    getFeaturedProducts(12),
    getBestsellers(12),
    getPreorders(12),
  ]);

  return (
    <>
      <Hero />
      <CategoryGrid />
      <ProductSlideshow
        title="New Releases"
        subtitle="Freshly added to the catalog"
        viewAllHref="/new-releases"
        products={newReleases}
      />
      {/* Featured/Bestsellers only render when the catalog actually flags items that way —
          no products currently have featured=true or bestseller=true, so these are silently
          skipped rather than showing fabricated picks. */}
      <ProductSlideshow title="Featured Picks" viewAllHref="/shop" products={featured} />
      <ProductSlideshow
        title="Preorder Spotlight"
        subtitle="Reserve these before they arrive"
        viewAllHref="/preorders"
        products={preorders}
      />
      <ProductSlideshow title="Bestsellers" viewAllHref="/shop" products={bestsellers} />
      <WhyShop />
      <FaqPreview />
    </>
  );
}
