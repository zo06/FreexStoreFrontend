import { MetadataRoute } from 'next'

// Use centralized configuration
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://freex.site'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/scripts`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/custom-request`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ]

  try {
    // Fetch dynamic content from API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
    
    // Fetch scripts
    const scriptsResponse = await fetch(`${apiUrl}/scripts`, {
      next: { revalidate: 3600 } // Revalidate every hour
    })
    const scriptsJson = await scriptsResponse.json()
    const scripts = Array.isArray(scriptsJson) ? scriptsJson : (scriptsJson?.data || [])
    
    // Fetch categories
    const categoriesResponse = await fetch(`${apiUrl}/categories/active`, {
      next: { revalidate: 3600 }
    })
    const categoriesJson = await categoriesResponse.json()
    const categories = Array.isArray(categoriesJson) ? categoriesJson : (categoriesJson?.data || [])
    
    // Generate script URLs - use slug if available for SEO-friendly URLs
  type ScriptItem = { id: string; slug?: string; updatedAt?: string; createdAt: string; popular?: boolean };
  const scriptUrls = scripts.map((script: ScriptItem) => ({
      url: `${baseUrl}/scripts/${script.slug || script.id}`,
      lastModified: new Date(script.updatedAt || script.createdAt),
      changeFrequency: 'weekly' as const,
      priority: script.popular ? 0.9 : 0.7,
    }))
    
    // Generate category URLs
  type CategoryItem = { id: string; updatedAt?: string; createdAt: string };
  const categoryUrls = categories.map((category: CategoryItem) => ({
      url: `${baseUrl}/categories/${category.id}`,
      lastModified: new Date(category.updatedAt || category.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
    
    return [...staticPages, ...scriptUrls, ...categoryUrls]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return static pages if API fails
    return staticPages
  }
}

