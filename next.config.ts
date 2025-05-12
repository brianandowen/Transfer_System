/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true
  },
  eslint: {
    ignoreDuringBuilds: true // 🟢 忽略 ESLint 錯誤
  }
};

export default nextConfig;
