import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',

  // 移除 X-Powered-By header（隱藏技術棧）
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nbstwggxfwvfruwgfcqd.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Security Headers
  async headers() {
    return [
      {
        // 應用於所有路由
        source: '/:path*',
        headers: [
          // HSTS: 強制 HTTPS（1 年）
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // 防止 Clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // 防止 MIME 類型嗅探
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // XSS 保護（舊瀏覽器）
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer 政策
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // 權限政策
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // CSP: 內容安全政策
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://nbstwggxfwvfruwgfcqd.supabase.co",
              "connect-src 'self' https://nbstwggxfwvfruwgfcqd.supabase.co https://challenges.cloudflare.com",
              "frame-src 'self' https://challenges.cloudflare.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
