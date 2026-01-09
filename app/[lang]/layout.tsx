import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "../globals.css";
import { ThemeProvider } from '@/components/theme-provider';
import ConditionalNavigation from '@/components/conditional-navigation';
import { AuthProvider } from '@/lib/auth-context';
import { MainContent } from '@/components/main-content';
import { Providers } from '@/lib/providers';
import ClientLayout from '@/components/client-layout';
import { defaultMetadata, generateOrganizationSchema, generateWebsiteSchema, generateSiteNavigationSchema, generateGEOContentSchema, generateGEOFAQSchema, SITE_CONFIG } from '@/lib/seo-config';
import ConditionalFooter from '@/components/conditional-footer';
import { LanguageProvider } from '@/lib/contexts/LanguageContext';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/request';
import { HtmlLangSetter } from '@/components/html-lang-setter';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = defaultMetadata;

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  
  if (!locales.includes(lang as any)) {
    notFound();
  }

  const messages = await getMessages();
  const direction = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={lang} dir={direction} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var LANG = "${lang}";
                var DIR = "${direction}";
                
                function setLangDir() {
                  document.documentElement.lang = LANG;
                  document.documentElement.dir = DIR;
                }
                
                // Set immediately
                setLangDir();
                
                // Set on DOMContentLoaded
                document.addEventListener('DOMContentLoaded', setLangDir);
                
                // Set on load
                window.addEventListener('load', setLangDir);
                
                // Set periodically for first few seconds to catch any late changes
                var count = 0;
                var interval = setInterval(function() {
                  setLangDir();
                  count++;
                  if (count > 20) clearInterval(interval);
                }, 100);
                
                // MutationObserver as backup
                var observer = new MutationObserver(function() {
                  if (document.documentElement.lang !== LANG || document.documentElement.dir !== DIR) {
                    setLangDir();
                  }
                });
                observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });
              })();
            `,
          }}
        />
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
        
        <meta name="ai.content.type" content="marketplace" />
        <meta name="ai.content.category" content="FiveM Scripts, Gaming Resources, Software" />
        <meta name="ai.content.expertise" content="FiveM Development, NUI Scripts, Lua Programming, Game Modding" />
        <meta name="ai.summary" content="FreexStore is a premium marketplace for FiveM NUI scripts including HUDs, menus, shops, and UI systems. Offers secure licensing, instant delivery, and free trials." />
        
        <meta httpEquiv="content-language" content={lang} />
        
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        
        <meta name="yandex-verification" content="your-yandex-verification-code" />
        <meta name="baidu-site-verification" content="your-baidu-verification-code" />
        <meta name="p:domain_verify" content="your-pinterest-verification-code" />
        
        <meta name="DC.title" content="FreexStore - Premium FiveM Scripts" />
        <meta name="DC.creator" content="FreexStore Team" />
        <meta name="DC.subject" content="FiveM Scripts, NUI Resources, Gaming" />
        <meta name="DC.description" content="Premium FiveM NUI scripts and resources marketplace" />
        <meta name="DC.publisher" content="FreexStore" />
        <meta name="DC.language" content={lang} />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased ${lang === 'ar' ? 'tk-alexandria' : ''}`}>
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

        <HtmlLangSetter lang={lang} dir={direction} />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <LanguageProvider>
              <AuthProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="dark"
                  enableSystem
                  disableTransitionOnChange
                >
                  <ClientLayout>
                    <ConditionalNavigation />
                    <MainContent>
                      {children}
                    </MainContent>
                    <ConditionalFooter />
                  </ClientLayout>
                </ThemeProvider>
              </AuthProvider>
            </LanguageProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
