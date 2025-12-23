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

