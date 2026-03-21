'use client';

import { X, CheckCircle, XCircle, Star, ShoppingCart, Gift, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CompareScript {
  id: string;
  slug?: string;
  name: string;
  price: string | number;
  foreverPrice?: number;
  imageUrl?: string;
  features?: string | string[];
  category: string | { name: string };
  popular?: boolean;
  new?: boolean;
  trialAvailable?: boolean;
  description: string;
  licenseType?: string;
}

interface CompareModalProps {
  scripts: CompareScript[];
  onClose: () => void;
}

function parseFeatures(features: string | string[] | undefined): string[] {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  try { const p = JSON.parse(features); return Array.isArray(p) ? p : [features]; } catch {}
  if (features.includes(',')) return features.split(',').map(f => f.trim()).filter(Boolean);
  return features.split('\n').filter(f => f.trim());
}

export function CompareModal({ scripts, onClose }: CompareModalProps) {
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'en';

  if (scripts.length < 2) return null;

  // Collect all unique features across scripts
  const allFeatures = Array.from(new Set(
    scripts.flatMap(s => parseFeatures(s.features))
  )).slice(0, 10);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-4 md:inset-8 lg:inset-12 z-[70] flex flex-col animate-scale-in">
        <div className="bg-[#080d1a] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col shadow-2xl shadow-black/50 max-h-full">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold text-white">Script Comparison</h2>
              <p className="text-sm text-gray-400">Side-by-side comparison of {scripts.length} scripts</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400 w-44 flex-shrink-0 bg-white/[0.02] border-b border-white/[0.04]">Feature</th>
                  {scripts.map(s => {
                    const price = s.foreverPrice || (typeof s.price === 'number' ? s.price : parseFloat(s.price as string) || 0);
                    const imgSrc = s.imageUrl
                      ? (s.imageUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${s.imageUrl}` : s.imageUrl)
                      : null;
                    return (
                      <th key={s.id} className="px-4 py-4 border-b border-white/[0.04] bg-white/[0.02]">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 flex-shrink-0">
                            {imgSrc ? (
                              <img src={imgSrc} alt={s.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Zap className="w-6 h-6 text-cyan-400" />
                              </div>
                            )}
                          </div>
                          <div className="text-center">
                            <div className="text-white font-bold text-sm leading-tight">{s.name}</div>
                            <div className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mt-1">${price}</div>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {/* Category */}
                <tr className="border-b border-white/[0.04]">
                  <td className="px-6 py-3.5 text-sm text-gray-400 font-medium bg-white/[0.01]">Category</td>
                  {scripts.map(s => (
                    <td key={s.id} className="px-4 py-3.5 text-center">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/20">
                        {typeof s.category === 'string' ? s.category : (s.category as any)?.name}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* License */}
                <tr className="border-b border-white/[0.04]">
                  <td className="px-6 py-3.5 text-sm text-gray-400 font-medium bg-white/[0.01]">License</td>
                  {scripts.map(s => (
                    <td key={s.id} className="px-4 py-3.5 text-center">
                      <span className="text-sm text-white">
                        {s.licenseType === 'forever' ? '♾️ Lifetime' : '⏱️ Time-based'}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Free Trial */}
                <tr className="border-b border-white/[0.04]">
                  <td className="px-6 py-3.5 text-sm text-gray-400 font-medium bg-white/[0.01]">Free Trial</td>
                  {scripts.map(s => (
                    <td key={s.id} className="px-4 py-3.5 text-center">
                      {s.trialAvailable
                        ? <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" />
                        : <XCircle className="w-5 h-5 text-gray-600 mx-auto" />
                      }
                    </td>
                  ))}
                </tr>

                {/* Popular */}
                <tr className="border-b border-white/[0.04]">
                  <td className="px-6 py-3.5 text-sm text-gray-400 font-medium bg-white/[0.01]">Popular</td>
                  {scripts.map(s => (
                    <td key={s.id} className="px-4 py-3.5 text-center">
                      {s.popular
                        ? <CheckCircle className="w-5 h-5 text-orange-400 mx-auto" />
                        : <XCircle className="w-5 h-5 text-gray-600 mx-auto" />
                      }
                    </td>
                  ))}
                </tr>

                {/* Features rows */}
                {allFeatures.length > 0 && (
                  <>
                    <tr>
                      <td colSpan={scripts.length + 1} className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white/[0.02] border-b border-white/[0.04]">
                        Features
                      </td>
                    </tr>
                    {allFeatures.map((feature, fi) => (
                      <tr key={fi} className="border-b border-white/[0.03]">
                        <td className="px-6 py-3 text-sm text-gray-400 bg-white/[0.01] max-w-[176px]">
                          <span className="line-clamp-2" dir="auto">{feature}</span>
                        </td>
                        {scripts.map(s => {
                          const scriptFeatures = parseFeatures(s.features);
                          const hasFeature = scriptFeatures.some(f => f.toLowerCase().includes(feature.toLowerCase().substring(0, 10)));
                          return (
                            <td key={s.id} className="px-4 py-3 text-center">
                              {hasFeature
                                ? <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />
                                : <div className="w-4 h-px bg-gray-700 mx-auto" />
                              }
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer CTAs */}
          <div className="flex gap-3 p-6 border-t border-white/[0.06] flex-shrink-0 overflow-x-auto">
            {scripts.map(s => {
              const price = s.foreverPrice || (typeof s.price === 'number' ? s.price : parseFloat(s.price as string) || 0);
              return (
                <Link key={s.id} href={`/${locale}/script/${s.slug || s.id}`} className="flex-1 min-w-[140px]">
                  <button className="w-full py-3 font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 flex items-center justify-center gap-2 text-sm">
                    <ShoppingCart className="w-4 h-4" />
                    Buy {s.name.split(' ')[0]}
                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
