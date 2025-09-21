import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const target = process.env.NEXT_PUBLIC_API_ORIGIN;
    if (!target || target === 'internal' || target === 'self') {
      return [];
    }
    return [
      { source: '/api/:path*', destination: `${target}/api/:path*` },
      { source: '/uploads/:path*', destination: `${target}/uploads/:path*` },
    ];
  },
  experimental: {
    allowedDevOrigins: (process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGINS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
  },
  webpack: (config) => {
    // Align with tsconfig paths: "@/*" -> repo root
    config.resolve.alias['@'] = path.resolve(__dirname, '..');
    // Shim react-router-dom to Next navigation for migration
    config.resolve.alias['react-router-dom'] = path.resolve(__dirname, 'src/shared/lib/router-shim.tsx');
    return config;
  },
};

export default nextConfig;
