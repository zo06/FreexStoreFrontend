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

  const scriptLinks = [
    { name: t('scripts.allScripts'), href: '/scripts' },
    { name: t('scripts.popular'), href: '/scripts?filter=popular' },
    { name: t('scripts.newReleases'), href: '/scripts?filter=new' },
    { name: t('scripts.freeTrials'), href: '/scripts?filter=trial' },
    ...categories.slice(0, 4).map((cat: any) => ({ name: cat.name, href: `/scripts?category=${cat.id}` })),
  ];

  const accountLinks = isAuthenticated
    ? [
        { name: t('account.dashboard'), href: '/dashboard' },
        { name: t('account.myLicenses'), href: '/dashboard' },
      ]
    : [
        { name: t('account.login'), href: '/auth/login' },
        { name: t('account.register'), href: '/auth/register' },
        { name: t('account.dashboard'), href: '/dashboard' },
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

  const linkClass = 'text-[#aaa] hover:text-[#51a2ff] text-sm transition-colors duration-150';

  return (
    <footer
      className="bg-[#0d0d0d]"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      itemScope
      itemType="https://schema.org/WPFooter"
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-2 lg:mb-0">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <span className="w-1 h-5 rounded-full bg-[#51a2ff] flex-shrink-0" style={{ boxShadow: '0 0 8px rgba(81,162,255,0.6)' }} />
              <span className="text-white font-black text-[1.2rem] leading-none tracking-tight">Free<span className="text-[#51a2ff]">X</span></span>
            </Link>
            <p className="text-[#555] text-sm leading-relaxed mb-6 max-w-xs">
              {t('description')}
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-[#444] hover:text-[#51a2ff] transition-colors"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Scripts */}
          <nav className="col-span-1" aria-label="Scripts navigation">
            <h3 className="text-[#ccc] text-xs font-semibold uppercase tracking-widest mb-4">{t('sections.scripts')}</h3>
            <ul className="space-y-2.5" itemScope itemType="https://schema.org/SiteNavigationElement">
              {scriptLinks.map((l: any) => (
                <li key={l.name} itemProp="name">
                  <Link href={l.href} className={linkClass} itemProp="url">{l.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Account */}
          <nav className="col-span-1" aria-label="Account navigation">
            <h3 className="text-[#ccc] text-xs font-semibold uppercase tracking-widest mb-4">{t('sections.account')}</h3>
            <ul className="space-y-2.5" itemScope itemType="https://schema.org/SiteNavigationElement">
              {accountLinks.map((l: any) => (
                <li key={l.name} itemProp="name">
                  <Link href={l.href} className={linkClass} itemProp="url">{l.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support */}
          <nav className="col-span-1" aria-label="Support navigation">
            <h3 className="text-[#ccc] text-xs font-semibold uppercase tracking-widest mb-4">{t('sections.support')}</h3>
            <ul className="space-y-2.5" itemScope itemType="https://schema.org/SiteNavigationElement">
              {supportLinks.map((l: any) => (
                <li key={l.name} itemProp="name">
                  {l.external ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className={`${linkClass} inline-flex items-center gap-1`} itemProp="url">
                      {l.name} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <Link href={l.href} className={linkClass} itemProp="url">{l.name}</Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav className="col-span-1" aria-label="Legal navigation">
            <h3 className="text-[#ccc] text-xs font-semibold uppercase tracking-widest mb-4">{t('sections.legal')}</h3>
            <ul className="space-y-2.5" itemScope itemType="https://schema.org/SiteNavigationElement">
              {legalLinks.map((l: any) => (
                <li key={l.name} itemProp="name">
                  <Link href={l.href} className={linkClass} itemProp="url">{l.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Need help bar */}
        <div className="border-t border-white/[0.06] pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="text-center md:text-left">
              <h4 className="text-white font-semibold text-sm mb-0.5">{t('needHelp.title')}</h4>
              <p className="text-[#555] text-sm">{t('needHelp.description')}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/contact">
                <button className="btn-ghost btn-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {t('buttons.contactUs')}
                </button>
              </Link>
              <a href="https://discord.gg/freexstore" target="_blank" rel="noopener noreferrer">
                <button className="btn-primary btn-sm flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  {t('buttons.joinDiscord')}
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[#444] text-sm" itemProp="copyrightNotice">
            © {currentYear} <span itemProp="copyrightHolder">FreexStore</span>. {t('allRightsReserved')}
          </p>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/sitemap.xml" className="text-[#444] hover:text-[#666] transition-colors">
              {t('sitemap')}
            </Link>
            <span className="text-[#333]">·</span>
            <span className="text-[#444]">
              {t('madeWith')} <Heart className="w-3.5 h-3.5 inline text-red-500/70" /> {t('forFiveM')}
            </span>
          </div>
        </div>
      </div>

      {/* Hidden SEO */}
      <div className="hidden" aria-hidden="true">
        <span>FiveM Scripts</span><span>FiveM NUI</span><span>FiveM Store</span>
        <span>Premium FiveM Scripts</span><span>QBCore Scripts</span><span>ESX Scripts</span>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'FreexStore',
            url: 'https://freexstores.com',
            logo: 'https://freexstores.com/FreexLogo.png',
            contactPoint: { '@type': 'ContactPoint', contactType: 'Customer Support', email: 'freexstores@gmail.com', availableLanguage: ['English', 'Arabic'] },
            sameAs: ['https://discord.gg/aTEmKr4K7k', 'https://twitter.com/freexstore', 'https://github.com/freexstore'],
          }),
        }}
      />
    </footer>
  );
}
