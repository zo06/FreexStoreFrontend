'use client';

import { usePathname } from 'next/navigation';
import { PageTransition } from './page-transition';

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  return (
    <main className={`min-h-screen overflow-x-hidden overflow-y-hidden ${isAuthPage || pathname?.startsWith('/admin') ? '' : 'pt-[4.5rem]'}`}>
      <PageTransition>
        {children}
      </PageTransition>
    </main>
  );
}
