import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "igsavpvqpxgcnntciudo.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "media.ktown4u.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;