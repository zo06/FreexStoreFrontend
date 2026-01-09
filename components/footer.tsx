'use client';

import Link from 'next/link';
import { Zap, Mail, MessageCircle, Github, Twitter, ExternalLink, Heart, Star, TrendingUp, Gift, User, LayoutDashboard, Key } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useActiveCategories } from '@/lib/simple-data-fetcher';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();
  const { isAuthenticated } = useAuth();
  const { data: categoriesData } = useActiveCategories();
  const categories = Array.isArray(categoriesData) ? categoriesData : ((categoriesData as any)?.data || []);

  // Dynamic script categories from API
  const scriptLinks = [
    { name: t('scripts.allScripts'), href: '/scripts', icon: Star },
    { name: t('scripts.popular'), href: '/scripts?filter=popular', icon: TrendingUp },
    { name: t('scripts.newReleases'), href: '/scripts?filter=new', icon: Zap },
    { name: t('scripts.freeTrials'), href: '/scripts?filter=trial', icon: Gift },
    ...categories.slice(0, 4).map((cat: any) => ({
      name: cat.name,
      href: `/scripts?category=${cat.id}`,
      icon: Star
    }))
  ];

  // Account links - conditional based on auth state
  const accountLinks = isAuthenticated 
    ? [
        { name: t('account.dashboard'), href: '/dashboard', icon: LayoutDashboard },
        { name: t('account.myLicenses'), href: '/dashboard', icon: Key },
      ]
    : [
        { name: t('account.login'), href: '/auth/login', icon: User },
        { name: t('account.register'), href: '/auth/register', icon: User },
        { name: t('account.dashboard'), href: '/dashboard', icon: LayoutDashboard },
      ];

  const supportLinks = [
    { name: t('support.contactUs'), href: '/contact', external: false },
    { name: t('support.customRequest'), href: '/custom-request', external: false },
    { name: t('support.discordServer'), href: 'https://discord.gg/aTEmKr4K7k', external: true },
  ];

  const legalLinks = [
    { name: t('legal.termsOfService'), href: '/auth/terms' },
    { name: t('legal.privacyPolicy'), href: '/auth/privacy' },
    { name: t('legal.refundPolicy'), href: '/auth/refund' },
    { name: t('legal.licenseAgreement'), href: '/auth/license' },
  ];

  const socialLinks = [
    { name: 'Discord', href: 'https://discord.gg/freexstore', icon: MessageCircle },
    { name: 'Twitter', href: 'https://twitter.com/freexstore', icon: Twitter },
    { name: 'GitHub', href: 'https://github.com/freexstore', icon: Github },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-transparent via-gray-950/50 to-gray-950 border-t border-white/5" itemScope itemType="https://schema.org/WPFooter">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 md:w-[600px] md:h-[300px] bg-gradient-to-t from-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 py-16 lg:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-6 lg:mb-0">
            <Link href="/" className="inline-flex items-center gap-2 mb-4" aria-label="FreexStore Home">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                FreexStore
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              {t('description')}
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 rounded-xl flex items-center justify-center transition-all duration-300 group"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Scripts Links */}
          <nav className="col-span-1" aria-label="Scripts navigation">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{t('sections.scripts')}</h3>
            <ul className="space-y-3" itemScope itemType="https://schema.org/SiteNavigationElement">
              {scriptLinks.map((link: any) => (
                <li key={link.name} itemProp="name">
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-cyan-400 text-sm transition-colors duration-200 inline-flex items-center gap-1.5"
                    itemProp="url"
                  >
                    {link.icon && <link.icon className="w-3.5 h-3.5" />}
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Account Links */}
          <nav className="col-span-1" aria-label="Account navigation">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{t('sections.account')}</h3>
            <ul className="space-y-3" itemScope itemType="https://schema.org/SiteNavigationElement">
              {accountLinks.map((link: any) => (
                <li key={link.name} itemProp="name">
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-cyan-400 text-sm transition-colors duration-200 inline-flex items-center gap-1.5"
                    itemProp="url"
                  >
                    {link.icon && <link.icon className="w-3.5 h-3.5" />}
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support Links */}
          <nav className="col-span-1" aria-label="Support navigation">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{t('sections.support')}</h3>
            <ul className="space-y-3" itemScope itemType="https://schema.org/SiteNavigationElement">
              {supportLinks.map((link: any) => (
                <li key={link.name} itemProp="name">
                  {link.external ? (
                    <a 
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-cyan-400 text-sm transition-colors duration-200 inline-flex items-center gap-1"
                      itemProp="url"
                    >
                      {link.name}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <Link 
                      href={link.href} 
                      className="text-gray-400 hover:text-cyan-400 text-sm transition-colors duration-200"
                      itemProp="url"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal Links */}
          <nav className="col-span-1" aria-label="Legal navigation">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{t('sections.legal')}</h3>
            <ul className="space-y-3" itemScope itemType="https://schema.org/SiteNavigationElement">
              {legalLinks.map((link: any) => (
                <li key={link.name} itemProp="name">
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-cyan-400 text-sm transition-colors duration-200"
                    itemProp="url"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Newsletter / Contact Section */}
        <div className="border-t border-white/5 pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-start">
              <h4 className="text-white font-semibold mb-1">{t('needHelp.title')}</h4>
              <p className="text-gray-400 text-sm">{t('needHelp.description')}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/contact">
                <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 rounded-xl text-sm font-medium text-gray-300 hover:text-cyan-300 transition-all duration-300">
                  <Mail className="w-4 h-4" />
                  {t('buttons.contactUs')}
                </button>
              </Link>
              <a 
                href="https://discord.gg/freexstore" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl text-sm font-medium text-white transition-all duration-300 shadow-lg shadow-cyan-500/20"
              >
                <MessageCircle className="w-4 h-4" />
                {t('buttons.joinDiscord')}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-gray-500 text-sm text-center md:text-start" itemProp="copyrightNotice">
              © {currentYear} <span itemProp="copyrightHolder">FreexStore</span>. {t('allRightsReserved')}
            </p>
            
            {/* SEO Keywords (hidden but crawlable) */}
            <div className="hidden" aria-hidden="true">
              <span>FiveM Scripts</span>
              <span>FiveM NUI</span>
              <span>FiveM Store</span>
              <span>FiveM Resources</span>
              <span>Premium FiveM Scripts</span>
              <span>FiveM HUD</span>
              <span>FiveM Menu</span>
              <span>QBCore Scripts</span>
              <span>ESX Scripts</span>
            </div>

            {/* Additional Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link href="/sitemap.xml" className="text-gray-500 hover:text-gray-400 transition-colors">
                {t('sitemap')}
              </Link>
              <span className="text-gray-700">•</span>
              <span className="text-gray-500">
                {t('madeWith')} <Heart className="w-4 h-4 inline text-red-400" /> {t('forFiveM')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Schema.org Organization markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'FreexStore',
            url: 'https://freexstores.com',
            logo: 'https://freexstores.com/FreexLogo.png',
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'Customer Support',
              email: 'freexstores@gmail.com',
              availableLanguage: ['English', 'Arabic']
            },
            sameAs: [
              'https://discord.gg/aTEmKr4K7k',
              'https://twitter.com/freexstore',
              'https://github.com/freexstore'
            ]
          })
        }}
      />
    </footer>
  );
}
