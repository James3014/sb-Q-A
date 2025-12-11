import { MetadataRoute } from 'next'
import { getLessons } from '@/lib/lessons'

const BASE_URL = 'https://www.snowskill.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // 取得所有課程用於動態 URLs
    const lessons = await getLessons()

    // 靜態頁面
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/login`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/pricing`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/feedback`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${BASE_URL}/favorites`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/practice`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
    ]

    // 動態課程頁面
    const lessonPages: MetadataRoute.Sitemap = lessons
      .filter((lesson) => !lesson.is_premium) // 只包含免費課程在公開 sitemap
      .map((lesson) => ({
        url: `${BASE_URL}/lesson/${lesson.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))

    return [...staticPages, ...lessonPages]
  } catch (error) {
    console.error('[sitemap] Error generating sitemap:', error)
    // 降級處理：只返回靜態頁面
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/pricing`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
      },
    ]
  }
}
