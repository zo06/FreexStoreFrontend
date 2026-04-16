'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Users,
  Code2,
  Key,
  Receipt,
  Calculator,
  MessageSquare,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  UserCheck,
  FolderOpen,
  Plus,
  Tags,
  HelpCircle,
  Mail,
  Shield,
  BarChart3,
  DollarSign,
  Globe,
  Crown,
  Search,
  Home,
  TrendingUp,
  Clock,
  Star,
  Zap,
  Activity,
  FileText,
  ClipboardList,
  Ticket,
} from 'lucide-react';
import LicensesIpModal from '@/components/licenses-ip-modal';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface TodayStats {
  sales: number;
  revenue: number;
}

/* ── Sidebar nav groups ─────────────────────────────────────── */
const NAV_GROUPS = (t: (key: string) => string) => [
  {
    label: 'Overview',
    items: [
      { href: '/admin', icon: LayoutDashboard, label: t('dashboard') },
    ],
  },
  {
    label: 'Management',
    items: [
      { href: '/admin/users', icon: Users, label: t('usersLabel') },
      { href: '/admin/developers', icon: UserCheck, label: t('developersLabel') },
      {
        href: '/admin/scripts',
        icon: Code2,
        label: t('scriptsLabel'),
        hasDropdown: true,
        dropdownItems: [
          { href: '/admin/scripts', label: t('scriptsLabel'), icon: FolderOpen },
          { href: '/admin/scripts/create', label: t('addNew'), icon: Plus },
          { href: '/admin/categories', label: t('categoriesLabel'), icon: Tags },
        ],
      },
    ],
  },
  {
    label: 'Commerce',
    items: [
      {
        href: '/admin/licenses',
        icon: Key,
        label: t('licensesLabel'),
        hasLicensesDropdown: true,
        dropdownItems: [
          { href: '/admin/licenses', label: t('licensesLabel'), icon: Key },
          { href: '/admin/licenses/event-logs', label: 'Event Logs', icon: Activity },
          { href: '/admin/licenses/token-audits', label: 'Token Audits', icon: Shield },
        ],
      },
      { href: '/admin/transactions', icon: Receipt, label: t('transactionsLabel') },
      { href: '/admin/invoices', icon: FileText, label: 'Invoices' },
      { href: '/admin/coupons', icon: Ticket, label: 'Coupons' },
      { href: '/admin/accounting', icon: Calculator, label: t('accountingLabel') },
    ],
  },
  {
    label: 'Communication',
    items: [
      { href: '/admin/contact-messages', icon: Mail, label: t('contactMessagesLabel') },
      { href: '/admin/custom-requests', icon: MessageSquare, label: t('customRequestsLabel') },
      { href: '/admin/faq', icon: HelpCircle, label: t('faqLabel') },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/audit-logs', icon: ClipboardList, label: 'Audit Logs' },
      { href: '/admin/settings', icon: Settings, label: t('layout.settings') },
    ],
  },
];

