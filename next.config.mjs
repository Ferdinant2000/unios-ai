/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Firebase Hosting Classic (Spark plan, no SSR)
  output: "export",
  // Required for correct routing on Firebase CDN
  trailingSlash: true,
  // Next.js Image Optimization is not available in static export mode
  images: {
    unoptimized: true,
  },
};

export default nextConfig;