import { MetadataRoute } from 'next'

// Use centralized configuration
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/profile/',
          '/api/',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/dashboard/', '/profile/', '/api/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/admin/', '/dashboard/', '/profile/', '/api/'],
      },
      {
        userAgent: 'Yandex',
        allow: '/',
        disallow: ['/admin/', '/dashboard/', '/profile/', '/api/'],
      },
      {
        userAgent: 'Baiduspider',
        allow: '/',
        disallow: ['/admin/', '/dashboard/', '/profile/', '/api/'],
      },
      {
        userAgent: 'DuckDuckBot',
        allow: '/',
        disallow: ['/admin/', '/dashboard/', '/profile/', '/api/'],
      },
      {
        userAgent: 'Slurp',
        allow: '/',
        disallow: ['/admin/', '/dashboard/', '/profile/', '/api/'],
      },
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
      },
      {
        userAgent: 'Twitterbot',
        allow: '/',
      },
      {
        userAgent: 'LinkedInBot',
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}

