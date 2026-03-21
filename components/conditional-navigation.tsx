'use client';

import { usePathname } from 'next/navigation';
import Navigation from '@/components/navigation';

export default function ConditionalNavigation() {
  const pathname = usePathname();
  
  if (pathname?.includes('/admin') || pathname?.includes('/hr')) {
    return null;
  }
  
  return <Navigation />;
}
