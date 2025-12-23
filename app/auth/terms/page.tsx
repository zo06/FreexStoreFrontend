'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function TermsOfService() {
  const leftCardRef = useRef<HTMLDivElement>(null);
  const rightBrandingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Left card animation
    const leftElements = leftCardRef.current?.querySelectorAll('.animate-element');
    if (leftElements) {
      gsap.fromTo(leftElements,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.2
        }
      );
    }

    // Right branding animation
    const rightElements = rightBrandingRef.current?.querySelectorAll('.animate-element');
    if (rightElements) {
      gsap.fromTo(rightElements,
        { opacity: 0, x: 50, rotationY: 15 },
        {
          opacity: 1,
          x: 0,
          rotationY: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          delay: 0.4
        }
      );
    }
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 flex flex-col lg:flex-row">
      {/* Left Side - Content Card */}
      <div ref={leftCardRef} className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-sm sm:max-w-2xl lg:max-w-4xl">
          <div className="animate-element bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-slate-700/50">
            {/* Header */}
            <div className="animate-element text-center mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="animate-element text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">Terms of Service</h1>
              <p className="animate-element text-slate-400 text-xs sm:text-sm">Last updated: January 2024</p>
            </div>

            {/* Content */}
            <div className="animate-element space-y-4 sm:space-y-6 text-slate-300 max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto">
              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">1. Acceptance of Terms</h2>
                <p className="text-xs sm:text-sm leading-relaxed">
                  By accessing and using FreeX, you accept and agree to be bound by the terms and provision of this agreement.
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">2. Discord Integration</h2>
                <p className="text-xs sm:text-sm leading-relaxed">
                  Our service integrates with Discord for authentication and automation purposes. By using our service, you agree to
                  Discord's Terms of Service and acknowledge that we may access certain Discord account information as permitted
                  by Discord's OAuth system.
                </p>
              </section>

              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">3. User Responsibilities</h2>
                <p className="text-xs sm:text-sm leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account and for all activities that occur under
                  your account. You agree to notify us immediately of any unauthorized use of your account.
                </p>
              </section>

              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">4. Service Availability</h2>
                <p className="text-xs sm:text-sm leading-relaxed">
                  We strive to maintain high availability of our service, but we do not guarantee uninterrupted access.
                  We reserve the right to modify, suspend, or discontinue the service at any time.
                </p>
              </section>

              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">5. Privacy and Data Protection</h2>
                <p className="text-xs sm:text-sm leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use,
                  and protect your information.
                </p>
              </section>

              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">6. Limitation of Liability</h2>
                <p className="text-xs sm:text-sm leading-relaxed">
                  In no event shall FreeX be liable for any indirect, incidental, special, consequential, or punitive damages,
                  including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                </p>
              </section>

              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">7. Changes to Terms</h2>
                <p className="text-xs sm:text-sm leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify users of any material changes
                  via email or through our service.
                </p>
              </section>
            </div>

            {/* Navigation */}
            <div className="animate-element mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors text-xs sm:text-sm">
                Back to Login
              </Link>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <Link href="/auth/privacy" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors text-xs sm:text-sm">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div ref={rightBrandingRef} className="flex-1 relative overflow-hidden min-h-[40vh] lg:min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-blue-600/20"></div>
        <div className="relative h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="text-center">
            <div className="mb-6 sm:mb-8">
              <div className="animate-element w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="animate-element text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">Legal</h2>
              <h3 className="animate-element text-lg sm:text-xl lg:text-2xl font-light text-slate-300 mb-4 sm:mb-6">Transparency.</h3>
              <p className="animate-element text-slate-400 max-w-sm sm:max-w-md mx-auto leading-relaxed text-sm sm:text-base px-4 sm:px-0">
                Clear and transparent terms to ensure you understand your rights and responsibilities when using our automation platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
