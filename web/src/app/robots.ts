import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api',
          '/mock-checkout',
          '/payment-success',
          '/payment-failure',
          '/*.json$',
          '/_next',
        ],
      },
    ],
    sitemap: 'https://www.snowskill.app/sitemap.xml',
  }
}
