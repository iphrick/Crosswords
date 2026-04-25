/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Permite que o firebase-admin rode somente no servidor
  serverExternalPackages: ['firebase-admin', '@google/generative-ai'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'minotar.net',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
