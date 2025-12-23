'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Only animate if this is not the initial load
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname) {
      // Fade out current content
      gsap.to(containerRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          // Refresh ScrollTrigger before new content animation
          ScrollTrigger.refresh();
          
          // Fade in new content
          gsap.fromTo(containerRef.current, 
            { opacity: 0, y: 20 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.4, 
              ease: "power2.out",
              delay: 0.1,
              onComplete: () => {
                // Refresh again after animation completes
                ScrollTrigger.refresh();
              }
            }
          );
        }
      });
    } else {
      // Initial load animation
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          ease: "power2.out",
          delay: 0.2
        }
      );
    }

    prevPathnameRef.current = pathname;
  }, [pathname]);

  return (
    <div ref={containerRef} className="w-full">
      {children}
    </div>
  );
}
