/** @type {import('next').NextConfig} */

// Static export for Firebase Hosting Classic (Spark plan, no SSR):
//   - `npm run build` locally / Firebase CI → static `out/`
// On Vercel (VERCEL=1 is injected during builds) we keep a real server so that
//   - /api/ask-lecture becomes a serverless function (ƒ Dynamic)
//   - dynamic routes fall back to on-demand SSR instead of 404
const isStaticExport =
  process.env.NODE_ENV === "production" && process.env.VERCEL !== "1";

const nextConfig = {
  // Static export only for Firebase builds. In `next dev` the flag wrongly
  // breaks dynamic routes that DO export `generateStaticParams()` (dev-only
  // issue in Next.js 14), hence the NODE_ENV check as well.
  ...(isStaticExport ? { output: "export", trailingSlash: true } : {}),
  // Next.js Image Optimization is not available in static export mode
  images: {
    unoptimized: isStaticExport,
  },
};

export default nextConfig;