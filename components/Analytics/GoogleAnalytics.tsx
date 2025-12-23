'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'

// Track page views
export const pageview = (url: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// Track events
export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Track purchases
export const trackPurchase = (transactionId: string, value: number, items: unknown[]) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: 'USD',
      items: items
    })
  }
}

// Track script views
export const trackScriptView = (scriptId: string, scriptName: string, price: number) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'view_item', {
      currency: 'USD',
      value: price,
      items: [{
        item_id: scriptId,
        item_name: scriptName,
        price: price
      }]
    })
  }
}

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      pageview(pathname + searchParams.toString())
    }
  }, [pathname, searchParams])

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  )
}

// TypeScript declaration
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'set',
      targetId: string,
      config?: Record<string, unknown>
    ) => void
  }
}

