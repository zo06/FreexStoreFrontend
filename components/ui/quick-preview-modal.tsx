'use client';

import { useEffect } from 'react';
import { X, Star, Gift, ShoppingCart, Eye, Zap, CheckCircle, Shield, Download, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Script {
  id: string;
  slug?: string;
  name: string;
  description: string;
  price: string | number;
  category: string | { name: string };
  imageUrl?: string;
  imageUrls?: string | string[];
  youtubeUrl?: string;
  features?: string | string[];
  popular?: boolean;
  new?: boolean;
  trialAvailable?: boolean;
  foreverPrice?: number;
  datePrice?: number;
  licenseType?: string;
}

interface QuickPreviewModalProps {
  script: Script | null;
  onClose: () => void;
  onTrial?: (script: Script) => void;
}

export function QuickPreviewModal({ script, onClose, onTrial }: QuickPreviewModalProps) {
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'en';

  useEffect(() => {
    if (script) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [script]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!script) return null;

  const categoryName = typeof script.category === 'string' ? script.category : (script.category as any)?.name;
  const price = script.foreverPrice || script.datePrice || (typeof script.price === 'number' ? script.price : parseFloat(script.price as string) || 0);

  const features = (() => {
    if (!script.features) return [];
    if (Array.isArray(script.features)) return script.features as string[];
    try { const p = JSON.parse(script.features as string); return Array.isArray(p) ? p : [script.features]; } catch {}
    if ((script.features as string).includes(',')) return (script.features as string).split(',').map((f: string) => f.trim()).filter(Boolean);
    return (script.features as string).split('\n').filter((f: string) => f.trim());
  })();

  const imgSrc = script.imageUrl
    ? (script.imageUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${script.imageUrl}` : script.imageUrl)
    : null;

  const scriptUrl = `/${locale}/script/${script.slug || script.id}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-[#080d1a] border-l border-white/[0.08] z-[60] overflow-y-auto animate-slide-left shadow-2xl shadow-black/50 flex flex-col">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-all z-10 group"
        >
          <X className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
        </button>

        {/* Hero Image */}
        <div className="relative h-60 flex-shrink-0 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 overflow-hidden">
          {imgSrc ? (
            <img src={imgSrc} alt={script.name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-500/20 flex items-center justify-center">
                <Zap className="w-10 h-10 text-cyan-400" />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080d1a] via-[#080d1a]/20 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {script.popular && (
              <span className="px-2.5 py-1 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg">🔥 Popular</span>
            )}
            {script.new && (
              <span className="px-2.5 py-1 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg">✨ New</span>
            )}
            {script.trialAvailable && (
              <span className="px-2.5 py-1 text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 rounded-full backdrop-blur-sm">🎁 Free Trial</span>
            )}
          </div>

          {/* Price overlay */}
          <div className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-black/70 backdrop-blur-sm border border-white/10">
            <span className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">${price}</span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 space-y-5">

          {/* Category + Stars */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
              {categoryName}
            </span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              ))}
              <span className="text-xs text-gray-500 ml-1">Premium</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-black text-white leading-tight">{script.name}</h2>

          {/* Description */}
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-4">{script.description}</p>

          {/* Features */}
          {features.length > 0 && (
            <div>
              <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                Key Features
              </h3>
              <ul className="space-y-2">
                {features.slice(0, 5).map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="leading-snug" dir="auto">{f}</span>
                  </li>
                ))}
                {features.length > 5 && (
                  <li className="text-xs text-gray-500 pl-6.5">+{features.length - 5} more features...</li>
                )}
              </ul>
            </div>
          )}

          {/* Trust indicators */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Download className="w-4 h-4 text-cyan-400" />, label: 'Instant\nDelivery' },
              { icon: <Shield className="w-4 h-4 text-emerald-400" />, label: 'Secure\nLicense' },
              { icon: <Users className="w-4 h-4 text-violet-400" />, label: '24/7\nSupport' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                {item.icon}
                <span className="text-xs text-gray-400 whitespace-pre-line leading-tight">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="p-6 pt-0 space-y-3 flex-shrink-0">
          <Link href={scriptUrl}>
            <button className="w-full py-3.5 font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2 group">
              <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Buy Now — ${price}
            </button>
          </Link>

          {script.trialAvailable && onTrial && (
            <button
              onClick={() => onTrial(script)}
              className="w-full py-3 font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Gift className="w-4 h-4" />
              Start Free Trial
            </button>
          )}

          <Link
            href={scriptUrl}
            className="text-center text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-1 py-1"
          >
            <Eye className="w-3.5 h-3.5" />
            View full details & purchase options
          </Link>
        </div>
      </div>
    </>
  );
}
