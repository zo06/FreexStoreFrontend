import { Metadata } from 'next'

// ============================================
// SITE CONFIGURATION - ORIGINAL SOURCE
// ============================================
export const SITE_CONFIG = {
  name: 'FreexStore',
  fullName: 'FreexStore - Premium FiveM Scripts & Resources',
  description: 'Premium FiveM scripts, resources, and tools. Best quality scripts for your FiveM server with instant delivery and lifetime support.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://freexstores.com',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  locale: 'en_US',
  defaultLocale: 'en',
  locales: ['en', 'ar'],
  author: {
    name: 'FreexStore Team',
    url: 'https://freexstores.com',
    email: 'freexstores@gmail.com'
  },
  organization: {
    name: 'FreexStore',
    legalName: 'FreexStore LLC',
    url: 'https://freexstores.com',
    logo: 'https://freexstores.com/FreexLogo.png',
    foundingDate: '2025',
    founders: ['FreexStore Team'],
    address: {
      streetAddress: '',
      addressLocality: '',
      addressRegion: '',
      postalCode: '',
      addressCountry: 'US'
    },
    contactPoint: {
      telephone: '',
      contactType: 'Customer Support',
      email: 'freexstores@gmail.com',
      availableLanguage: ['English', 'Arabic']
    },
    sameAs: [
      'https://discord.gg/aTEmKr4K7k',
      'https://twitter.com/freexstore',
      'https://github.com/freexstore'
    ]
  },
  social: {
    twitter: '@freexstore',
    discord: 'https://discord.gg/aTEmKr4K7k',
    github: 'https://github.com/freexstore'
  },
  keywords: {
    primary: [
      'fivem scripts',
      'fivem resources',
      'fivem store',
      'fivem scripts download',
      'premium fivem scripts'
    ],
    secondary: [
      'fivem server resources',
      'fivem mods',
      'gta v scripts',
      'roleplay scripts',
      'fivem esx scripts',
      'fivem qbcore scripts'
    ],
    tertiary: [
      'fivem shop',
      'fivem marketplace',
      'fivem addons',
      'fivem lua scripts',
      'fivem script store'
    ]
  },
  themeColor: '#8B5CF6',
  backgroundColor: '#1F2937'
}

// ============================================
// DEFAULT METADATA - FULL SEO COMPLIANCE
// ============================================
export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.fullName,
    template: `%s | ${SITE_CONFIG.name}`
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  keywords: [
    ...SITE_CONFIG.keywords.primary,
    ...SITE_CONFIG.keywords.secondary,
    ...SITE_CONFIG.keywords.tertiary
  ],
  authors: [
    { 
      name: SITE_CONFIG.author.name,
      url: SITE_CONFIG.author.url
    }
  ],
  creator: SITE_CONFIG.organization.name,
  publisher: SITE_CONFIG.organization.legalName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
        alt: `${SITE_CONFIG.name} - Premium FiveM Scripts`,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: SITE_CONFIG.social.twitter,
    creator: SITE_CONFIG.social.twitter,
    title: SITE_CONFIG.fullName,
    description: SITE_CONFIG.description,
    images: {
      url: `${SITE_CONFIG.url}/images/twitter-image.png`,
      alt: SITE_CONFIG.fullName,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
      },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://freex.site',
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification
    yandex: 'your-yandex-verification-code', // Add your Yandex verification
    other: {
      'msvalidate.01': 'your-bing-verification-code', // Add your Bing verification
    },
  },
  category: 'technology',
  classification: 'FiveM Scripts and Resources Marketplace',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'FreexStore',
    'application-name': 'FreexStore',
    'msapplication-TileColor': '#8B5CF6',
    'theme-color': '#8B5CF6',
  },
}

