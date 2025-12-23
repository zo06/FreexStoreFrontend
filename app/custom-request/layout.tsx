import { Metadata } from 'next'
import { pageMetadata, SITE_CONFIG } from '@/lib/seo-config'

export const metadata: Metadata = {
  title: pageMetadata.customRequest.title,
  description: pageMetadata.customRequest.description,
  keywords: pageMetadata.customRequest.keywords,
  openGraph: {
    title: pageMetadata.customRequest.title,
    description: pageMetadata.customRequest.description,
    url: `${SITE_CONFIG.url}/custom-request`,
    type: 'website',
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/custom-request`,
  },
}

export default function CustomRequestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

