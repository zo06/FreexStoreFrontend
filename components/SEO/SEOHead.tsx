'use client'

import Head from 'next/head'
import { usePathname } from 'next/navigation'
import { SITE_CONFIG } from '@/lib/seo-config'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  type?: 'website' | 'article' | 'product'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
  price?: number
  currency?: string
  availability?: 'instock' | 'outofstock' | 'preorder'
  noindex?: boolean
  canonical?: string
}

// Use SITE_CONFIG as the single source of truth
const defaultSEO = {
  siteName: SITE_CONFIG.name,
  defaultTitle: SITE_CONFIG.fullName,
  defaultDescription: SITE_CONFIG.description,
  defaultImage: `${SITE_CONFIG.url}/images/og-image.png`,
  defaultKeywords: [
    ...SITE_CONFIG.keywords.primary,
    ...SITE_CONFIG.keywords.secondary
  ],
  siteUrl: SITE_CONFIG.url,
  twitterHandle: SITE_CONFIG.social.twitter,
  locale: SITE_CONFIG.locale,
  ogType: 'website',
  organization: SITE_CONFIG.organization
}

export default function SEOHead({
  title,
  description,
  keywords = [],
  image,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  price,
  currency = 'USD',
  availability,
  noindex = false,
  canonical
}: SEOProps) {
  const pathname = usePathname()
  
  const seoTitle = title 
    ? `${title} | ${defaultSEO.siteName}` 
    : defaultSEO.defaultTitle
  
  const seoDescription = description || defaultSEO.defaultDescription
  const seoImage = image || defaultSEO.defaultImage
  const seoKeywords = [...defaultSEO.defaultKeywords, ...keywords].join(', ')
  const seoUrl = `${defaultSEO.siteUrl}${pathname}`
  const canonicalUrl = canonical || seoUrl

  // Structured Data - Organization
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: defaultSEO.siteName,
    url: defaultSEO.siteUrl,
    logo: `${defaultSEO.siteUrl}/images/logo.png`,
    description: defaultSEO.defaultDescription,
    sameAs: [
      'https://discord.gg/aTEmKr4K7k',
      'https://twitter.com/freexstore',
      'https://github.com/freexstore'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      availableLanguage: ['English', 'Arabic']
    }
  }

  // Structured Data - WebSite
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: defaultSEO.siteName,
    url: defaultSEO.siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${defaultSEO.siteUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }

  // Structured Data - Product (if applicable)
  const productSchema = type === 'product' && price ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description: seoDescription,
    image: seoImage,
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: currency,
      availability: availability === 'instock' 
        ? 'https://schema.org/InStock' 
        : availability === 'outofstock'
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/PreOrder',
      url: seoUrl
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127'
    }
  } : null

  // Structured Data - Article (if applicable)
  const articleSchema = type === 'article' ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: seoDescription,
    image: seoImage,
    author: {
      '@type': 'Person',
      name: author || defaultSEO.siteName
    },
    publisher: {
      '@type': 'Organization',
      name: defaultSEO.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${defaultSEO.siteUrl}/images/logo.png`
      }
    },
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': seoUrl
    }
  } : null

  // Breadcrumb Schema
  const pathSegments = pathname.split('/').filter(Boolean)
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: defaultSEO.siteUrl
      },
      ...pathSegments.map((segment, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: segment.charAt(0).toUpperCase() + segment.slice(1),
        item: `${defaultSEO.siteUrl}/${pathSegments.slice(0, index + 1).join('/')}`
      }))
    ]
  }

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="author" content={author || defaultSEO.siteName} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Viewport */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={defaultSEO.siteName} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:locale" content={defaultSEO.locale} />
      
      {/* Article Meta Tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={defaultSEO.twitterHandle} />
      <meta name="twitter:creator" content={defaultSEO.twitterHandle} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      
      {/* Additional Meta Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#8B5CF6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Favicon */}
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}
    </Head>
  )
}

