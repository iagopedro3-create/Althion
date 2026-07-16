import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  poweredByHeader: false,
  turbopack: {
    root: path.resolve(process.cwd(), '../..'),
  },
  transpilePackages: ['@althion/contracts'],
};

export default nextConfig;
