'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Check if the URL starts with a locale prefix (/en, /ar, /de)
    const path = window.location.pathname;
    const localePrefixes = ['/en', '/ar', '/de'];

    for (const prefix of localePrefixes) {
      if (path.startsWith(prefix)) {
        // Extract the rest of the path (e.g., /en/scripts -> /scripts)
        const restOfPath = path.slice(prefix.length) || '/';
        router.replace(restOfPath);
        return;
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #51a2ff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Radial glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(81,162,255,0.06) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-lg w-full text-center space-y-8">
        {/* 404 */}
        <div>
          <h1 className="text-[9rem] md:text-[12rem] font-black leading-none text-white" style={{ letterSpacing: '-0.04em' }}>
            4<span className="text-[#51a2ff]">0</span>4
          </h1>
          <div className="flex justify-center gap-2 -mt-2">
            <div className="h-0.5 w-12 bg-[rgba(255,255,255,0.1)] rounded-full" />
            <div className="h-0.5 w-12 bg-[#51a2ff] rounded-full" />
            <div className="h-0.5 w-12 bg-[rgba(255,255,255,0.1)] rounded-full" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Page Not Found</h2>
          <p className="text-[#888] text-base leading-relaxed max-w-sm mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <Home className="w-4 h-4" />
            Return Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-ghost inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
