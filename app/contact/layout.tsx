import { Metadata } from 'next'
import { pageMetadata, SITE_CONFIG } from '@/lib/seo-config'

export const metadata: Metadata = {
  title: pageMetadata.contact.title,
  description: pageMetadata.contact.description,
  keywords: pageMetadata.contact.keywords,
  openGraph: {
    title: pageMetadata.contact.title,
    description: pageMetadata.contact.description,
    url: `${SITE_CONFIG.url}/contact`,
    type: 'website',
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/contact`,
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

