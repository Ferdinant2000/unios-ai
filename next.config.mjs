/** @type {import('next').NextConfig} */

// Static export for Firebase Hosting Classic (Spark plan, no SSR):
//   - `npm run build` locally / Firebase CI → static `out/`
// On Vercel (VERCEL=1 is injected during builds) we keep a real server so that
//   - /api/ask-lecture becomes a serverless function (ƒ Dynamic)
//   - dynamic routes fall back to on-demand SSR instead of 404
const nextConfig = {
  images: {
    unoptimized: true,
  },
};

export default nextConfig;