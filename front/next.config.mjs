import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow Builder preview to access dev overlay resources
  experimental: {
    allowedDevOrigins: ['https://*.projects.builder.codes', 'https://*.fly.dev'],
  },
  webpack: (config) => {
    // Align with tsconfig paths: "@/*" -> repo root
    config.resolve.alias['@'] = path.resolve(__dirname, '..');
    return config;
  },
};

export default nextConfig;
