import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Real product photos live in Supabase Storage (bucket `product-images`,
    // populated by scripts/populate-real-images.ts) — this is the only
    // remote image host the app ever renders.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "igsavpvqpxgcnntciudo.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
