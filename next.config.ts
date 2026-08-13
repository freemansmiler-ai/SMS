import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove console.log calls in production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  // Image optimisation — allow Supabase storage and common avatar CDNs
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
    // Slightly longer cache for profile photos and school logos
    minimumCacheTTL: 3600,
  },

  // Reduce the number of JS chunks the browser has to download
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-dropdown-menu", "@radix-ui/react-dialog"],
  },

  async redirects() {
    return [
      {
        source: "/administrator",
        destination: "/admin",
        permanent: true,
      },
      {
        source: "/administrator/:path*",
        destination: "/admin/:path*",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
      // Long-lived cache for static assets — Next.js already hashes the filenames
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
