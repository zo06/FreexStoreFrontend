import Head from 'next/head'

interface SEOHeadProps {
  title: string
  description: string
  keywords?: string[]
  ogImage?: string
  ogType?: 'website' | 'article' | 'product'
  canonical?: string
  noindex?: boolean
  nofollow?: boolean
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  author?: string
  publishedTime?: string
  modifiedTime?: string
}

export function SEOHead({
  title,
  description,
  keywords = [],
  ogImage,
  ogType = 'website',
  canonical,
  noindex = false,
  nofollow = false,
  twitterCard = 'summary_large_image',
  author,
  publishedTime,
  modifiedTime,
}: SEOHeadProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://freexstores.com'
  const defaultImage = `${siteUrl}/images/og-default.png`
  const imageUrl = ogImage || defaultImage
  const canonicalUrl = canonical || siteUrl

  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
  ].join(', ')

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      {author && <meta name="author" content={author} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="FreexStore" />
      <meta property="og:locale" content="en_US" />
      
      {/* Article specific tags */}
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content="@FreexStore" />
      <meta name="twitter:creator" content="@FreexStore" />

      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#0ea5e9" />
      <meta name="msapplication-TileColor" content="#0ea5e9" />
      
      {/* Viewport and Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    </Head>
  )
}
