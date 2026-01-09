'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function PrivacyPolicy() {
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
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="animate-element text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">Privacy Policy</h1>
              <p className="animate-element text-slate-400 text-xs sm:text-sm">Last updated: January 2024</p>
            </div>

            {/* Content */}
            <div className="animate-element space-y-4 sm:space-y-6 text-slate-300 max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto">
              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">1. Information We Collect</h2>
                <p className="text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3">
                  We collect information you provide directly to us through Discord OAuth authentication, including:
                </p>
                <ul className="text-xs sm:text-sm leading-relaxed ml-3 sm:ml-4 space-y-1">
                  <li>• Discord username and user ID</li>
                  <li>• Discord avatar (if available)</li>
                  <li>• Email address (if provided by Discord)</li>
                  <li>• Server/guild information (when relevant to automation features)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">2. How We Use Your Information</h2>
                <p className="text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3">
                  We use the information we collect to:
                </p>
                <ul className="text-xs sm:text-sm leading-relaxed ml-3 sm:ml-4 space-y-1">
                  <li>• Provide and maintain our automation services</li>
                  <li>• Authenticate your identity and manage your account</li>
                  <li>• Execute Discord automation tasks on your behalf</li>
                  <li>• Improve our service and develop new features</li>
                  <li>• Communicate with you about service updates</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">3. Information Sharing</h2>
                <p className="text-xs sm:text-sm leading-relaxed">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent,
                  except as described in this policy. We may share information with Discord as necessary to provide our services
                  and in compliance with Discord's Terms of Service.
                </p>
              </section>

              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">4. Data Security</h2>
                <p className="text-xs sm:text-sm leading-relaxed">
                  We implement appropriate security measures to protect your personal information against unauthorized access,
                  alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">5. Data Retention</h2>
                <p className="text-xs sm:text-sm leading-relaxed">
                  We retain your personal information only for as long as necessary to provide our services and fulfill the
                  purposes outlined in this policy. You may request deletion of your account and associated data at any time.
                </p>
              </section>

              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">6. Discord Integration</h2>
                <p className="text-xs sm:text-sm leading-relaxed">
                  Our service integrates with Discord's API. Discord's own privacy policy governs their collection and use
                  of your information. We only access Discord information that you explicitly authorize through OAuth.
                </p>
              </section>

              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">7. Your Rights</h2>
                <p className="text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3">
                  You have the right to:
                </p>
                <ul className="text-xs sm:text-sm leading-relaxed ml-3 sm:ml-4 space-y-1">
                  <li>• Access your personal information</li>
                  <li>• Correct inaccurate information</li>
                  <li>• Request deletion of your information</li>
                  <li>• Revoke Discord OAuth permissions</li>
                  <li>• Opt out of non-essential communications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">8. Changes to This Policy</h2>
                <p className="text-xs sm:text-sm leading-relaxed">
                  We may update this privacy policy from time to time. We will notify you of any material changes by posting
                  the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">9. Contact Us</h2>
                <p className="text-xs sm:text-sm leading-relaxed">
                  If you have any questions about this privacy policy or our data practices, please contact us through
                  our support channels or Discord server.
                </p>
              </section>
            </div>

            {/* Navigation */}
            <div className="animate-element mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors text-xs sm:text-sm px-3 py-2 touch-target">
                Back to Login
              </Link>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <Link href="/auth/terms" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors text-xs sm:text-sm px-3 py-2 touch-target">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div ref={rightBrandingRef} className="flex-1 relative overflow-hidden hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-blue-600/20"></div>
        <div className="relative h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-[300px] lg:min-h-screen">
          <div className="text-center">
            <div className="mb-6 sm:mb-8">
              <div className="animate-element w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="animate-element text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">Privacy</h2>
              <h3 className="animate-element text-xl sm:text-2xl font-light text-slate-300 mb-4 sm:mb-6">Protected.</h3>
              <p className="animate-element text-slate-400 max-w-xs sm:max-w-md mx-auto leading-relaxed text-sm sm:text-base">
                Your privacy and data security are our top priorities. We're committed to transparent data practices and protecting your information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