// Generate metadata for script pages
export function generateScriptMetadata(script: any): Metadata {
  const scriptUrl = script.slug || script.id
  return {
    title: `${script.name} - FiveM Script | Download Now`,
    description: script.description || `Download ${script.name} for your FiveM server. ${script.features || 'Premium quality script with full support.'}`,
    keywords: [
      script.name,
      'fivem script',
      script.category?.name || 'fivem resource',
      'download',
      'premium',
      'fivem',
      'gta v'
    ],
    openGraph: {
      title: `${script.name} - Premium FiveM Script`,
      description: script.description,
      type: 'website',
      url: `${SITE_CONFIG.url}/scripts/${scriptUrl}`,
      images: [
        {
          url: script.imageUrl || `${SITE_CONFIG.url}/images/default-script.png`,
          width: 1200,
          height: 630,
          alt: `${script.name} - FiveM Script Preview`,
        },
      ],
      siteName: SITE_CONFIG.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${script.name} - FiveM Script`,
      description: script.description,
      images: [script.imageUrl || `${SITE_CONFIG.url}/images/default-script.png`],
    },
    alternates: {
      canonical: `${SITE_CONFIG.url}/scripts/${scriptUrl}`,
    },
  }
}

// Generate metadata for category pages
export function generateCategoryMetadata(category: any): Metadata {
  return {
    title: `${category.name} - FiveM Scripts`,
    description: category.description || `Browse ${category.name} scripts and resources for your FiveM server. High-quality, tested, and ready to use.`,
    keywords: [
      category.name,
      'fivem scripts',
      'fivem resources',
      'category',
      'download'
    ],
    openGraph: {
      title: `${category.name} - FiveM Scripts`,
      description: category.description || `Browse ${category.name} scripts for FiveM`,
      type: 'website',
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/categories/${category.id}`,
    },
  }
}

// ============================================
// JSON-LD STRUCTURED DATA GENERATORS
// ============================================

// Organization Schema
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.organization.name,
    legalName: SITE_CONFIG.organization.legalName,
    url: SITE_CONFIG.url,
    logo: SITE_CONFIG.organization.logo,
    foundingDate: SITE_CONFIG.organization.foundingDate,
    founders: SITE_CONFIG.organization.founders.map(name => ({
      '@type': 'Person',
      name
    })),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: SITE_CONFIG.organization.contactPoint.contactType,
      email: SITE_CONFIG.organization.contactPoint.email,
      availableLanguage: SITE_CONFIG.organization.contactPoint.availableLanguage
    },
    sameAs: SITE_CONFIG.organization.sameAs
  }
}

// Website Schema with enhanced sitelinks support
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_CONFIG.url}/#website`,
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    inLanguage: ['en', 'ar'],
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_CONFIG.url}/#organization`,
      name: SITE_CONFIG.organization.name,
      logo: {
        '@type': 'ImageObject',
        url: SITE_CONFIG.organization.logo
      }
    },
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_CONFIG.url}/scripts?search={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    ]
  }
}

// SiteNavigationElement Schema for Sitelinks
export function generateSiteNavigationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    '@id': `${SITE_CONFIG.url}/#navigation`,
    name: 'Main Navigation',
    hasPart: [
      {
        '@type': 'SiteNavigationElement',
        name: 'Scripts',
        description: 'Browse all premium FiveM scripts and NUI resources',
        url: `${SITE_CONFIG.url}/scripts`
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Login',
        description: 'Sign in to your FreexStore account',
        url: `${SITE_CONFIG.url}/auth/login`
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Register',
        description: 'Create a new FreexStore account',
        url: `${SITE_CONFIG.url}/auth/register`
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Dashboard',
        description: 'Access your purchased scripts and licenses',
        url: `${SITE_CONFIG.url}/dashboard`
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Contact',
        description: 'Get in touch with FreexStore support',
        url: `${SITE_CONFIG.url}/contact`
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Custom Request',
        description: 'Request custom FiveM script development',
        url: `${SITE_CONFIG.url}/custom-request`
      }
    ]
  }
}

