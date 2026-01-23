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
  Bell,
  Search,
  Home,
  TrendingUp,
  Calendar,
  Clock,
  Star,
  Zap,
  ExternalLink
} from 'lucide-react';
import LicensesIpModal from '@/components/licenses-ip-modal';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface TodayStats {
  sales: number;
  revenue: number;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const t = useTranslations('admin');
  const params = useParams();
  const lang = params?.lang as string || 'en';
  const isRTL = lang === 'ar';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [scriptsDropdownOpen, setScriptsDropdownOpen] = useState(false);
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

  // Update time every second for live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch today's stats
  useEffect(() => {
    const fetchTodayStats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const params = new URLSearchParams({
          startDate: today.toISOString(),
          endDate: tomorrow.toISOString()
        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/stats?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTodayStats({
            sales: data.successfulTransactions || 0,
            revenue: data.totalRevenue || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch today stats:', error);
      }
    };

    fetchTodayStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchTodayStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-open Scripts dropdown based on current page
  useEffect(() => {
    if (pathname.startsWith('/admin/scripts') && !scriptsDropdownOpen) {
      setScriptsDropdownOpen(true);
    }
  }, [pathname, scriptsDropdownOpen]);

  // Close mobile sidebar when navigating
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  // Reset mobile sidebar state when switching between mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
      if (showSearchResults && !(event.target as Element).closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    if (showUserMenu || showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu, showSearchResults]);

  // Admin pages for quick navigation
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
  ];

  // Filter admin pages based on search query
  const filteredPages = searchQuery.trim()
    ? adminPages.filter(page => 
        page.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : adminPages;

  // Handle search - navigate to page on Enter
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredPages.length > 0) {
      router.push(filteredPages[0].path);
      setSearchQuery('');
      setShowSearchResults(false);
    } else if (e.key === 'Escape') {
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };

  // Navigate to page
  const navigateToPage = (path: string) => {
    router.push(path);
    setSearchQuery('');
    setShowSearchResults(false);
    setIsMobileSidebarOpen(false);
  };

  // Handle navigation with sidebar close
  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileSidebarOpen(false);
  };

  const sidebarItems = [
    { href: '/admin', icon: LayoutDashboard, label: t('dashboard') },
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
    { href: '/admin/licenses', icon: Key, label: t('licensesLabel') },
    { href: '/admin/transactions', icon: Receipt, label: t('transactionsLabel') },
    { href: '/admin/accounting', icon: Calculator, label: t('accountingLabel') },
    { href: '/admin/contact-messages', icon: Mail, label: t('contactMessagesLabel') },
    { href: '/admin/custom-requests', icon: MessageSquare, label: t('customRequestsLabel') },
    { href: '/admin/faq', icon: HelpCircle, label: t('faqLabel') },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const sidebarWidth = isSidebarCollapsed ? 'w-20' : 'w-72';
  const mainMargin = isRTL 
    ? (isSidebarCollapsed ? 'mr-20' : 'mr-72')
    : (isSidebarCollapsed ? 'ml-20' : 'ml-72');

  return (
    <>
      {/* Baby Blue Premium Background */}
      <div className="overflow-hidden fixed inset-0 -z-10">
        {/* Base gradient - soft baby blue */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0a1628] to-slate-950"></div>

        {/* Baby blue ambient light */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(147,197,253,0.15),transparent)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_50%_50%_at_100%_100%,rgba(147,197,253,0.08),transparent)]"></div>

        {/* Floating orbs - baby blue theme - responsive sizes */}
        <div className="absolute top-10 left-10 w-48 h-48 sm:w-64 sm:h-64 md:w-[500px] md:h-[500px] bg-sky-400/[0.07] rounded-full blur-[80px] sm:blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/2 right-10 w-40 h-40 sm:w-48 sm:h-48 md:w-[400px] md:h-[400px] bg-blue-400/[0.05] rounded-full blur-[60px] sm:blur-[100px] animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-10 left-1/4 w-56 h-56 sm:w-72 sm:h-72 md:w-[600px] md:h-[600px] bg-sky-300/[0.04] rounded-full blur-[100px] sm:blur-[150px] animate-pulse" style={{animationDelay: '2s'}}></div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(147,197,253,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(147,197,253,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      {isClient
        ? createPortal(
            <header className="fixed top-0 right-0 left-0 z-[70] h-16">
              <div className="h-full mx-1 sm:mx-2 md:mx-3 mt-3 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
                <div className="flex justify-between items-center px-1.5 sm:px-2 md:px-4 h-full">
                  {/* Left Section */}
                  <div className="flex gap-2 sm:gap-4 items-center">
                    {/* Mobile Menu Toggle */}
                    <button
                      onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                      className="lg:hidden flex justify-center items-center w-9 h-9 sm:w-10 sm:h-10 text-sky-400 rounded-xl border transition-all duration-300 bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/20 hover:text-sky-300"
                    >
                      {isMobileSidebarOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>

                    {/* Desktop Sidebar Toggle */}
                    <button
                      onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                      className="hidden lg:flex justify-center items-center w-10 h-10 text-sky-400 rounded-xl border transition-all duration-300 bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/20 hover:text-sky-300"
                    >
                      {isRTL
                        ? (isSidebarCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />)
                        : (isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />)
                      }
                    </button>

                    {/* Logo & Brand */}
                    <Link href="/admin" className="flex gap-2 sm:gap-3 items-center group">
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-blue-500 rounded-xl opacity-40 blur transition-opacity group-hover:opacity-60"></div>
                        <div className="flex relative justify-center items-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl">
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                      </div>
                      <div className="hidden sm:block">
                        <h1 className="text-sm sm:text-base font-bold text-white">Admin Panel</h1>
                        <p className="text-[8px] sm:text-[10px] text-sky-400/70 uppercase tracking-wider">FreexStore</p>
                      </div>
                    </Link>
                  </div>

                  {/* Center - Search */}
                  <div className="hidden flex-1 mx-8 max-w-xl lg:flex">
                    <div className="relative w-full group search-container">
                      <Search className="absolute left-4 top-1/2 w-4 h-4 text-gray-500 transition-colors -translate-y-1/2 group-focus-within:text-sky-400" />
                      <input
                        type="text"
                        placeholder={t('layout.searchPages')}
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowSearchResults(true);
                        }}
                        onKeyDown={handleSearch}
                        onFocus={() => setShowSearchResults(true)}
                        className="w-full h-11 pl-11 pr-20 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-sky-500/50 focus:bg-white/[0.05] focus:outline-none transition-all"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <kbd className="px-2 py-1 text-[10px] text-gray-500 bg-white/5 rounded-md border border-white/10">⏎</kbd>
                        <kbd className="px-2 py-1 text-[10px] text-gray-500 bg-white/5 rounded-md border border-white/10">ESC</kbd>
                      </div>
                      
                      {/* Quick Navigation Dropdown */}
                      {showSearchResults && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[500px] overflow-y-auto">
                          <div className="p-2">
                            <div className="flex items-center justify-between px-3 py-2 mb-1">
                              <div className="flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5 text-sky-400" />
                                <span className="text-xs text-gray-400 font-medium">{t('layout.quickActions')}</span>
                              </div>
                              {searchQuery && (
                                <span className="text-xs text-gray-500">{filteredPages.length} {t('layout.results')}</span>
                              )}
                            </div>
                            {filteredPages.length > 0 ? (
                              filteredPages.map((page, index) => {
                                const Icon = page.icon;
                                const isCurrentPage = pathname === page.path;
                                return (
                                  <button
                                    key={index}
                                    onClick={() => navigateToPage(page.path)}
                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-start transition-all group ${
                                      isCurrentPage
                                        ? 'bg-sky-500/15 border border-sky-500/30'
                                        : 'hover:bg-white/[0.05] border border-transparent'
                                    }`}
                                  >
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                                      isCurrentPage
                                        ? 'bg-sky-500/20 text-sky-400'
                                        : 'bg-white/[0.03] text-gray-500 group-hover:bg-white/[0.06] group-hover:text-sky-400'
                                    }`}>
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className={`text-sm font-medium ${
                                        isCurrentPage ? 'text-sky-400' : 'text-gray-300 group-hover:text-white'
                                      }`}>
                                        {page.label}
                                      </div>
                                      <div className="text-xs text-gray-500 truncate">{page.description}</div>
                                    </div>
                                    {isCurrentPage && (
                                      <div className="flex items-center gap-1 px-2 py-1 bg-sky-500/20 rounded-md">
                                        <Star className="w-3 h-3 text-sky-400" />
                                        <span className="text-[10px] text-sky-400 font-medium">Current</span>
                                      </div>
                                    )}
                                    {index === 0 && searchQuery && (
                                      <kbd className="px-2 py-1 text-[10px] text-gray-500 bg-white/5 rounded-md border border-white/10">⏎</kbd>
                                    )}
                                  </button>
                                );
                              })
                            ) : (
                              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                                <Search className="w-12 h-12 text-gray-600 mb-3" />
                                <p className="text-sm text-gray-400 mb-1">No pages found</p>
                                <p className="text-xs text-gray-600">Try a different search term</p>
                              </div>
                            )}
                          </div>
                          <div className="border-t border-white/10 px-3 py-2.5 bg-white/[0.02]">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-4">
                                <span>Press <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-gray-400">⏎</kbd> to navigate</span>
                                <span>Press <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-gray-400">ESC</kbd> to close</span>
                              </div>
                              <span className="text-gray-600">Click to navigate</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex gap-1 sm:gap-2 items-center">
                    {/* Time Display */}
                    <div className="hidden md:flex items-center gap-2 px-2 sm:px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400/70" />
                      <span className="text-xs sm:text-sm text-gray-400">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Quick Actions */}
                    <Link href="/" className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/10 text-gray-400 hover:text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/30 transition-all duration-300">
                      <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>

                    {/* User Menu */}
                    <div className="relative user-menu-container">
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-1 pr-2 sm:pr-3 py-1 rounded-2xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] hover:border-sky-500/30 transition-all duration-300 group"
                      >
                        <div className="relative">
                          <div className="flex overflow-hidden justify-center items-center w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-sky-400 via-blue-500 to-sky-600 rounded-xl">
                            {user?.avatar ? (
                              <img src={user.avatar} alt={`${user?.discordUsername || user?.username || 'Admin'} Profile Avatar - FreexStore Admin Panel`} className="object-cover w-full h-full" />
                            ) : (
                              <span className="text-xs sm:text-sm font-bold text-white">{(user?.discordUsername || user?.username || 'A').charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                        </div>
                        <div className="hidden text-start sm:block">
                          <p className="text-xs sm:text-sm font-medium text-white truncate max-w-[100px]">{user?.discordUsername || user?.username}</p>
                          <p className="text-[8px] sm:text-[10px] text-sky-400">{t('layout.administrator')}</p>
                        </div>
                        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown */}
                      {showUserMenu && (
                        <div className="overflow-hidden absolute right-0 top-full mt-2 w-64 rounded-2xl border shadow-2xl backdrop-blur-xl bg-slate-900/95 border-white/10 animate-fade-in">
                          <div className="p-4 bg-gradient-to-r border-b from-sky-500/10 to-blue-500/10 border-white/10">
                            <div className="flex gap-3 items-center">
                              <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl">
                                {user?.avatar ? (
                                  <img src={user.avatar} alt={`${user?.discordUsername || user?.username || 'Admin'} Profile Picture - FreexStore Administrator Account`} className="object-cover w-full h-full rounded-xl" />
                                ) : (
                                  <span className="text-lg font-bold text-white">{(user?.discordUsername || user?.username || 'A').charAt(0).toUpperCase()}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-white">{user?.discordUsername || user?.username}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Crown className="w-3 h-3 text-amber-400" />
                                  <span className="text-xs text-amber-400">{t('layout.admin')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-2">
                            <button onClick={() => { setShowUserMenu(false); router.push('/dashboard'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group">
                              <LayoutDashboard className="w-4 h-4 group-hover:text-sky-400" />
                              <span className="text-sm">{t('layout.userDashboard')}</span>
                            </button>
                            <button onClick={() => { setShowUserMenu(false); setShowIpModal(true); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group">
                              <Globe className="w-4 h-4 group-hover:text-sky-400" />
                              <span className="text-sm">{t('layout.ipSettings')}</span>
                            </button>
                            <button onClick={() => { setShowUserMenu(false); router.push('/admin/settings'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group">
                              <Settings className="w-4 h-4 group-hover:text-sky-400" />
                              <span className="text-sm">{t('layout.settings')}</span>
                            </button>
                          </div>

                          <div className="p-2 border-t border-white/10">
                            <button onClick={() => { logout(); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
                              <LogOut className="w-4 h-4" />
                              <span className="text-sm">{t('layout.signOut')}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </header>,
            document.body
          )
        : null}

      {isClient
        ? createPortal(
            <>
              {/* Mobile Sidebar Overlay */}
              {isMobileSidebarOpen && (
                <div
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] lg:hidden"
                  onClick={() => setIsMobileSidebarOpen(false)}
                />
              )}

              {/* Mobile Sidebar (< lg screens) */}
              <aside className={`fixed bottom-0 top-[76px] z-[60] w-64 sm:w-72 md:w-80 bg-slate-900/95 backdrop-blur-xl border-r border-white/[0.06] lg:hidden transition-transform duration-300 ease-out ${
                isMobileSidebarOpen
                  ? (isRTL ? 'translate-x-0 right-0' : 'translate-x-0 left-0')
                  : (isRTL ? 'translate-x-full right-0' : '-translate-x-full left-0')
              }`}>
                <div className="h-[calc(100vh-76px)] overflow-y-auto flex flex-col">
                  {/* Navigation */}
                  <nav className="flex-1 p-3 space-y-1">
                    {/* Section Label */}
                    <div className="px-3 py-2">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{t('layout.mainMenu')}</span>
                    </div>

                    {sidebarItems.map((item) => (
                      <div key={item.href}>
                        {item.hasDropdown ? (
                          <div>
                            <button
                              onClick={() => setScriptsDropdownOpen(!scriptsDropdownOpen)}
                              className="w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 group text-gray-400 hover:text-white hover:bg-white/[0.05]"
                            >
                              <div className="flex gap-3 items-center">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/[0.03] group-hover:bg-white/[0.06]">
                                  <item.icon className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium">{item.label}</span>
                              </div>
                              {scriptsDropdownOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>

                            {scriptsDropdownOpen && (
                              <div className={`${isRTL ? 'pr-3 mr-3 border-r' : 'pl-3 ml-3 border-l'} mt-1 space-y-1 border-white/10`}>
                                {item.dropdownItems?.map((dropdownItem) => (
                                  <button
                                    key={dropdownItem.href}
                                    onClick={() => handleNavigation(dropdownItem.href)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                                      pathname === dropdownItem.href
                                        ? 'bg-sky-500/15 text-sky-400'
                                        : 'text-gray-500 hover:text-white hover:bg-white/[0.05]'
                                    }`}
                                  >
                                    <dropdownItem.icon className="w-4 h-4" />
                                    <span className="text-sm">{dropdownItem.label}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleNavigation(item.href)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group ${
                              isActive(item.href)
                                ? 'bg-gradient-to-r from-sky-500/20 to-blue-500/15 text-sky-400 border border-sky-500/30 shadow-lg shadow-sky-500/10'
                                : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                              isActive(item.href) ? 'bg-sky-500/20' : 'bg-white/[0.03] group-hover:bg-white/[0.06]'
                            }`}>
                              <item.icon className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium">{item.label}</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </nav>

                  {/* Bottom Section */}
                  <div className="p-3 border-t border-white/[0.06]">
                    {/* Quick Stats */}
                    <div className="p-3 sm:p-4 bg-gradient-to-br rounded-xl border from-sky-500/10 to-blue-500/5 border-sky-500/20">
                      <div className="flex gap-2 items-center mb-2 sm:mb-3">
                        <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
                        <span className="text-[10px] sm:text-xs font-semibold text-white">Today&apos;s Stats</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="text-center p-1.5 sm:p-2 rounded-lg bg-white/[0.03]">
                          <p className="text-base sm:text-lg font-bold text-sky-400">{todayStats.sales}</p>
                          <p className="text-[8px] sm:text-[10px] text-gray-500">Sales</p>
                        </div>
                        <div className="text-center p-1.5 sm:p-2 rounded-lg bg-white/[0.03]">
                          <p className="text-base sm:text-lg font-bold text-emerald-400">${todayStats.revenue.toFixed(2)}</p>
                          <p className="text-[8px] sm:text-[10px] text-gray-500">Revenue</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Desktop Sidebar (>= lg screens) */}
              <aside className={`hidden lg:flex fixed bottom-0 top-[76px] z-[60] transition-all duration-300 ease-out ${
                isRTL
                  ? (isSidebarCollapsed ? 'right-0 w-20' : 'right-0 w-72')
                  : (isSidebarCollapsed ? 'left-0 w-20' : 'left-0 w-72')
              }`}>
                <div className={`h-[calc(100vh-76px)] ${isRTL ? 'mr-3' : 'ml-3'} w-[calc(100%-12px)] rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] overflow-hidden flex flex-col`}>
                  {/* Navigation */}
                  <nav className="overflow-y-auto flex-1 p-3 space-y-1">
                    {/* Section Label */}
                    {!isSidebarCollapsed && (
                      <div className="px-3 py-2">
                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{t('layout.mainMenu')}</span>
                      </div>
                    )}

                    {sidebarItems.map((item) => (
                      <div key={item.href}>
                        {item.hasDropdown ? (
                          <div>
                            <button
                              onClick={() => setScriptsDropdownOpen(!scriptsDropdownOpen)}
                              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-3 rounded-xl transition-all duration-300 group ${
                                isActive(item.href)
                                  ? 'bg-gradient-to-r from-sky-500/20 to-blue-500/15 text-sky-400 border border-sky-500/30 shadow-lg shadow-sky-500/10'
                                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                              }`}
                            >
                              <div className="flex gap-3 items-center">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                                  isActive(item.href) ? 'bg-sky-500/20' : 'bg-white/[0.03] group-hover:bg-white/[0.06]'
                                }`}>
                                  <item.icon className="w-5 h-5" />
                                </div>
                                {!isSidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                              </div>
                              {!isSidebarCollapsed && (
                                scriptsDropdownOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                              )}
                            </button>

                            {scriptsDropdownOpen && !isSidebarCollapsed && (
                              <div className={`${isRTL ? 'pr-3 mr-3 border-r' : 'pl-3 ml-3 border-l'} mt-1 space-y-1 border-white/10`}>
                                {item.dropdownItems?.map((dropdownItem) => (
                                  <button
                                    key={dropdownItem.href}
                                    onClick={() => handleNavigation(dropdownItem.href)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                                      pathname === dropdownItem.href
                                        ? 'bg-sky-500/15 text-sky-400'
                                        : 'text-gray-500 hover:text-white hover:bg-white/[0.05]'
                                    }`}
                                  >
                                    <dropdownItem.icon className="w-4 h-4" />
                                    <span className="text-sm">{dropdownItem.label}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleNavigation(item.href)}
                            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : ''} gap-3 px-3 py-3 rounded-xl transition-all duration-300 group ${
                              isActive(item.href)
                                ? 'bg-gradient-to-r from-sky-500/20 to-blue-500/15 text-sky-400 border border-sky-500/30 shadow-lg shadow-sky-500/10'
                                : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                              isActive(item.href) ? 'bg-sky-500/20' : 'bg-white/[0.03] group-hover:bg-white/[0.06]'
                            }`}>
                              <item.icon className="w-5 h-5" />
                            </div>
                            {!isSidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                          </button>
                        )}
                      </div>
                    ))}
                  </nav>

                  {/* Bottom Section */}
                  {!isSidebarCollapsed && (
                    <div className="p-3 border-t border-white/[0.06]">
                      {/* Quick Stats */}
                      <div className="p-4 bg-gradient-to-br rounded-xl border from-sky-500/10 to-blue-500/5 border-sky-500/20">
                        <div className="flex gap-2 items-center mb-3">
                          <TrendingUp className="w-4 h-4 text-sky-400" />
                          <span className="text-xs font-semibold text-white">Today&apos;s Stats</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                            <p className="text-lg font-bold text-sky-400">{todayStats.sales}</p>
                            <p className="text-[10px] text-gray-500">Sales</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                            <p className="text-lg font-bold text-emerald-400">${todayStats.revenue.toFixed(2)}</p>
                            <p className="text-[10px] text-gray-500">Revenue</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </>,
            document.body
          )
        : null}

      {/* Main Content Wrapper */}
      <div className="flex">
        {/* Main Content */}
        <main className={`w-full pt-20 sm:pt-22 md:pt-24 px-1.5 sm:px-2 md:px-3 pb-3 sm:pb-4 md:pb-6 transition-all duration-500 ease-out ${isRTL ? (isSidebarCollapsed ? 'lg:mr-20' : 'lg:mr-72') : (isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72')}`}>
          <div className="min-h-[calc(100vh-100px)] sm:min-h-[calc(100vh-110px)] md:min-h-[calc(100vh-120px)] rounded-xl sm:rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] overflow-hidden">
            {children}
          </div>
        </main>
      </div>

      {/* IP Settings Modal */}
      <LicensesIpModal isOpen={showIpModal} onClose={() => setShowIpModal(false)} />
    </>
  );
}
