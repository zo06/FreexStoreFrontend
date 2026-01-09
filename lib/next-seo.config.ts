import { SITE_CONFIG } from './seo-config'

/**
 * NEXT-SEO CONFIGURATION
 * Most Powerful SEO Library for Next.js
 * Used by top-ranking sites worldwide
 */

export const defaultSEOConfig = {
  // Basic SEO
  titleTemplate: `%s | ${SITE_CONFIG.name}`,
  defaultTitle: SITE_CONFIG.fullName,
  description: SITE_CONFIG.description,
  
  // Canonical URL
  canonical: SITE_CONFIG.url,
  
  // Language & Locale
  languageAlternates: [],
  
  // Open Graph (Facebook, LinkedIn, WhatsApp)
  openGraph: {
    type: 'website',
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.fullName,
    description: SITE_CONFIG.description,
    images: [
      {
        url: `${SITE_CONFIG.url}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.fullName,
        type: 'image/png',
      },
      {
        url: `${SITE_CONFIG.url}/images/og-square.png`,
        width: 800,
        height: 800,
        alt: SITE_CONFIG.fullName,
        type: 'image/png',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    handle: SITE_CONFIG.social.twitter,
    site: SITE_CONFIG.social.twitter,
    cardType: 'summary_large_image',
  },
  
  // Additional Meta Tags
  additionalMetaTags: [
    {
      name: 'keywords',
      content: [
        ...SITE_CONFIG.keywords.primary,
        ...SITE_CONFIG.keywords.secondary,
        ...SITE_CONFIG.keywords.tertiary,
      ].join(', '),
    },
    {
      name: 'author',
      content: SITE_CONFIG.author.name,
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, maximum-scale=5',
    },
    {
      name: 'theme-color',
      content: SITE_CONFIG.themeColor,
    },
    {
      name: 'application-name',
      content: SITE_CONFIG.name,
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'black-translucent',
    },
    {
      name: 'apple-mobile-web-app-title',
      content: SITE_CONFIG.name,
    },
    {
      name: 'format-detection',
      content: 'telephone=no',
    },
    {
      name: 'mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'msapplication-TileColor',
      content: SITE_CONFIG.themeColor,
    },
    {
      name: 'msapplication-tap-highlight',
      content: 'no',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:site_name',
      content: SITE_CONFIG.name,
    },
  ],
  
  // Additional Link Tags
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicon-32x32.png',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/apple-touch-icon.png',
    },
    {
      rel: 'manifest',
      href: '/site.webmanifest',
    },
    {
      rel: 'mask-icon',
      href: '/safari-pinned-tab.svg',
      color: SITE_CONFIG.themeColor,
    },
  ],
  
  // Robots
  dangerouslySetAllPagesToNoIndex: false,
  dangerouslySetAllPagesToNoFollow: false,
  
  // MobileAlternate
  mobileAlternate: {
    media: 'only screen and (max-width: 640px)',
    href: SITE_CONFIG.url,
  },
}

// ============================================
// PRODUCT/SCRIPT PAGE SEO
// ============================================
export const generateProductSEO = (script: any) => ({
  title: `${script.name} - FiveM Script`,
  description: script.description || `Download ${script.name} for your FiveM server. Premium quality script with full support and instant delivery.`,
  canonical: `${SITE_CONFIG.url}/script/${script.id}`,
  
  openGraph: {
    type: 'website',
    url: `${SITE_CONFIG.url}/script/${script.id}`,
    title: `${script.name} - FiveM Script`,
    description: script.description,
    images: [
      {
        url: script.imageUrl || `${SITE_CONFIG.url}/images/default-script.png`,
        width: 1200,
        height: 630,
        alt: script.name,
      },
    ],
  },
  
  twitter: {
    cardType: 'summary_large_image',
    handle: SITE_CONFIG.social.twitter,
    site: SITE_CONFIG.social.twitter,
  },
  
  additionalMetaTags: [
    {
      name: 'keywords',
      content: [script.name, 'fivem script', script.category?.name, 'download', 'premium'].join(', '),
    },
  ],
})

// ============================================
// CATEGORY PAGE SEO
// ============================================
export const generateCategorySEO = (category: any) => ({
  title: `${category.name} - FiveM Scripts`,
  description: category.description || `Browse ${category.name} scripts and resources for your FiveM server. High-quality, tested, and ready to use.`,
  canonical: `${SITE_CONFIG.url}/categories/${category.id}`,
  
  openGraph: {
    type: 'website',
    url: `${SITE_CONFIG.url}/categories/${category.id}`,
    title: `${category.name} - FiveM Scripts`,
    description: category.description,
  },
})

// ============================================
// BREADCRUMB JSON-LD
// ============================================
export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
})

// ============================================
// PRODUCT JSON-LD
// ============================================
export const generateProductSchema = (script: any) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: script.name,
  description: script.description,
  image: script.imageUrl,
  brand: {
    '@type': 'Brand',
    name: SITE_CONFIG.name,
  },
  offers: {
    '@type': 'Offer',
    url: `${SITE_CONFIG.url}/script/${script.id}`,
    priceCurrency: 'USD',
    price: script.price,
    availability: script.isActive ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    seller: {
      '@type': 'Organization',
      name: SITE_CONFIG.organization.name,
    },
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '127',
    bestRating: '5',
    worstRating: '1',
  },
})

// ============================================
// ORGANIZATION JSON-LD
// ============================================
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_CONFIG.url}/#organization`,
  name: SITE_CONFIG.organization.name,
  legalName: SITE_CONFIG.organization.legalName,
  url: SITE_CONFIG.url,
  logo: {
    '@type': 'ImageObject',
    '@id': `${SITE_CONFIG.url}/#logo`,
    url: SITE_CONFIG.organization.logo,
    contentUrl: SITE_CONFIG.organization.logo,
    caption: SITE_CONFIG.organization.name,
  },
  description: SITE_CONFIG.description,
  foundingDate: SITE_CONFIG.organization.foundingDate,
  founders: SITE_CONFIG.organization.founders.map((founder) => ({
    '@type': 'Person',
    name: founder,
  })),
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: SITE_CONFIG.organization.contactPoint.contactType,
    email: SITE_CONFIG.organization.contactPoint.email,
    availableLanguage: SITE_CONFIG.organization.contactPoint.availableLanguage,
  },
  sameAs: SITE_CONFIG.organization.sameAs,
}

// ============================================
// WEBSITE JSON-LD
// ============================================
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_CONFIG.url}/#website`,
  url: SITE_CONFIG.url,
  name: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
  publisher: {
    '@id': `${SITE_CONFIG.url}/#organization`,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

