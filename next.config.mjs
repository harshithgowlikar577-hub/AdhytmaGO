/** @type {import('next').NextConfig} */
const isStaticExport = !!process.env.NEXT_PUBLIC_BASE_PATH;

const nextConfig = {
  ...(isStaticExport ? { output: 'export' } : {}),
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
