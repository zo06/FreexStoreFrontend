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
    images: [
      {
        url: SITE_CONFIG.defaultBanner,
        width: 1200,
        height: 630,
        alt: 'FreexStore - Custom Script Development | FiveM Resources',
      },
    ],
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.customRequest.title,
    description: pageMetadata.customRequest.description,
    images: [SITE_CONFIG.defaultBanner],
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

