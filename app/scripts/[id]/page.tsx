import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { generateScriptMetadata, generateProductSchema, generateSoftwareSchema, generateBreadcrumbSchema, SITE_CONFIG } from '@/lib/seo-config'
import ScriptDetailClient from './script-detail-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

interface Props {
  params: Promise<{ id: string }>
}

function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

async function getScript(idOrSlug: string) {
  try {
    // Try by slug first if not a UUID, otherwise by ID
    const endpoint = isUUID(idOrSlug) 
      ? `${API_URL}/scripts/${idOrSlug}`
      : `${API_URL}/scripts/by-slug/${idOrSlug}`
    
    const res = await fetch(endpoint, {
      next: { revalidate: 3600 }
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data || json
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const script = await getScript(id)
  
  if (!script) {
    return {
      title: 'Script Not Found',
      description: 'The requested script could not be found.'
    }
  }
  
  return generateScriptMetadata(script)
}

export default async function ScriptDetailPage({ params }: Props) {
  const { id } = await params
  const script = await getScript(id)
  
  if (!script) {
    notFound()
  }

  // Use slug for SEO-friendly URL if available
  const scriptUrl = script.slug || script.id
  const breadcrumbs = [
    { name: 'Home', url: SITE_CONFIG.url },
    { name: 'Scripts', url: `${SITE_CONFIG.url}/scripts` },
    { name: script.name, url: `${SITE_CONFIG.url}/scripts/${scriptUrl}` }
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateProductSchema(script)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateSoftwareSchema(script)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs)),
        }}
      />
      <ScriptDetailClient script={script} />
    </>
  )
}
