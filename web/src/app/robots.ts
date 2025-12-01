import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // TODO: 正式網址確定後改為 allow
  return {
    rules: {
      userAgent: '*',
      disallow: '/', // 暫時擋爬蟲
    },
    // sitemap: 'https://your-domain.com/sitemap.xml', // 正式網址確定後啟用
  }
}
