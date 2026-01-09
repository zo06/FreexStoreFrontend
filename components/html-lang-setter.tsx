'use client';

import { useEffect, useLayoutEffect } from 'react';

interface HtmlLangSetterProps {
  lang: string;
  dir: 'ltr' | 'rtl';
}

export function HtmlLangSetter({ lang, dir }: HtmlLangSetterProps) {
  // Use useLayoutEffect to set attributes before paint
  useLayoutEffect(() => {
    const html = document.documentElement;
    
    // Set initial values
    html.lang = lang;
    html.dir = dir;
    
    // Create MutationObserver to prevent any resets
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          if (mutation.attributeName === 'lang' && html.lang !== lang) {
            html.lang = lang;
          }
          if (mutation.attributeName === 'dir' && html.dir !== dir) {
            html.dir = dir;
          }
        }
      });
    });
    
    // Observe attribute changes on the html element
    observer.observe(html, {
      attributes: true,
      attributeFilter: ['lang', 'dir']
    });
    
    // Cleanup observer on unmount
    return () => observer.disconnect();
  }, [lang, dir]);

  return null;
}
