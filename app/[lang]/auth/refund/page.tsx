'use client';

import Link from 'next/link';
import { ArrowLeft, DollarSign, Clock, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-[800px] mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm text-[#888] hover:text-[#51a2ff] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="card-base p-8 lg:p-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-[#1a1a1a] rounded-xl flex items-center justify-center flex-shrink-0" style={{ border: '1px solid rgba(81,162,255,0.2)' }}>
              <DollarSign className="w-7 h-7 text-[#51a2ff]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Refund Policy</h1>
              <p className="text-[#555] text-sm mt-0.5">Last updated: January 2024</p>
            </div>
          </div>

          <div className="space-y-8 text-[#aaa]">
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#51a2ff]" />
                Overview
              </h2>
              <p className="text-sm leading-relaxed">
                At FreexStore, we strive to provide high-quality FiveM scripts and ensure customer satisfaction.
                This refund policy outlines the conditions under which refunds may be issued for digital products
                purchased through our platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Eligible for Refund
              </h2>
              <ul className="space-y-3">
                {[
                  'Script does not function as described in the product listing',
                  'Technical issues that cannot be resolved by our support team within 7 days',
                  'Duplicate purchase made in error (within 24 hours)',
                  'Request made within 7 days of purchase and script has not been downloaded',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Not Eligible for Refund
              </h2>
              <ul className="space-y-3">
                {[
                  'Script has been downloaded and used on a server',
                  'More than 7 days have passed since purchase',
                  'Issues caused by modifications made to the script',
                  'Incompatibility with third-party scripts or frameworks not listed in requirements',
                  'Change of mind or no longer needing the product',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#51a2ff]" />
                Refund Process
              </h2>
              <ol className="space-y-3 text-sm list-decimal list-inside">
                <li>Contact our support team via the Contact page or Discord</li>
                <li>Provide your order ID and reason for the refund request</li>
                <li>Our team will review your request within 2-3 business days</li>
                <li>If approved, refunds will be processed to the original payment method within 5-7 business days</li>
              </ol>
            </section>

            <section className="p-6 rounded-xl" style={{ background: 'rgba(81,162,255,0.05)', border: '1px solid rgba(81,162,255,0.15)' }}>
              <h2 className="text-base font-semibold text-white mb-2">Need Help?</h2>
              <p className="text-[#888] text-sm mb-4">
                If you have questions about our refund policy or need assistance with a purchase,
                please don&apos;t hesitate to contact us.
              </p>
              <Link href="/contact" className="inline-flex items-center gap-2 text-[#51a2ff] hover:text-white transition-colors text-sm font-medium">
                Contact Support
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
