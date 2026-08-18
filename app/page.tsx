import Hero from "@/components/home/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import ProductSlideshow from "@/components/home/ProductSlideshow";
import WhyShop from "@/components/home/WhyShop";
import FaqPreview from "@/components/home/FaqPreview";
import WholesaleSection from "@/components/home/WholesaleSection";
import { getHeroCarouselProducts, getNewReleases, getFeaturedProducts, getBestsellers } from "@/lib/products/queries";

export default async function HomePage() {
  const [heroProducts, newReleases, featured, bestsellers] = await Promise.all([
    getHeroCarouselProducts(8),
    getNewReleases(12),
    getFeaturedProducts(12),
    getBestsellers(12),
  ]);

  return (
    <>
      <Hero products={heroProducts} />
      <CategoryGrid />
      <ProductSlideshow
        title="New Releases"
        subtitle="Freshly added to the catalog"
        viewAllHref="/new-releases"
        products={newReleases}
      />
      <ProductSlideshow
        title="Featured Products"
        subtitle="A pick of what's available right now"
        viewAllHref="/shop"
        products={featured}
      />
      {/* Bestsellers only renders when the catalog actually flags items that way —
          no products currently have bestseller=true, so it's silently skipped
          rather than showing fabricated picks. */}
      <ProductSlideshow title="Bestsellers" viewAllHref="/shop" products={bestsellers} />
      <WhyShop />
      <FaqPreview />
      <WholesaleSection />
    </>
  );
}
