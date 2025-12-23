'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  // Generate stars
  const stars = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    size: Math.random() * 2 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    opacity: Math.random() * 0.5 + 0.3,
    delay: Math.random() * 3,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-950 to-gray-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              left: `${star.x}%`,
              top: `${star.y}%`,
              opacity: star.opacity,
              animationDelay: `${star.delay}s`,
              animationDuration: '3s',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full text-center space-y-6">
        {/* 404 Text */}
        <div className="space-y-6">
          <h1 
            className="text-9xl md:text-[14rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-pink-400"
            style={{
              letterSpacing: '0.05em',
              fontWeight: 900
            }}
          >
            404
          </h1>
          <div className="flex justify-center gap-3">
            <div className="h-1 w-20 bg-blue-500/80 rounded-full" />
            <div className="h-1 w-20 bg-cyan-500/80 rounded-full" />
            <div className="h-1 w-20 bg-pink-500/80 rounded-full" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 px-4 pt-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-white">
            Page Not Found
          </h2>
          <p className="text-gray-400 text-lg max-w-lg mx-auto leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link href="/">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            >
              <Home className="w-5 h-5 mr-2" />
              Return Home
            </Button>
          </Link>
          
          <Button 
            size="lg"
            variant="outline" 
            onClick={() => window.history.back()}
            className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10 px-8 py-6 text-lg font-semibold transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Space Quote */}
        <div className="pt-8">
          <p className="text-gray-500 text-sm italic">
            &quot;Space is big. You just won&apos;t believe how vastly, hugely, mind-bogglingly big it is.&quot; - Douglas Adams
          </p>
        </div>
      </div>

      {/* Falling meteors (straight down) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-20 bg-gradient-to-b from-blue-400 via-white to-transparent"
            style={{
              top: '-100px',
              left: `${15 + i * 20}%`,
              animation: `meteor-fall ${2 + i * 0.5}s linear infinite`,
              animationDelay: `${i * 1.5}s`,
              opacity: 0.8,
              boxShadow: '0 0 8px rgba(59, 130, 246, 0.8)',
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes meteor-fall {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

