/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable React strict mode for better performance
  reactStrictMode: true,
  // Optimize production builds
  swcMinify: true,
  // Compress responses
  compress: true,
  // Optimize fonts
  optimizeFonts: true,
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
}

export default nextConfig
