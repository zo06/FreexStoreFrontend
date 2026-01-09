'use client';

import Link from 'next/link';
import { ArrowLeft, CurrencyDollar, Clock, ShieldCheck, Warning, CheckCircle } from 'phosphor-react';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(53,189,242,0.15),transparent)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_60%_60%_at_100%_100%,rgba(16,185,129,0.1),transparent)]"></div>
      </div>
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>

      <div className="container relative z-10 mx-auto px-4 py-16 max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm text-gray-400 hover:text-cyan-400 transition-colors">
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="bg-gradient-to-br from-white/[0.08] to-transparent backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <CurrencyDollar size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">Refund Policy</h1>
              <p className="text-gray-400">Last updated: January 2024</p>
            </div>
          </div>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ShieldCheck size={24} className="text-cyan-400" />
                Overview
              </h2>
              <p className="leading-relaxed">
                At FreexStore, we strive to provide high-quality FiveM scripts and ensure customer satisfaction. 
                This refund policy outlines the conditions under which refunds may be issued for digital products 
                purchased through our platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle size={24} className="text-emerald-400" />
                Eligible for Refund
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Script does not function as described in the product listing</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Technical issues that cannot be resolved by our support team within 7 days</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Duplicate purchase made in error (within 24 hours)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Request made within 7 days of purchase and script has not been downloaded</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Warning size={24} className="text-amber-400" />
                Not Eligible for Refund
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Warning size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>Script has been downloaded and used on a server</span>
                </li>
                <li className="flex items-start gap-3">
                  <Warning size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>More than 7 days have passed since purchase</span>
                </li>
                <li className="flex items-start gap-3">
                  <Warning size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>Issues caused by modifications made to the script</span>
                </li>
                <li className="flex items-start gap-3">
                  <Warning size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>Incompatibility with third-party scripts or frameworks not listed in requirements</span>
                </li>
                <li className="flex items-start gap-3">
                  <Warning size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>Change of mind or no longer needing the product</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Clock size={24} className="text-blue-400" />
                Refund Process
              </h2>
              <ol className="space-y-3 list-decimal list-inside">
                <li>Contact our support team via the Contact page or Discord</li>
                <li>Provide your order ID and reason for the refund request</li>
                <li>Our team will review your request within 2-3 business days</li>
                <li>If approved, refunds will be processed to the original payment method within 5-7 business days</li>
              </ol>
            </section>

            <section className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-2">Need Help?</h2>
              <p className="text-gray-400 mb-4">
                If you have questions about our refund policy or need assistance with a purchase, 
                please don&apos;t hesitate to contact us.
              </p>
              <Link href="/contact" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                Contact Support
                <ArrowLeft size={16} className="rotate-180" />
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
