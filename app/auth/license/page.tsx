'use client';

import Link from 'next/link';
import { ArrowLeft, Key, ShieldCheck, Warning, CheckCircle, Prohibit, Globe } from 'phosphor-react';

export default function LicenseAgreement() {
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
              <Key size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">License Agreement</h1>
              <p className="text-gray-400">Last updated: January 2024</p>
            </div>
          </div>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ShieldCheck size={24} className="text-cyan-400" />
                License Grant
              </h2>
              <p className="leading-relaxed">
                Upon purchase of any script from FreexStore, you are granted a non-exclusive, non-transferable 
                license to use the script on your FiveM server(s) according to the terms outlined in this agreement. 
                This license is tied to your account and the IP address registered during activation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle size={24} className="text-emerald-400" />
                Permitted Uses
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Use the script on the number of servers specified by your license type</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Modify the script&apos;s configuration files for your server&apos;s needs</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Receive updates and bug fixes for the duration of your license</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Access customer support for technical assistance</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Prohibit size={24} className="text-red-400" />
                Prohibited Uses
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Prohibit size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <span>Redistribute, resell, or share the script with third parties</span>
                </li>
                <li className="flex items-start gap-3">
                  <Prohibit size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <span>Remove or modify license protection mechanisms</span>
                </li>
                <li className="flex items-start gap-3">
                  <Prohibit size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <span>Use the script on servers not registered with your license</span>
                </li>
                <li className="flex items-start gap-3">
                  <Prohibit size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <span>Claim ownership or authorship of the script</span>
                </li>
                <li className="flex items-start gap-3">
                  <Prohibit size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <span>Use the script for illegal or malicious purposes</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Globe size={24} className="text-blue-400" />
                IP-Based Licensing
              </h2>
              <p className="leading-relaxed mb-4">
                Our scripts use IP-based licensing to ensure fair use and protect against unauthorized distribution. 
                Your license key is tied to your server&apos;s IP address.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>You may update your IP address through your dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>IP changes are limited to prevent abuse</span>
                </li>
                <li className="flex items-start gap-3">
                  <Warning size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>Sharing your license key may result in license revocation</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Warning size={24} className="text-amber-400" />
                License Termination
              </h2>
              <p className="leading-relaxed">
                FreexStore reserves the right to terminate your license if you violate any terms of this agreement. 
                Upon termination, you must immediately cease using the script and remove it from all servers. 
                No refund will be provided for licenses terminated due to violations.
              </p>
            </section>

            <section className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-2">Questions?</h2>
              <p className="text-gray-400 mb-4">
                If you have questions about licensing or need to discuss special licensing arrangements, 
                please contact our team.
              </p>
              <Link href="/contact" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                Contact Us
                <ArrowLeft size={16} className="rotate-180" />
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
