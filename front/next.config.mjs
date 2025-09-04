import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Align with tsconfig paths: "@/*" -> repo root
    config.resolve.alias['@'] = path.resolve(__dirname, '..');
    // Shim react-router-dom to Next navigation for migration
    config.resolve.alias['react-router-dom'] = path.resolve(__dirname, 'src/shared/lib/router-shim.tsx');
    return config;
  },
};

export default nextConfig;
