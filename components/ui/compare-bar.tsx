'use client';

import { X, BarChart2, Trash2, ArrowRight } from 'lucide-react';
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
}

interface CompareBarProps {
  scripts: CompareScript[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
}

export function CompareBar({ scripts, onRemove, onClear, onCompare }: CompareBarProps) {
  if (scripts.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-[#0a0f1e]/95 backdrop-blur-xl border-t border-white/[0.08] shadow-2xl shadow-black/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 flex-wrap">

            {/* Icon + Label */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <div className="text-xs text-gray-400">Comparing</div>
                <div className="text-sm font-semibold text-white">{scripts.length} of 3</div>
              </div>
            </div>

            {/* Script chips */}
            <div className="flex gap-2 flex-1 flex-wrap">
              {scripts.map((s) => (
                <div key={s.id} className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.05] border border-white/[0.08] rounded-lg">
                  <span className="text-sm text-white font-medium max-w-[120px] truncate">{s.name}</span>
                  <button
                    onClick={() => onRemove(s.id)}
                    className="w-4 h-4 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center transition-all flex-shrink-0"
                  >
                    <X className="w-2.5 h-2.5 text-gray-400 hover:text-red-400" />
                  </button>
                </div>
              ))}

              {/* Empty slots */}
              {[...Array(3 - scripts.length)].map((_, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border border-dashed border-white/[0.06] rounded-lg">
                  <span className="text-xs text-gray-600">Add script...</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={onClear}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
              <button
                onClick={onCompare}
                disabled={scripts.length < 2}
                className="flex items-center gap-2 px-5 py-2 font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                Compare Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