// WebPage Schema for individual pages
export function generateWebPageSchema(page: { title: string; description: string; url: string; breadcrumb?: { name: string; url: string }[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${page.url}/#webpage`,
    url: page.url,
    name: page.title,
    description: page.description,
    isPartOf: {
      '@id': `${SITE_CONFIG.url}/#website`
    },
    about: {
      '@id': `${SITE_CONFIG.url}/#organization`
    },
    inLanguage: 'en',
    breadcrumb: page.breadcrumb ? {
      '@type': 'BreadcrumbList',
      itemListElement: page.breadcrumb.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    } : undefined
  }
}

// Product Schema for Scripts
export function generateProductSchema(script: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: script.name,
    description: script.description,
    image: script.imageUrl || script.imageUrls?.[0] || `${SITE_CONFIG.url}/images/default-script.png`,
    brand: {
      '@type': 'Brand',
      name: SITE_CONFIG.name
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_CONFIG.url}/scripts/${script.id}`,
      priceCurrency: 'USD',
      price: script.price || script.foreverPrice || 0,
      availability: script.isActive ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: SITE_CONFIG.organization.name
      }
    },
    category: typeof script.category === 'string' ? script.category : script.category?.name || 'FiveM Script',
    aggregateRating: script.rating ? {
      '@type': 'AggregateRating',
      ratingValue: script.rating,
      reviewCount: script.reviewCount || 1
    } : undefined
  }
}

// SoftwareApplication Schema for Scripts
export function generateSoftwareSchema(script: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: script.name,
    description: script.description,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Windows',
    offers: {
      '@type': 'Offer',
      price: script.price || script.foreverPrice || 0,
      priceCurrency: 'USD'
    },
    softwareRequirements: 'FiveM Server',
    downloadUrl: `${SITE_CONFIG.url}/scripts/${script.id}`,
    screenshot: script.imageUrl || script.imageUrls?.[0],
    author: {
      '@type': 'Organization',
      name: SITE_CONFIG.organization.name
    }
  }
}

// BreadcrumbList Schema
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}

// FAQ Schema
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

// ItemList Schema for Script Collections
export function generateItemListSchema(scripts: any[], listName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: scripts.length,
    itemListElement: scripts.map((script, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: script.name,
        description: script.description,
        url: `${SITE_CONFIG.url}/scripts/${script.id}`,
        image: script.imageUrl || script.imageUrls?.[0]
      }
    }))
  }
}

// ============================================
// GEO - GENERATIVE ENGINE OPTIMIZATION
// For AI-powered search (ChatGPT, Perplexity, Google AI Overviews)
// ============================================

// Speakable Schema - Helps AI assistants identify content to read aloud
export function generateSpeakableSchema(page: { title: string; description: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: page.url,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['article', 'h1', 'h2', '.description', '.summary', '.faq-answer']
    }
  }
}

// HowTo Schema - For AI to understand processes
export function generateHowToSchema(title: string, steps: { name: string; text: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text
    }))
  }
}

// DefinedTerm Schema - For AI to understand terminology
export function generateDefinedTermSchema(terms: { term: string; definition: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'FiveM Development Terms',
    hasDefinedTerm: terms.map(t => ({
      '@type': 'DefinedTerm',
      name: t.term,
      description: t.definition
    }))
  }
}

// Main GEO Content Schema - Comprehensive AI-friendly content structure
export function generateGEOContentSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_CONFIG.url}/#website`,
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    
    // About section for AI understanding
    about: {
      '@type': 'Thing',
      name: 'FiveM Script Marketplace',
      description: 'FreexStore is a premium marketplace specializing in FiveM NUI (Native UI) scripts. We offer HUDs, menus, shops, scoreboards, and complete UI systems for FiveM roleplay servers. All scripts include secure IP-based licensing, instant digital delivery, and free trial options.',
      sameAs: [
        'https://en.wikipedia.org/wiki/FiveM',
        'https://fivem.net/'
      ]
    },
    
    // Main entity for citation
    mainEntity: {
      '@type': 'Organization',
      name: 'FreexStore',
      description: 'Premium FiveM NUI scripts marketplace with secure licensing and instant delivery',
      url: SITE_CONFIG.url,
      foundingDate: '2024',
      areaServed: 'Worldwide',
      serviceType: 'Digital Products Marketplace',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'FiveM Scripts Catalog',
        itemListElement: [
          { '@type': 'OfferCatalog', name: 'HUD Scripts', description: 'Player HUD interfaces for FiveM' },
          { '@type': 'OfferCatalog', name: 'Menu Scripts', description: 'Interactive menu systems' },
          { '@type': 'OfferCatalog', name: 'Shop Scripts', description: 'In-game shop and store interfaces' },
          { '@type': 'OfferCatalog', name: 'UI Systems', description: 'Complete UI frameworks for roleplay' }
        ]
      }
    },
    
    // Knowledge for AI
    knowsAbout: [
      'FiveM Development',
      'NUI (Native UI) Scripts',
      'Lua Programming',
      'JavaScript for FiveM',
      'QBCore Framework',
      'ESX Framework',
      'GTA V Modding',
      'Roleplay Server Development',
      'Game UI/UX Design',
      'License Key Systems'
    ]
  }
}

