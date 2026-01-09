'use client';

import { usePathname } from 'next/navigation';
import Navigation from '@/components/navigation';

export default function ConditionalNavigation() {
  const pathname = usePathname();
  
  // Hide navigation on admin pages
  const isAdminPage = pathname?.includes('/admin');
  
  if (isAdminPage) {
    return null;
  }
  
  return <Navigation />;
}
