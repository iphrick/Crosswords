/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Permite que o firebase-admin rode somente no servidor
  serverExternalPackages: ['firebase-admin', '@google/generative-ai'],
  images: {
    domains: ['minotar.net'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