// Pre-defined FAQs for AI citation
export const geoFAQs = [
  {
    question: 'What is FreexStore?',
    answer: 'FreexStore is a premium marketplace for FiveM NUI scripts. We offer high-quality scripts including HUDs, menus, shops, scoreboards, and complete UI systems for FiveM roleplay servers. All scripts come with secure licensing, instant delivery, and regular updates.'
  },
  {
    question: 'What are FiveM NUI scripts?',
    answer: 'FiveM NUI (Native UI) scripts are custom user interface components for FiveM servers. They use HTML, CSS, and JavaScript to create modern, interactive interfaces like player HUDs, inventory systems, phone apps, and shop menus that enhance the roleplay experience.'
  },
  {
    question: 'How does FreexStore licensing work?',
    answer: 'FreexStore uses IP-based licensing to protect scripts. When you purchase a script, you receive a unique license key tied to your server IP address. This ensures only authorized servers can run the scripts while preventing unauthorized distribution.'
  },
  {
    question: 'Does FreexStore offer free trials?',
    answer: 'Yes, FreexStore offers 3-day free trials on select scripts. You can test scripts on your server before purchasing. No credit card is required to start a trial.'
  },
  {
    question: 'What frameworks are FreexStore scripts compatible with?',
    answer: 'FreexStore scripts are compatible with major FiveM frameworks including QBCore and ESX. Each script listing specifies framework compatibility. Many scripts are standalone and work with any framework.'
  },
  {
    question: 'How do I install FreexStore scripts?',
    answer: 'After purchase, download the script from your dashboard. Extract the files to your FiveM server resources folder, add the resource to your server.cfg, configure the license key in the config file, and restart your server.'
  }
]

// Generate FAQ Schema with GEO FAQs
export function generateGEOFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: geoFAQs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

// ============================================
// PAGE-SPECIFIC METADATA
// ============================================

export const pageMetadata = {
  home: {
    title: 'FreexStore - Premium FiveM Scripts & NUI Resources',
    description: 'Download premium FiveM NUI scripts: modern menus, HUDs, shops, scoreboards. Secure licensing, instant access, and regular updates for server owners and developers.',
    keywords: ['fivem scripts', 'fivem nui', 'fivem store', 'fivem hud', 'fivem menu', 'premium fivem scripts']
  },
  scripts: {
    title: 'Browse FiveM Scripts - Premium NUI Resources',
    description: 'Explore our collection of premium FiveM scripts. HUDs, menus, shops, and more. All scripts include secure licensing and instant delivery.',
    keywords: ['fivem scripts', 'fivem resources', 'nui scripts', 'fivem download', 'qbcore scripts', 'esx scripts']
  },
  contact: {
    title: 'Contact Us - FreexStore Support',
    description: 'Get in touch with FreexStore support team. We\'re here to help with your FiveM script questions and custom development requests.',
    keywords: ['fivem support', 'freexstore contact', 'fivem help', 'script support']
  },
  customRequest: {
    title: 'Custom Script Development - FreexStore',
    description: 'Request custom FiveM script development. Our team creates tailored NUI solutions for your unique server needs.',
    keywords: ['custom fivem scripts', 'fivem development', 'custom nui', 'fivem developer']
  },
  terms: {
    title: 'Terms of Service - FreexStore',
    description: 'Read our terms of service for using FreexStore and purchasing FiveM scripts.',
    keywords: ['terms of service', 'freexstore terms', 'fivem scripts terms']
  },
  privacy: {
    title: 'Privacy Policy - FreexStore',
    description: 'Learn how FreexStore protects your privacy and handles your data.',
    keywords: ['privacy policy', 'freexstore privacy', 'data protection']
  }
}

