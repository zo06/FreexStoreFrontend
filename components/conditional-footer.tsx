'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Don't show footer on admin routes (handles /en/admin, /de/admin, /ar/admin, etc.)
  if (pathname?.includes('/admin') || pathname?.includes('/hr')) {
    return null;
  }
  
  return <Footer />;
}
