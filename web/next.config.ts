import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 優化輸出（standalone 模式適合容器部署）
  output: 'standalone',
};

export default nextConfig;
