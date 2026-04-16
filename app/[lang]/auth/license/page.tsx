'use client';

import Link from 'next/link';
import { ArrowLeft, Key, Shield, CheckCircle, Globe, AlertTriangle, Ban } from 'lucide-react';

export default function LicenseAgreement() {
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
              <Key className="w-7 h-7 text-[#51a2ff]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">License Agreement</h1>
              <p className="text-[#555] text-sm mt-0.5">Last updated: January 2024</p>
            </div>
          </div>

          <div className="space-y-8 text-[#aaa]">
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#51a2ff]" />
                License Grant
              </h2>
              <p className="text-sm leading-relaxed">
                Upon purchase of any script from FreexStore, you are granted a non-exclusive, non-transferable
                license to use the script on your FiveM server(s) according to the terms outlined in this agreement.
                This license is tied to your account and the IP address registered during activation.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Permitted Uses
              </h2>
              <ul className="space-y-3">
                {[
                  'Use the script on the number of servers specified by your license type',
                  "Modify the script's configuration files for your server's needs",
                  'Receive updates and bug fixes for the duration of your license',
                  'Access customer support for technical assistance',
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
                <Ban className="w-5 h-5 text-red-400" />
                Prohibited Uses
              </h2>
              <ul className="space-y-3">
                {[
                  'Redistribute, resell, or share the script with third parties',
                  'Remove or modify license protection mechanisms',
                  'Use the script on servers not registered with your license',
                  'Claim ownership or authorship of the script',
                  'Use the script for illegal or malicious purposes',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <Ban className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#51a2ff]" />
                IP-Based Licensing
              </h2>
              <p className="text-sm leading-relaxed mb-4">
                Our scripts use IP-based licensing to ensure fair use and protect against unauthorized distribution.
                Your license key is tied to your server&apos;s IP address.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>You may update your IP address through your dashboard</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>IP changes are limited to prevent abuse</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>Sharing your license key may result in license revocation</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                License Termination
              </h2>
              <p className="text-sm leading-relaxed">
                FreexStore reserves the right to terminate your license if you violate any terms of this agreement.
                Upon termination, you must immediately cease using the script and remove it from all servers.
                No refund will be provided for licenses terminated due to violations.
              </p>
            </section>

            <section className="p-6 rounded-xl" style={{ background: 'rgba(81,162,255,0.05)', border: '1px solid rgba(81,162,255,0.15)' }}>
              <h2 className="text-base font-semibold text-white mb-2">Questions?</h2>
              <p className="text-[#888] text-sm mb-4">
                If you have questions about licensing or need to discuss special licensing arrangements,
                please contact our team.
              </p>
              <Link href="/contact" className="inline-flex items-center gap-2 text-[#51a2ff] hover:text-white transition-colors text-sm font-medium">
                Contact Us
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
