import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n/request';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: locales,
  defaultLocale: 'en',
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  
  // Extract locale from URL path
  const pathname = request.nextUrl.pathname;
  const locale = pathname.split('/')[1];
  
  if (locales.includes(locale as any)) {
    // Set cookie with current locale for client-side access
    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      sameSite: 'lax'
    });
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
