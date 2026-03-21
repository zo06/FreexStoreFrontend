'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { Clock, Shield, Home, LogOut, LayoutDashboard, ChevronDown, Crown, Menu, X } from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import { useLanguage } from '../../../lib/contexts/LanguageContext';

export default function HrLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const lang = params?.lang || 'en';
  const { user, isAdmin, logout } = useAuth();
  const { t } = useLanguage();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);
  useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (showUserMenu && !(e.target as Element).closest('.hr-user-menu')) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showUserMenu]);

  const tabs = [
    { href: `/${lang}/hr/dashboard`, label: t('hr.layout.mySession'), icon: Clock },
    ...(isAdmin ? [{ href: `/${lang}/hr/admin`, label: t('hr.layout.hrAdmin'), icon: Shield }] : []),
  ];

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <div className="min-h-screen text-white">
      {/* Same background as admin panel */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0a1628] to-slate-950" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(147,197,253,0.15),transparent)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_50%_50%_at_100%_100%,rgba(147,197,253,0.08),transparent)]" />
        <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-sky-400/[0.07] rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-blue-400/[0.05] rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-10 left-1/4 w-[600px] h-[600px] bg-sky-300/[0.04] rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(147,197,253,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(147,197,253,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Top header bar — same style as admin */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16">
        <div className="h-full mx-3 mt-3 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between px-4 h-full">

            {/* Left — Brand + tabs */}
            <div className="flex items-center gap-6">
              {/* Brand */}
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-blue-500 rounded-xl opacity-40 blur" />
                  <div className="relative flex items-center justify-center w-9 h-9 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-white leading-none">{t('hr.layout.title')}</p>
                  <p className="text-[10px] text-sky-400/70 uppercase tracking-wider">{t('hr.layout.brand')}</p>
                </div>
              </div>

              {/* Desktop tabs */}
              <nav className="hidden md:flex items-center gap-1">
                {tabs.map(tab => {
                  const active = isActive(tab.href);
                  const Icon = tab.icon;
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-lg shadow-sky-500/10'
                          : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right — actions */}
            <div className="flex items-center gap-2">
              {/* Back to site */}
              <Link
                href={`/${lang}`}
                className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.03] border border-white/10 text-gray-400 hover:text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/30 transition-all"
              >
                <Home className="w-4 h-4" />
              </Link>

              {/* User menu */}
              <div className="relative hr-user-menu">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-2xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] hover:border-sky-500/30 transition-all"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-sky-400 via-blue-500 to-sky-600 rounded-xl">
                    <span className="text-xs font-bold text-white">
                      {(user?.firstName || user?.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-white max-w-[100px] truncate">
                    {user?.firstName || user?.username}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border shadow-2xl backdrop-blur-xl bg-slate-900/95 border-white/10 overflow-hidden">
                    <div className="p-3 bg-gradient-to-r from-sky-500/10 to-blue-500/10 border-b border-white/10">
                      <p className="text-sm font-semibold text-white">{user?.firstName || user?.username}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Crown className="w-3 h-3 text-amber-400" />
                        <span className="text-xs text-amber-400">{isAdmin ? t('hr.layout.admin') : t('hr.layout.developer')}</span>
                      </div>
                    </div>
                    <div className="p-2 space-y-0.5">
                      <button
                        onClick={() => { setShowUserMenu(false); router.push(`/${lang}/dashboard`); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        {t('hr.layout.myDashboard')}
                      </button>
                      <button
                        onClick={() => { setShowUserMenu(false); router.push(`/${lang}`); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm"
                      >
                        <Home className="w-4 h-4" />
                        {t('hr.layout.backToSite')}
                      </button>
                    </div>
                    <div className="p-2 border-t border-white/10">
                      <button
                        onClick={() => { logout(); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('hr.layout.signOut')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.03] border border-white/10 text-gray-400 hover:text-sky-400 hover:bg-sky-500/10 transition-all"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile nav dropdown */}
      {isMobileMenuOpen && (
        <div className="fixed top-[76px] left-3 right-3 z-40 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl p-2 md:hidden">
          {tabs.map(tab => {
            const active = isActive(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Page content */}
      <div className="pt-[76px]">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="min-h-[calc(100vh-120px)] rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] overflow-hidden p-4 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
