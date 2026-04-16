'use client';

import Link from 'next/link';
import { Zap, Star, Rocket, Globe, Users, Flame, Search, Gift, Infinity as InfinityIcon, Shield, Check, ChevronRight, ArrowRight, Package, Download, Clock, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { useTranslations } from 'next-intl';

/* ─── Section header helper ─────────────────────────────────── */
function SectionHeader({
  badge,
  badgeIcon: BadgeIcon,
  title,
  highlight,
  subtitle,
  align = 'center',
}: {
  badge: string;
  badgeIcon?: React.ElementType;
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: 'center' | 'left';
}) {
  return (
    <div className={`mb-14 ${align === 'center' ? 'text-center' : ''}`}>
      <div className={`inline-flex items-center gap-2 badge-blue mb-4 ${align === 'center' ? '' : ''}`}>
        {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5" />}
        <span>{badge}</span>
      </div>
      <h2 className="text-[2rem] sm:text-[2.5rem] font-black text-white leading-[1.2] mb-3">
        {title}{highlight && <> <span className="text-[#51a2ff]">{highlight}</span></>}
      </h2>
      {subtitle && <p className="text-[#777] text-base max-w-xl leading-relaxed mx-auto">{subtitle}</p>}
    </div>
  );
}

export default function Home() {
  const t = useTranslations('home');
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'en';
  const { user, isAuthenticated } = useAuth();
  const [showTrialCTA, setShowTrialCTA] = useState(true);
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const [featuredScripts, setFeaturedScripts] = useState<any[]>([]);
  const [isLoadingScripts, setIsLoadingScripts] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const response: any = await apiClient.get('/scripts/active');
        const scripts = response.data?.data || response.data || [];
        const featured = scripts.filter((s: any) => s.popular || s.new).slice(0, 4);
        if (featured.length < 4) {
          const rest = scripts.filter((s: any) => !featured.includes(s)).slice(0, 4 - featured.length);
          featured.push(...rest);
        }
        setFeaturedScripts(featured.slice(0, 4));
      } catch { /* silent */ }
      finally { setIsLoadingScripts(false); }
    };
    fetchScripts();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) { setShowTrialCTA(true); return; }
    setShowTrialCTA(!user.trialStartAt);
  }, [isAuthenticated, user]);

  const handleStartTrial = () => {
    if (!isAuthenticated) { router.push('/auth/register'); return; }
    if (user?.trialStartAt) {
      const end = new Date(user.trialEndAt as string);
      if (end > new Date()) {
        toast.error('You already have an active trial!');
        router.push('/dashboard');
      } else {
        toast.error('Your trial period has ended. Please purchase a license.');
      }
      return;
    }
    router.push('/scripts');
    toast.success('Browse scripts and click "Start Free Trial" on any script!');
  };

  const testimonials = [
    { quote: t('testimonials.quote1'), author: t('testimonials.author1'), role: t('testimonials.role1') },
    { quote: t('testimonials.quote2'), author: t('testimonials.author2'), role: t('testimonials.role2') },
    { quote: t('testimonials.quote3'), author: t('testimonials.author3'), role: t('testimonials.role3') },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] overflow-x-hidden">

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <div className="hero-glow" />
        <div className="absolute inset-0 section-dots opacity-50 pointer-events-none" />

        <div className="page-container relative z-10 text-center py-24">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 badge-blue mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-[#51a2ff] animate-pulse" />
            <span>{t('hero.badge')}</span>
          </div>

          {/* Heading — 48-56px, line-height 1.3 */}
          <h1
            className={`font-black text-white mb-5 ${locale === 'ar' ? 'leading-[1.4]' : ''}`}
            style={{ fontSize: 'clamp(2.75rem, 5vw, 3.5rem)', lineHeight: 1.3, letterSpacing: '-0.02em' }}
          >
            {t('hero.title1')}{' '}
            <span className="text-[#51a2ff]">{t('hero.title2')}</span>
          </h1>

          {/* Subtitle with 32px gap before buttons */}
          <p className="text-[#777] text-lg max-w-xl mx-auto leading-relaxed" style={{ marginBottom: '2rem' }}>
            {t('hero.description')}
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center" style={{ marginBottom: '5rem' }}>
            <Link href={`/${locale}/scripts`}>
              <button className="btn-primary text-[0.9375rem] px-7 py-3">
                <Rocket className="w-4 h-4" />
                {t('hero.exploreScripts')}
              </button>
            </Link>
            {!user && (
              <Link href={`/${locale}/auth/register`}>
                {/* Ghost: white border + white text */}
                <button
                  className="inline-flex items-center justify-center gap-2 font-bold text-[0.9375rem] px-7 py-3 rounded-full bg-transparent text-white border border-white/25 hover:border-white/50 hover:bg-white/5 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  {t('hero.getStartedFree')}
                </button>
              </Link>
            )}
          </div>

          {/* Hero stats — no boxes, just numbers */}
          <div
            className="flex flex-wrap justify-center items-center"
            style={{ gap: '4rem' }}
          >
            {[
              { value: '500+', label: t('hero.premiumScripts') },
              { value: '10K+', label: t('hero.happyCustomers') },
              { value: '24/7',  label: t('hero.expertSupport') },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="font-black text-[#51a2ff]" style={{ fontSize: '2.75rem', lineHeight: 1, letterSpacing: '-0.02em' }}>
                  {s.value}
                </div>
                <p className="text-[#666] text-sm mt-1.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="page-section bg-[#131313]">
        <div className="page-container">
          <SectionHeader
            badge={t('howItWorks.badge')}
            badgeIcon={Rocket}
            title={t('howItWorks.title')}
            highlight={t('howItWorks.highlight')}
            subtitle={t('howItWorks.subtitle')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto relative">
            <div className="hidden sm:block absolute top-[3.25rem] left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] h-px bg-[rgba(81,162,255,0.18)]" />
            {[
              { step: '1', icon: Search,      title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc') },
              { step: '2', icon: Gift,        title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc') },
              { step: '3', icon: InfinityIcon, title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc') },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="card-base p-7 text-center relative">
                <div className="absolute -top-[1.125rem] left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#51a2ff] flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-[rgba(81,162,255,0.25)]">
                  {step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-[rgba(81,162,255,0.08)] border border-[rgba(81,162,255,0.15)] flex items-center justify-center mx-auto mb-4 mt-3">
                  <Icon className="w-6 h-6 text-[#51a2ff]" />
                </div>
                <h3 className="text-white font-bold text-base mb-2">{title}</h3>
                <p className="text-[#777] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURED SCRIPTS
      ══════════════════════════════════════════ */}
      <section className="page-section bg-[#0a0a0a]">
        <div className="page-container">
          {/* Header row */}
          <div className="flex items-end justify-between mb-12 flex-wrap gap-5">
            <div>
              <div className="inline-flex items-center gap-2 badge-blue mb-3">
                <Star className="w-3.5 h-3.5" />
                <span>{t('featuredScripts.badge')}</span>
              </div>
              <h2 className="text-[2rem] sm:text-[2.5rem] font-black text-white leading-[1.2] mb-1">
                {t('featuredScripts.title')}
              </h2>
              <p className="text-[#777] text-sm">{t('featuredScripts.description')}</p>
            </div>
            <Link href={`/${locale}/scripts`}>
              <button className="btn-ghost btn-sm flex items-center gap-1.5 flex-shrink-0">
                {t('featuredScripts.viewAll')} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>

          {/* Grid */}
          {isLoadingScripts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1,2,3,4].map((i) => (
                <div key={i} className="card-base overflow-hidden">
                  <div className="w-full bg-[#1a1a1a] animate-shimmer" style={{ aspectRatio: '16/9' }} />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-[#1e1e1e] rounded-full w-1/3 animate-shimmer" />
                    <div className="h-4 bg-[#1e1e1e] rounded-full w-3/4 animate-shimmer" />
                    <div className="h-3 bg-[#1e1e1e] rounded-full w-full animate-shimmer" />
                    <div className="h-8 bg-[#1e1e1e] rounded-full w-1/2 mx-auto animate-shimmer mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredScripts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredScripts.map((script) => (
                <Link href={`/${locale}/script/${script.slug || script.id}`} key={script.id}>
                  <div
                    className="script-card group cursor-pointer h-full flex flex-col"
                    style={{
                      background: '#151515',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(81,162,255,0.08)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  >
                    {/* Thumbnail — forced 16:9 */}
                    <div className="relative w-full bg-[#1a1a1a] overflow-hidden flex-shrink-0" style={{ aspectRatio: '16/9' }}>
                      {script.imageUrl ? (
                        <img
                          src={script.imageUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${script.imageUrl}` : script.imageUrl}
                          alt={script.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          style={{ position: 'absolute', inset: 0 }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Zap className="w-8 h-8 text-[#2a2a2a]" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {/* Status badge top-left */}
                      {(script.popular || script.new) && (
                        <span className={`absolute top-2.5 ${locale === 'ar' ? 'right-2.5' : 'left-2.5'} inline-flex items-center gap-1 text-[10px] font-bold text-white bg-[#51a2ff] rounded-full px-2.5 py-1`}>
                          {script.popular ? <><Flame className="w-2.5 h-2.5" /> {t('featuredScripts.popular')}</> : t('featuredScripts.new')}
                        </span>
                      )}

                      {/* Price pill top-right */}
                      <span className={`absolute top-2.5 ${locale === 'ar' ? 'left-2.5' : 'right-2.5'} text-xs font-black text-white bg-[#51a2ff] rounded-full px-2.5 py-1 leading-none`}>
                        ${script.price || script.foreverPrice || '0'}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-5 flex flex-col flex-1">
                      <span className="badge-blue text-[11px] mb-3 self-start">{script.category?.name || 'Script'}</span>
                      <h3 className="text-white font-bold text-sm mb-2 line-clamp-1 group-hover:text-[#51a2ff] transition-colors leading-snug">
                        {script.name}
                      </h3>
                      <p className="text-[#777] text-xs line-clamp-2 flex-1 leading-relaxed mb-4">
                        {script.description}
                      </p>
                      {/* Ghost button, centered, not full-width */}
                      <div className="flex justify-center">
                        <button className="btn-ghost btn-sm">
                          {t('featuredScripts.viewDetails')}
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#666] py-10 text-sm">{t('featuredScripts.noScripts')}</p>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURE — Scripts built for serious servers
          (text left, code snippet right)
      ══════════════════════════════════════════ */}
      <section className="page-section bg-[#131313] section-dots">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Text — max 480px */}
            <div style={{ maxWidth: '480px' }}>
              <div className="badge-blue mb-5 inline-flex"><Shield className="w-3.5 h-3.5" /><span>Premium Quality</span></div>
              <h2 className="text-[2rem] sm:text-[2.5rem] font-black text-white mb-4 leading-[1.2]">
                Scripts built for<br />
                <span className="text-[#51a2ff]">serious servers</span>
              </h2>
              <p className="text-[#777] mb-7 leading-relaxed text-sm">
                Every script is tested, optimised, and ready for production. No bloat, no issues — just clean, performant code that works on any FiveM framework.
              </p>
              <ul className="space-y-3 mb-8">
                {['Zero performance impact', 'ESX & QBCore compatible', 'Regular updates included', 'Full source code access'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[#ccc] text-sm">
                    <span className="w-5 h-5 rounded-full bg-[rgba(81,162,255,0.12)] border border-[rgba(81,162,255,0.2)] flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-[#51a2ff]" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href={`/${locale}/scripts`}>
                <button className="btn-primary">Browse Scripts <ChevronRight className="w-4 h-4" /></button>
              </Link>
            </div>

            {/* Code snippet mockup */}
            <div className="relative">
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: '#111',
                  border: '1px solid rgba(255,255,255,0.07)',
                  transform: 'perspective(900px) rotateY(-4deg) rotateX(2deg)',
                  boxShadow: '20px 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(81,162,255,0.05)',
                }}
              >
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]" style={{ background: '#0d0d0d' }}>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28ca41]" />
                  <span className="ml-3 text-[#444] text-xs font-mono">freex_hud / config.lua</span>
                </div>
                {/* Code lines */}
                <div className="p-5 font-mono text-xs leading-6">
                  {[
                    { color: '#666',    text: '-- FreexStore HUD Config' },
                    { color: '#888',    text: '' },
                    { color: '#51a2ff', text: 'Config', extra: { color: '#ccc', text: ' = {}' } },
                    { color: '#888',    text: '' },
                    { color: '#51a2ff', text: 'Config.Enabled', extra: { color: '#ccc', text: ' = true' } },
                    { color: '#51a2ff', text: 'Config.Framework', extra: { color: '#aaa', text: " = 'esx'" } },
                    { color: '#51a2ff', text: 'Config.ShowMinimap', extra: { color: '#ccc', text: ' = true' } },
                    { color: '#51a2ff', text: 'Config.HudStyle', extra: { color: '#aaa', text: " = 'modern'" } },
                    { color: '#888',    text: '' },
                    { color: '#666',    text: '-- Performance optimised' },
                    { color: '#666',    text: '-- 0.01ms idle usage' },
                  ].map((line, i) => (
                    <div key={i} style={{ color: line.color }}>
                      {line.text}
                      {line.extra && <span style={{ color: line.extra.color }}>{line.extra.text}</span>}
                    </div>
                  ))}
                </div>
              </div>
              {/* Subtle glow below card */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-64 h-16 bg-[rgba(81,162,255,0.07)] blur-2xl rounded-full pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURE — Download in seconds
          (image-style left, stats right)
      ══════════════════════════════════════════ */}
      <section className="page-section bg-[#0a0a0a]">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Stats grid — icon + number + label cards with #141414 bg + blue top border */}
            <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
              {[
                { icon: Download, value: '< 1s',  label: 'Delivery time' },
                { icon: BarChart3, value: '99.9%', label: 'Uptime SLA' },
                { icon: Package,   value: '500+',  label: 'Scripts available' },
                { icon: Clock,     value: '24/7',  label: 'Support coverage' },
              ].map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-start p-5 rounded-xl"
                  style={{
                    background: '#141414',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderTop: '2px solid rgba(81,162,255,0.2)',
                  }}
                >
                  <Icon className="w-5 h-5 text-[#51a2ff] mb-3 opacity-80" />
                  <div className="font-black text-white text-2xl leading-none mb-1">{value}</div>
                  <div className="text-[#666] text-xs">{label}</div>
                </div>
              ))}
            </div>

            {/* Text */}
            <div className="order-1 lg:order-2" style={{ maxWidth: '480px' }}>
              <div className="badge-blue mb-5 inline-flex"><Zap className="w-3.5 h-3.5" /><span>Instant Access</span></div>
              <h2 className="text-[2rem] sm:text-[2.5rem] font-black text-white mb-4 leading-[1.2]">
                Download in seconds,<br />
                <span className="text-[#51a2ff]">deploy in minutes</span>
              </h2>
              <p className="text-[#777] leading-relaxed text-sm mb-7">
                After purchase you get instant access to your scripts through your personal dashboard. No waiting, no approval needed — it's yours the moment you pay.
              </p>
              <Link href={`/${locale}/auth/register`}>
                <button className="btn-primary">Get Started Free <ChevronRight className="w-4 h-4" /></button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="page-section bg-[#131313]">
        <div className="page-container">
          <SectionHeader
            badge={t('testimonials.badge')}
            badgeIcon={Star}
            title={t('testimonials.title')}
            subtitle={t('testimonials.subtitle')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {testimonials.map((item, i) => (
              <div
                key={i}
                style={{
                  background: '#151515',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderLeft: '3px solid #51a2ff',
                  borderRadius: '14px',
                  padding: '1.5rem',
                }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 text-[#51a2ff] fill-[#51a2ff]" />
                  ))}
                </div>
                <p className="text-[#bbb] text-sm leading-relaxed mb-5">"{item.quote}"</p>
                {/* Avatar + name */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[rgba(81,162,255,0.12)] border border-[rgba(81,162,255,0.18)] flex items-center justify-center text-xs font-bold text-[#51a2ff] flex-shrink-0">
                    {item.author.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white text-xs font-semibold">{item.author}</div>
                    <div className="text-[#555] text-[11px]">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════ */}
      {showTrialCTA && (
        <section
          className="page-section"
          style={{ background: 'linear-gradient(135deg, #0d1f3c 0%, #0a1628 50%, #0d1f3c 100%)' }}
        >
          {/* Subtle blue radial */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(81,162,255,0.08) 0%, transparent 70%)' }} />
          <div className="page-container relative z-10 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-[#51a2ff] text-sm font-semibold" style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#51a2ff] animate-pulse" />
                {t('cta.badge')}
              </div>
              <h2
                className="font-black text-white mb-4 leading-[1.2]"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
              >
                {t('cta.title')}
              </h2>
              <p className="text-[#8db4d4] text-base mb-10 leading-relaxed">
                {t('cta.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {/* Primary: solid white, dark text */}
                <button
                  onClick={handleStartTrial}
                  disabled={isStartingTrial}
                  className="inline-flex items-center justify-center gap-2 font-bold text-[0.9375rem] px-7 py-3 rounded-full transition-colors disabled:opacity-60"
                  style={{ background: '#fff', color: '#0d1f3c' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#e8f2ff')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  <Rocket className="w-4 h-4" />
                  {isStartingTrial ? t('cta.starting') : t('cta.startTrial')}
                </button>
                {/* Secondary: ghost white outline */}
                <Link href={`/${locale}/scripts`}>
                  <button
                    className="inline-flex items-center justify-center gap-2 font-bold text-[0.9375rem] px-7 py-3 rounded-full text-white transition-colors"
                    style={{ border: '1.5px solid rgba(255,255,255,0.25)', background: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {t('hero.exploreScripts')}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
