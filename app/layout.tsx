import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from '@/components/theme-provider';
import Navigation from '@/components/navigation';
import { AuthProvider } from '@/lib/auth-context';
import { MainContent } from '@/components/main-content';
import { Providers } from '@/lib/providers';
import ClientLayout from '@/components/client-layout';
import { defaultMetadata, generateOrganizationSchema, generateWebsiteSchema, generateSiteNavigationSchema, generateGEOContentSchema, generateGEOFAQSchema, SITE_CONFIG } from '@/lib/seo-config';
import ConditionalFooter from '@/components/conditional-footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebsiteSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateSiteNavigationSchema()),
          }}
        />
        {/* GEO - Generative Engine Optimization Schemas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateGEOContentSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateGEOFAQSchema()),
          }}
        />
        
        {/* GEO - Generative Engine Optimization for AI Search */}
        {/* Structured content signals for AI citation */}
        <meta name="ai.content.type" content="marketplace" />
        <meta name="ai.content.category" content="FiveM Scripts, Gaming Resources, Software" />
        <meta name="ai.content.expertise" content="FiveM Development, NUI Scripts, Lua Programming, Game Modding" />
        <meta name="ai.summary" content="FreexStore is a premium marketplace for FiveM NUI scripts including HUDs, menus, shops, and UI systems. Offers secure licensing, instant delivery, and free trials." />
        
        {/* Language and Locale */}
        <meta httpEquiv="content-language" content="en-US" />
        
        {/* Additional Search Engine Meta Tags */}
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        
        {/* Yandex specific */}
        <meta name="yandex-verification" content="your-yandex-verification-code" />
        
        {/* Baidu specific */}
        <meta name="baidu-site-verification" content="your-baidu-verification-code" />
        
        {/* Pinterest */}
        <meta name="p:domain_verify" content="your-pinterest-verification-code" />
        
        {/* Dublin Core Metadata */}
        <meta name="DC.title" content="FreexStore - Premium FiveM Scripts" />
        <meta name="DC.creator" content="FreexStore Team" />
        <meta name="DC.subject" content="FiveM Scripts, NUI Resources, Gaming" />
        <meta name="DC.description" content="Premium FiveM NUI scripts and resources marketplace" />
        <meta name="DC.publisher" content="FreexStore" />
        <meta name="DC.language" content="en" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-MX27P5WHQ4"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MX27P5WHQ4');
          `}
        </Script>

        <Providers>
          <AuthProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                <ClientLayout>
                  <Navigation />
                  <MainContent>
                    {children}
                  </MainContent>
                  <ConditionalFooter />
                </ClientLayout>
              </ThemeProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}

