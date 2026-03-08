'use client';

import { useEffect } from 'react';
import { ShieldX, Clock, Key, ArrowRight, LogOut } from 'lucide-react';

interface TrialExpiredModalProps {
  trialStartAt?: string | null;
  trialEndAt?: string | null;
  onLogout: () => void;
}

export function TrialExpiredModal({ trialStartAt, trialEndAt, onLogout }: TrialExpiredModalProps) {
  // Prevent scrolling when modal is visible
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    /* Full-screen blocking overlay — no way to close/dismiss */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md"
      // Absorb all pointer events so nothing behind is clickable
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {/* Decorative background gradients */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(239,68,68,0.15),transparent)]" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_60%_40%_at_0%_100%,rgba(99,102,241,0.1),transparent)]" />
      </div>
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-red-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-purple-600/10 blur-[120px]" />

      <div className="relative z-10 mx-4 w-full max-w-md">
        <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-gray-900/95 to-gray-950/95 p-8 shadow-2xl backdrop-blur-xl">

          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/30 ring-1 ring-red-500/30">
                <ShieldX className="h-10 w-10 text-red-400" />
              </div>
              <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
                <Clock className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-2xl font-bold text-white">
              Free Trial Expired
            </h1>
            <p className="text-sm leading-relaxed text-gray-400">
              Your 3-day free trial has ended. To continue using FreexStore,
              please purchase a license.
            </p>
          </div>

          {/* Trial info */}
          {(trialStartAt || trialEndAt) && (
            <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
              {trialStartAt && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-400">Trial started</span>
                  <span className="font-medium text-white">{formatDate(trialStartAt)}</span>
                </div>
              )}
              {trialEndAt && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-400">Trial ended</span>
                  <span className="font-medium text-red-400">{formatDate(trialEndAt)}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <a
              href="/scripts"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25"
            >
              <Key className="h-4 w-4" />
              Purchase a License
              <ArrowRight className="h-4 w-4" />
            </a>

            <button
              type="button"
              onClick={onLogout}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-gray-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>

          {/* Footer note */}
          <p className="mt-4 text-center text-xs text-gray-600">
            Your account is still active. Contact support if you believe this is an error.
          </p>
        </div>
      </div>
    </div>
  );
}
