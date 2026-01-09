import { Metadata } from 'next'
import { pageMetadata, SITE_CONFIG, generateItemListSchema } from '@/lib/seo-config'

export const metadata: Metadata = {
  title: pageMetadata.scripts.title,
  description: pageMetadata.scripts.description,
  keywords: pageMetadata.scripts.keywords,
  openGraph: {
    title: pageMetadata.scripts.title,
    description: pageMetadata.scripts.description,
    url: `${SITE_CONFIG.url}/scripts`,
    type: 'website',
    images: [
      {
        url: SITE_CONFIG.defaultBanner,
        width: 1200,
        height: 630,
        alt: 'FreexStore - Premium FiveM Scripts & Resources',
      },
    ],
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.scripts.title,
    description: pageMetadata.scripts.description,
    images: [SITE_CONFIG.defaultBanner],
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/scripts`,
  },
}

export default function ScriptsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

