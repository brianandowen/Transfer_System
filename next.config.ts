/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ 忽略 ESLint 錯誤
  },
  // ✅ 加入 middleware 路由匹配條件
  matcher: ['/admin/:path*'],
};

export default nextConfig;