/* ── Active item indicator ──────────────────────────────────── */
function NavItem({
  href,
  icon: Icon,
  label,
  isActive,
  collapsed,
  onClick,
  badge,
  isRTL,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
  badge?: React.ReactNode;
  isRTL: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group overflow-hidden ${
        collapsed ? 'justify-center' : ''
      } ${
        isActive
          ? 'text-white'
          : 'text-[#666] hover:text-[#ccc] hover:bg-[rgba(255,255,255,0.04)]'
      }`}
      style={isActive ? { background: 'rgba(81,162,255,0.09)' } : undefined}
    >
      {/* active right-edge indicator */}
      {isActive && (
        <span
          className={`absolute top-1.5 bottom-1.5 w-[3px] rounded-full bg-[#51a2ff]`}
          style={isRTL ? { left: 0 } : { right: 0 }}
        />
      )}
      <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
        isActive ? 'bg-[rgba(81,162,255,0.15)] text-[#51a2ff]' : 'text-[#555] group-hover:text-[#aaa]'
      }`}>
        <Icon className="w-4 h-4" />
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 text-start">{label}</span>
          {badge}
        </>
      )}
    </button>
  );
}

/* ── Main Layout ────────────────────────────────────────────── */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const t = useTranslations('admin');
  const params = useParams();
  const lang = params?.lang as string || 'en';
  const isRTL = lang === 'ar';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [scriptsDropdownOpen, setScriptsDropdownOpen] = useState(false);
  const [licensesDropdownOpen, setLicensesDropdownOpen] = useState(false);
  const [showIpModal, setShowIpModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
  const [todayStats, setTodayStats] = useState<TodayStats>({ sales: 0, revenue: 0 });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const SIDEBAR_W = isSidebarCollapsed ? 72 : 256;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    const fetchTodayStats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
        const p = new URLSearchParams({ startDate: today.toISOString(), endDate: tomorrow.toISOString() });
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/stats?${p}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          setTodayStats({ sales: data.successfulTransactions || 0, revenue: data.totalRevenue || 0 });
        }
      } catch { /* silent */ }
    };
    fetchTodayStats();
    const iv = setInterval(fetchTodayStats, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (pathname.startsWith('/admin/scripts') && !scriptsDropdownOpen) setScriptsDropdownOpen(true);
    if (pathname.startsWith('/admin/licenses') && !licensesDropdownOpen) setLicensesDropdownOpen(true);
  }, [pathname]);

  useEffect(() => { setIsMobileSidebarOpen(false); }, [pathname]);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setIsMobileSidebarOpen(false); };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (showUserMenu && !(e.target as Element).closest('.user-menu-container')) setShowUserMenu(false);
      if (showSearchResults && !(e.target as Element).closest('.search-container')) setShowSearchResults(false);
    };
    if (showUserMenu || showSearchResults) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showUserMenu, showSearchResults]);

  const adminPages = [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/admin', description: t('overview') },
    { icon: Users, label: t('usersLabel'), path: '/admin/users', description: t('manageUsers') },
    { icon: UserCheck, label: t('developersLabel'), path: '/admin/developers', description: t('manageDevelopers') },
    { icon: Code2, label: t('scriptsLabel'), path: '/admin/scripts', description: t('manageScripts') },
    { icon: Plus, label: t('addNew'), path: '/admin/scripts/create', description: t('addNew') },
    { icon: Tags, label: t('categoriesLabel'), path: '/admin/categories', description: t('manageCategories') },
    { icon: Key, label: t('licensesLabel'), path: '/admin/licenses', description: t('manageLicenses') },
    { icon: Receipt, label: t('transactionsLabel'), path: '/admin/transactions', description: t('viewTransactions') },
    { icon: Calculator, label: t('accountingLabel'), path: '/admin/accounting', description: t('financialReports') },
    { icon: Mail, label: t('contactMessagesLabel'), path: '/admin/contact-messages', description: t('viewMessages') },
    { icon: MessageSquare, label: t('customRequestsLabel'), path: '/admin/custom-requests', description: t('viewRequests') },
    { icon: HelpCircle, label: t('faqLabel'), path: '/admin/faq', description: t('faqLabel') },
    { icon: ClipboardList, label: 'Audit Logs', path: '/admin/audit-logs', description: 'Full trail of admin actions' },
  ];

  const filteredPages = searchQuery.trim()
    ? adminPages.filter(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    : adminPages;

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredPages.length > 0) { router.push(filteredPages[0].path); setSearchQuery(''); setShowSearchResults(false); }
    else if (e.key === 'Escape') { setSearchQuery(''); setShowSearchResults(false); }
  };

  const navigateToPage = (path: string) => { router.push(path); setSearchQuery(''); setShowSearchResults(false); setIsMobileSidebarOpen(false); };
  const handleNavigation = (path: string) => { router.push(path); setIsMobileSidebarOpen(false); };

  const isActive = (href: string) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const displayName = user?.discordUsername || user?.username || 'Admin';

  /* ── Sidebar content (shared between mobile + desktop) ─── */
  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between px-4 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-[#51a2ff]" style={{ boxShadow: '0 0 8px rgba(81,162,255,0.6)' }} />
            <span className="text-white font-black text-[1.1rem] leading-none tracking-tight">
              Free<span className="text-[#51a2ff]">X</span>
              <span className="text-[#555] text-xs font-normal ml-1.5">Admin</span>
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/admin" className="mx-auto flex items-center justify-center w-8 h-8 rounded-lg bg-[#51a2ff]/10">
            <Shield className="w-4 h-4 text-[#51a2ff]" />
          </Link>
        )}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg text-[#555] hover:text-[#aaa] hover:bg-[rgba(255,255,255,0.05)] transition-colors flex-shrink-0"
        >
          {isSidebarCollapsed
            ? (isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)
            : (isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />)
          }
        </button>
      </div>

      {/* User greeting */}
      {!collapsed && (
        <div className="px-4 py-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-[#555] text-[11px] font-medium uppercase tracking-widest mb-1.5">Logged in as</p>
          <h3 className="text-white font-bold text-base leading-tight truncate">
            Welcome, <span className="text-[#51a2ff]">{displayName}</span>
          </h3>
          <p className="text-[#444] text-xs mt-1 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_GROUPS(t).map((group) => (
          <div key={group.label} className="mb-2">
            {!collapsed && (
              <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#3a3a3a]">
                {group.label}
              </p>
            )}
            {collapsed && <div className="my-1 border-t border-[rgba(255,255,255,0.04)]" />}

            {group.items.map((item: any) => (
              <div key={item.href}>
                {item.hasDropdown || item.hasLicensesDropdown ? (
                  <>
                    <button
                      onClick={() => item.hasLicensesDropdown ? setLicensesDropdownOpen(!licensesDropdownOpen) : setScriptsDropdownOpen(!scriptsDropdownOpen)}
                      className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group overflow-hidden ${collapsed ? 'justify-center' : ''} ${
                        isActive(item.href) ? 'text-white' : 'text-[#666] hover:text-[#ccc] hover:bg-[rgba(255,255,255,0.04)]'
                      }`}
                      style={isActive(item.href) ? { background: 'rgba(81,162,255,0.09)' } : undefined}
                    >
                      {isActive(item.href) && (
                        <span className="absolute top-1.5 bottom-1.5 w-[3px] rounded-full bg-[#51a2ff]" style={isRTL ? { left: 0 } : { right: 0 }} />
                      )}
                      <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive(item.href) ? 'bg-[rgba(81,162,255,0.15)] text-[#51a2ff]' : 'text-[#555] group-hover:text-[#aaa]'}`}>
                        <item.icon className="w-4 h-4" />
                      </span>
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-start">{item.label}</span>
                          {(item.hasLicensesDropdown ? licensesDropdownOpen : scriptsDropdownOpen)
                            ? <ChevronDown className="w-3.5 h-3.5 text-[#555]" />
                            : <ChevronRight className="w-3.5 h-3.5 text-[#555]" />
                          }
                        </>
                      )}
                    </button>

                    {((item.hasLicensesDropdown ? licensesDropdownOpen : scriptsDropdownOpen) && !collapsed) && (
                      <div className={`mt-0.5 mb-1 space-y-0.5 ${isRTL ? 'pr-4 mr-2 border-r' : 'pl-4 ml-2 border-l'} border-[rgba(81,162,255,0.15)]`}>
                        {item.dropdownItems?.map((di: any) => (
                          <button
                            key={di.href}
                            onClick={() => handleNavigation(di.href)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              pathname === di.href ? 'text-[#51a2ff] bg-[rgba(81,162,255,0.07)]' : 'text-[#555] hover:text-[#ccc] hover:bg-[rgba(255,255,255,0.04)]'
                            }`}
                          >
                            <di.icon className="w-3.5 h-3.5" />
                            {di.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <NavItem
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    isActive={isActive(item.href)}
                    collapsed={collapsed}
                    onClick={() => handleNavigation(item.href)}
                    isRTL={isRTL}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom stats */}
      {!collapsed && (
        <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(81,162,255,0.05)', border: '1px solid rgba(81,162,255,0.12)' }}>
            <div className="flex items-center gap-2 mb-2.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#51a2ff]" />
              <span className="text-xs font-semibold text-white">Today&apos;s Stats</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 rounded-lg bg-[rgba(255,255,255,0.03)]">
                <p className="text-base font-bold text-[#51a2ff]">{todayStats.sales}</p>
                <p className="text-[10px] text-[#444]">Sales</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-[rgba(255,255,255,0.03)]">
                <p className="text-base font-bold text-emerald-400">${todayStats.revenue.toFixed(0)}</p>
                <p className="text-[10px] text-[#444]">Revenue</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Fixed dark background */}
      <div className="fixed inset-0 -z-10 bg-[#0a0a0a]">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, #51a2ff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          className="absolute top-0 left-0 w-full h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top left, rgba(81,162,255,0.04) 0%, transparent 60%)' }}
        />
      </div>

      {isClient ? createPortal(
        <>
          {/* ── Top Header ── */}
          <header
            className="fixed top-0 z-[70] h-14 flex items-center px-4 gap-4"
            style={{
              left: isRTL ? 0 : SIDEBAR_W,
              right: isRTL ? SIDEBAR_W : 0,
              background: '#0a0a0a',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              transition: 'left 0.25s ease, right 0.25s ease',
            }}
          >
            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-colors"
            >
              {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Search */}
            <div className="hidden lg:flex flex-1 max-w-md relative search-container">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
              <input
                type="text"
                placeholder={t('layout.searchPages')}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
                onKeyDown={handleSearch}
                onFocus={() => setShowSearchResults(true)}
                className="w-full h-9 pl-9 pr-4 text-sm bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-xl text-white placeholder:text-[#444] focus:border-[rgba(81,162,255,0.4)] focus:outline-none transition-colors"
              />

              {/* Search results dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#111] border border-[rgba(255,255,255,0.08)] rounded-xl shadow-2xl overflow-hidden z-50 max-h-[420px] overflow-y-auto">
                  <div className="p-2">
                    <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-[#51a2ff]" />
                        <span className="text-xs text-[#555] font-medium">{t('layout.quickActions')}</span>
                      </div>
                      {searchQuery && <span className="text-xs text-[#444]">{filteredPages.length} {t('layout.results')}</span>}
                    </div>
                    {filteredPages.length > 0 ? filteredPages.map((page, idx) => {
                      const Icon = page.icon;
                      const active = pathname === page.path;
                      return (
                        <button
                          key={idx}
                          onClick={() => navigateToPage(page.path)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-start transition-all ${active ? 'bg-[rgba(81,162,255,0.08)] border border-[rgba(81,162,255,0.2)]' : 'hover:bg-[rgba(255,255,255,0.04)] border border-transparent'}`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-[rgba(81,162,255,0.15)] text-[#51a2ff]' : 'bg-[rgba(255,255,255,0.04)] text-[#555]'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium ${active ? 'text-[#51a2ff]' : 'text-[#aaa]'}`}>{page.label}</div>
                            <div className="text-xs text-[#444] truncate">{page.description}</div>
                          </div>
                          {active && <span className="text-[10px] px-2 py-0.5 bg-[rgba(81,162,255,0.1)] text-[#51a2ff] rounded-full border border-[rgba(81,162,255,0.2)]">Current</span>}
                        </button>
                      );
                    }) : (
                      <div className="py-8 text-center">
                        <Search className="w-10 h-10 text-[#333] mx-auto mb-2" />
                        <p className="text-sm text-[#555]">No pages found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1" />

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Live clock */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#444] text-xs" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                <Clock className="w-3.5 h-3.5" />
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>

              {/* Back to site */}
              <Link
                href="/"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                title="Back to site"
              >
                <Home className="w-4 h-4" />
              </Link>

              {/* User menu */}
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl transition-all hover:bg-[rgba(255,255,255,0.05)]"
                  style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="relative">
                    <div className="w-7 h-7 rounded-lg bg-[#51a2ff]/20 flex items-center justify-center overflow-hidden">
                      {user?.avatar
                        ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                        : <span className="text-xs font-bold text-[#51a2ff]">{displayName.charAt(0).toUpperCase()}</span>
                      }
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]" />
                  </div>
                  <span className="hidden sm:block text-sm text-white font-medium max-w-[100px] truncate">{displayName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#555] transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl overflow-hidden z-50" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="p-3 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="w-9 h-9 rounded-lg bg-[#51a2ff]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {user?.avatar
                          ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover rounded-lg" />
                          : <span className="text-sm font-bold text-[#51a2ff]">{displayName.charAt(0).toUpperCase()}</span>
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Crown className="w-2.5 h-2.5 text-amber-400" />
                          <span className="text-[10px] text-amber-400">{t('layout.admin')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      {[
                        { icon: LayoutDashboard, label: t('layout.userDashboard'), action: () => { setShowUserMenu(false); router.push('/dashboard'); } },
                        { icon: Globe, label: t('layout.ipSettings'), action: () => { setShowUserMenu(false); setShowIpModal(true); } },
                        { icon: Settings, label: t('layout.settings'), action: () => { setShowUserMenu(false); router.push('/admin/settings'); } },
                      ].map(({ icon: Icon, label, action }) => (
                        <button key={label} onClick={action} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#888] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="p-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <button
                        onClick={() => { logout(); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('layout.signOut')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ── Desktop Sidebar ── */}
          <aside
            className="hidden lg:flex fixed top-0 bottom-0 z-[60] flex-col"
            style={{
              width: SIDEBAR_W,
              left: isRTL ? 'auto' : 0,
              right: isRTL ? 0 : 'auto',
              background: '#0d0d0d',
              borderRight: isRTL ? 'none' : '1px solid rgba(255,255,255,0.06)',
              borderLeft: isRTL ? '1px solid rgba(255,255,255,0.06)' : 'none',
              transition: 'width 0.25s ease',
              overflow: 'hidden',
            }}
          >
            <SidebarContent collapsed={isSidebarCollapsed} />
          </aside>

          {/* ── Mobile Sidebar ── */}
          {isMobileSidebarOpen && (
            <div className="fixed inset-0 bg-black/70 z-[65] lg:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
          )}
          <aside
            className={`fixed top-0 bottom-0 z-[66] w-64 flex flex-col lg:hidden transition-transform duration-300 ${
              isMobileSidebarOpen
                ? 'translate-x-0'
                : (isRTL ? 'translate-x-full' : '-translate-x-full')
            }`}
            style={{
              left: isRTL ? 'auto' : 0,
              right: isRTL ? 0 : 'auto',
              background: '#0d0d0d',
              borderRight: isRTL ? 'none' : '1px solid rgba(255,255,255,0.06)',
              borderLeft: isRTL ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            <div className="flex items-center justify-between px-4 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <Link href="/admin" className="flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-[#51a2ff]" />
                <span className="text-white font-black text-[1.1rem] leading-none tracking-tight">Free<span className="text-[#51a2ff]">X</span></span>
              </Link>
              <button onClick={() => setIsMobileSidebarOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555] hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent collapsed={false} />
            </div>
          </aside>
        </>,
        document.body
      ) : null}

      {/* ── Main content ── */}
      <div
        className="min-h-screen"
        style={{
          paddingTop: 56,
          paddingLeft: isRTL ? 0 : (isClient ? SIDEBAR_W : 0),
          paddingRight: isRTL ? (isClient ? SIDEBAR_W : 0) : 0,
          transition: 'padding 0.25s ease',
        }}
      >
        <main className="p-4 md:p-6 min-h-[calc(100vh-56px)]">
          {children}
        </main>
      </div>

      <LicensesIpModal isOpen={showIpModal} onClose={() => setShowIpModal(false)} />
    </>
  );
}
