'use client'

interface ProductSchema {
  name: string
  description: string
  image: string
  price: number
  currency?: string
  brand?: string
  category?: string
  url: string
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
}

interface OrganizationSchema {
  name: string
  url: string
  logo: string
  description?: string
  contactEmail?: string
  sameAs?: string[]
}

interface BreadcrumbItem {
  name: string
  url: string
}

interface JsonLdProps {
  type: 'product' | 'organization' | 'website' | 'breadcrumb'
  data: ProductSchema | OrganizationSchema | BreadcrumbItem[] | any
}

export function JsonLd({ type, data }: JsonLdProps) {
  let schema: any = {}

  switch (type) {
    case 'product':
      const product = data as ProductSchema
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.image,
        brand: {
          '@type': 'Brand',
          name: product.brand || 'FreexStore',
        },
        offers: {
          '@type': 'Offer',
          url: product.url,
          priceCurrency: product.currency || 'USD',
          price: product.price,
          availability: `https://schema.org/${product.availability || 'InStock'}`,
          seller: {
            '@type': 'Organization',
            name: 'FreexStore',
          },
        },
        category: product.category || 'FiveM Script',
      }
      break

    case 'organization':
      const org = data as OrganizationSchema
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: org.name,
        url: org.url,
        logo: org.logo,
        description: org.description,
        contactPoint: org.contactEmail ? {
          '@type': 'ContactPoint',
          contactType: 'Customer Support',
          email: org.contactEmail,
        } : undefined,
        sameAs: org.sameAs || [],
      }
      break

    case 'website':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'FreexStore',
        url: data.url || 'https://freexstores.com',
        description: data.description || 'Premium FiveM NUI Scripts Marketplace',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${data.url || 'https://freexstores.com'}/scripts?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }
      break

    case 'breadcrumb':
      const items = data as BreadcrumbItem[]
      schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }
      break
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface SoftwareApplicationSchema {
  name: string
  description: string
  applicationCategory: string
  operatingSystem: string
  price: number
  currency?: string
  requirements?: string
}

export function SoftwareApplicationJsonLd({ name, description, applicationCategory, operatingSystem, price, currency = 'USD', requirements }: SoftwareApplicationSchema) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory,
    operatingSystem,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
    },
    softwareRequirements: requirements || 'FiveM Server',
    author: {
      '@type': 'Organization',
      name: 'FreexStore',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
