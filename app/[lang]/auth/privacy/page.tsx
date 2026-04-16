'use client';

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-[800px] mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-12 h-12 bg-[#1a1a1a] rounded-xl flex items-center justify-center mx-auto mb-6" style={{ border: '1px solid rgba(81,162,255,0.2)' }}>
            <ShieldCheck className="w-6 h-6 text-[#51a2ff]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-[#555] text-sm">Last updated: January 2024</p>
        </div>

        {/* Content */}
        <div className="card-base p-8 space-y-8">
          <div className="space-y-6 text-[#aaa]" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h2>
              <p className="text-sm leading-relaxed mb-2">
                We collect information you provide directly to us through Discord OAuth authentication, including:
              </p>
              <ul className="text-sm leading-relaxed ml-4 space-y-1">
                <li>• Discord username and user ID</li>
                <li>• Discord avatar (if available)</li>
                <li>• Email address (if provided by Discord)</li>
                <li>• Server/guild information (when relevant to automation features)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">2. How We Use Your Information</h2>
              <p className="text-sm leading-relaxed mb-2">We use the information we collect to:</p>
              <ul className="text-sm leading-relaxed ml-4 space-y-1">
                <li>• Provide and maintain our automation services</li>
                <li>• Authenticate your identity and manage your account</li>
                <li>• Execute Discord automation tasks on your behalf</li>
                <li>• Improve our service and develop new features</li>
                <li>• Communicate with you about service updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">3. Information Sharing</h2>
              <p className="text-sm leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent,
                except as described in this policy. We may share information with Discord as necessary to provide our services
                and in compliance with Discord&apos;s Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">4. Data Security</h2>
              <p className="text-sm leading-relaxed">
                We implement appropriate security measures to protect your personal information against unauthorized access,
                alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">5. Data Retention</h2>
              <p className="text-sm leading-relaxed">
                We retain your personal information only for as long as necessary to provide our services and fulfill the
                purposes outlined in this policy. You may request deletion of your account and associated data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">6. Discord Integration</h2>
              <p className="text-sm leading-relaxed">
                Our service integrates with Discord&apos;s API. Discord&apos;s own privacy policy governs their collection and use
                of your information. We only access Discord information that you explicitly authorize through OAuth.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">7. Your Rights</h2>
              <p className="text-sm leading-relaxed mb-2">You have the right to:</p>
              <ul className="text-sm leading-relaxed ml-4 space-y-1">
                <li>• Access your personal information</li>
                <li>• Correct inaccurate information</li>
                <li>• Request deletion of your information</li>
                <li>• Revoke Discord OAuth permissions</li>
                <li>• Opt out of non-essential communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">8. Changes to This Policy</h2>
              <p className="text-sm leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any material changes by posting
                the new policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">9. Contact Us</h2>
              <p className="text-sm leading-relaxed">
                If you have any questions about this privacy policy or our data practices, please contact us through
                our support channels or Discord server.
              </p>
            </section>
          </div>

          {/* Navigation */}
          <div className="border-t border-[rgba(255,255,255,0.06)] pt-6 flex flex-wrap justify-center items-center gap-6">
            <Link href="/auth/login" className="text-[#51a2ff] hover:text-white font-medium transition-colors text-sm">
              Back to Login
            </Link>
            <span className="text-[#333]">·</span>
            <Link href="/auth/terms" className="text-[#51a2ff] hover:text-white font-medium transition-colors text-sm">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
