/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Firebase Hosting Classic (Spark plan, no SSR).
  // Enabled only for production builds (`next build`): in `next dev` the
  // `output: "export"` flag wrongly breaks dynamic routes that DO export
  // `generateStaticParams()` (Next.js 14 dev-only issue).
  ...(process.env.NODE_ENV === "production"
    ? { output: "export", trailingSlash: true }
    : {}),
  // Next.js Image Optimization is not available in static export mode
  images: {
    unoptimized: true,
  },
};

export default nextConfig;