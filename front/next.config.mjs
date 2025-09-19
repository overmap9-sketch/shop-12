import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const target = process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:4000';
    return [{ source: '/api/:path*', destination: `${target}/api/:path*` }];
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
