'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LogOut, Globe, Shield, Crown, ChevronDown, Home, Package, LayoutDashboard, Command, Clock, ShoppingCart } from 'lucide-react';
import LicensesIpModal from '@/components/licenses-ip-modal';
import LanguageSwitcher from '@/components/language-switcher';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/lib/stores/cart-store';
import CartDrawer from '@/components/cart-drawer';

export default function Navigation() {
  const t = useTranslations('nav');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showIpModal, setShowIpModal] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { getCount } = useCartStore();
  const pathname = usePathname();
  const { user, isAdmin, logout, isLoading } = useAuth();

  const isTrialActive = !!user?.trialEndAt && new Date(user.trialEndAt).getTime() > Date.now();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setShowUserMenu(false);
  }, [pathname]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (showUserMenu && !(e.target as Element).closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showUserMenu]);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: '/', label: t('home'), icon: Home },
    { href: '/scripts', label: t('scripts'), icon: Package },
    ...(user ? [{ href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard }] : []),
    ...(isAdmin ? [{ href: '/hr/dashboard', label: 'Work Duty', icon: Clock }] : []),
    ...(isAdmin ? [{ href: '/admin', label: t('admin'), icon: Command }] : []),
  ];

  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      {/* ── Main nav bar ─────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300"
        style={{
          background: isScrolled
            ? 'rgba(10,10,10,0.92)'
            : 'rgba(10,10,10,0.7)',
          backdropFilter: 'blur(16px)',
          borderBottom: isScrolled
            ? '1px solid rgba(255,255,255,0.07)'
            : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <span className="w-1 h-5 rounded-full bg-[#51a2ff] flex-shrink-0" style={{ boxShadow: '0 0 8px rgba(81,162,255,0.6)' }} />
              <span className="text-white font-black text-[1.2rem] leading-none tracking-tight">
                Free<span className="text-[#51a2ff]">X</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'text-[#51a2ff] bg-[rgba(81,162,255,0.1)]'
                      : 'text-[#888] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-2">
              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                aria-label="Open cart"
                className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[#888] hover:text-white hover:bg-white/5 transition-colors"
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                {getCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 flex items-center justify-center text-[10px] font-bold text-white bg-[#51a2ff] rounded-full">
                    {getCount()}
                  </span>
                )}
              </button>

              {/* Language */}
              <LanguageSwitcher />

              {/* User */}
              {user ? (
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1a1a1a] border border-white/8 hover:border-white/15 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[rgba(81,162,255,0.2)] border border-[rgba(81,162,255,0.3)] flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[#51a2ff] text-xs font-bold">
                          {(user.discordUsername || user.username || 'U').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${isAdmin ? 'text-[#51a2ff]' : isTrialActive ? 'text-emerald-400' : 'text-white'}`}>
                      {user.discordUsername || user.username}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-[#555] transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#111] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl shadow-black/60 animate-fade-in">
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-white/[0.06]">
                        <p className="text-white text-sm font-semibold">{user.discordUsername || user.username}</p>
                        <p className="text-[#555] text-xs">{isAdmin ? t('administrator') : t('member')}</p>
                      </div>
                      {/* Items */}
                      <div className="p-1.5">
                        <button
                          onClick={() => { setShowUserMenu(false); window.location.href = '/dashboard'; }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#888] hover:text-white hover:bg-white/[0.05] transition-colors text-sm text-start"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#51a2ff]" />
                          {t('dashboard')}
                        </button>
                        <button
                          onClick={() => { setShowUserMenu(false); setShowIpModal(true); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#888] hover:text-white hover:bg-white/[0.05] transition-colors text-sm text-start"
                        >
                          <Globe className="w-4 h-4 text-[#51a2ff]" />
                          {t('ipSettings')}
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => { setShowUserMenu(false); window.location.href = '/admin'; }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#51a2ff] hover:bg-[rgba(81,162,255,0.08)] transition-colors text-sm text-start"
                          >
                            <Shield className="w-4 h-4" />
                            {t('adminPanel')}
                          </button>
                        )}
                      </div>
                      {/* Logout */}
                      <div className="p-1.5 border-t border-white/[0.06]">
                        <button
                          onClick={() => { logout(); setShowUserMenu(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm text-start"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('signOut')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : isLoading ? (
                <div className="w-8 h-8 rounded-full border-2 border-[#333] border-t-[#51a2ff] animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login" className="text-[#888] hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                    {t('login')}
                  </Link>
                  <Link href="/auth/register" className="btn-primary btn-sm">
                    {t('getStarted')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg bg-[#1a1a1a] border border-white/[0.08]"
            >
              <span className={`w-5 h-0.5 bg-white rounded-full transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`w-5 h-0.5 bg-white rounded-full transition-all ${isMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`w-5 h-0.5 bg-white rounded-full transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/[0.06] bg-[#0a0a0a]">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'text-[#51a2ff] bg-[rgba(81,162,255,0.1)]'
                      : 'text-[#888] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="px-4 pb-4 border-t border-white/[0.06] pt-4 flex items-center justify-between">
              <LanguageSwitcher />
              {user ? (
                <button
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="flex items-center gap-2 text-red-400 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  {t('signOut')}
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} className="text-[#888] text-sm px-3 py-2 rounded-lg hover:bg-white/5">
                    {t('login')}
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMenuOpen(false)} className="btn-primary btn-sm">
                    {t('getStarted')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Modals */}
      <LicensesIpModal isOpen={showIpModal} onClose={() => setShowIpModal(false)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
