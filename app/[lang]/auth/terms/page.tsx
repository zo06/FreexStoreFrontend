'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-[800px] mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-12 h-12 bg-[#1a1a1a] rounded-xl flex items-center justify-center mx-auto mb-6" style={{ border: '1px solid rgba(81,162,255,0.2)' }}>
            <FileText className="w-6 h-6 text-[#51a2ff]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-[#555] text-sm">Last updated: January 2024</p>
        </div>

        {/* Content */}
        <div className="card-base p-8 space-y-8">
          <div className="space-y-6 text-[#aaa]" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
              <p className="text-sm leading-relaxed">
                By accessing and using FreeX, you accept and agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">2. Discord Integration</h2>
              <p className="text-sm leading-relaxed">
                Our service integrates with Discord for authentication and automation purposes. By using our service, you agree to
                Discord&apos;s Terms of Service and acknowledge that we may access certain Discord account information as permitted
                by Discord&apos;s OAuth system.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">3. User Responsibilities</h2>
              <p className="text-sm leading-relaxed">
                You are responsible for maintaining the confidentiality of your account and for all activities that occur under
                your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">4. Service Availability</h2>
              <p className="text-sm leading-relaxed">
                We strive to maintain high availability of our service, but we do not guarantee uninterrupted access.
                We reserve the right to modify, suspend, or discontinue the service at any time.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">5. Privacy and Data Protection</h2>
              <p className="text-sm leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use,
                and protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">6. Limitation of Liability</h2>
              <p className="text-sm leading-relaxed">
                In no event shall FreeX be liable for any indirect, incidental, special, consequential, or punitive damages,
                including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">7. Changes to Terms</h2>
              <p className="text-sm leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any material changes
                via email or through our service.
              </p>
            </section>
          </div>

          {/* Navigation */}
          <div className="border-t border-[rgba(255,255,255,0.06)] pt-6 flex flex-wrap justify-center items-center gap-6">
            <Link href="/auth/login" className="text-[#51a2ff] hover:text-white font-medium transition-colors text-sm">
              Back to Login
            </Link>
            <span className="text-[#333]">·</span>
            <Link href="/auth/privacy" className="text-[#51a2ff] hover:text-white font-medium transition-colors text-sm">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
