'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Users,
  Shield,
  BarChart3,
  Key,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Code2,
  DollarSign,
  Settings,
  Globe,
  Crown,
  Bell,
  Search,
  Sparkles,
  Home,
  TrendingUp,
  Calendar,
  Clock,
  Star,
  Zap,
  HelpCircle,
  ExternalLink,
  Plus,
  FolderOpen,
  Calculator,
  Tags,
  MessageSquare,
  Receipt,
  UserCheck
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
    if (pathname.startsWith('/admin/scripts')) {
      setScriptsDropdownOpen(true);
    }
  }, [pathname]);

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

  // Handle search
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      performSearch();
    }
  };

  const performSearch = () => {
    if (!searchQuery.trim()) return;
    
    // Determine which page to search based on current location or show all results
    const searchPages = [
      { path: '/admin/users', label: 'Users' },
      { path: '/admin/scripts', label: 'Scripts' },
      { path: '/admin/licenses', label: 'Licenses' },
      { path: '/admin/transactions', label: 'Transactions' },
      { path: '/admin/developers', label: 'Developers' },
    ];

    // If on a specific admin page, search within that page
    const currentPage = searchPages.find(page => pathname.startsWith(page.path));
    if (currentPage) {
      router.push(`${currentPage.path}?search=${encodeURIComponent(searchQuery)}`);
    } else {
      // Default to users page for global search
      router.push(`/admin/users?search=${encodeURIComponent(searchQuery)}`);
    }
    
    setShowSearchResults(false);
  };

  const searchSuggestions = [
    { icon: UserCheck, label: 'Search Users', path: '/admin/users' },
    { icon: Code2, label: 'Search Scripts', path: '/admin/scripts' },
    { icon: Key, label: 'Search Licenses', path: '/admin/licenses' },
    { icon: Receipt, label: 'Search Transactions', path: '/admin/transactions' },
    { icon: Users, label: 'Search Developers', path: '/admin/developers' },
  ];

  const sidebarItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/developers', icon: UserCheck, label: 'Developers' },
    { 
      href: '/admin/scripts', 
      icon: Code2, 
      label: 'Scripts',
      hasDropdown: true,
      dropdownItems: [
        { href: '/admin/scripts', label: 'All Scripts', icon: FolderOpen },
        { href: '/admin/scripts/create', label: 'Create New', icon: Plus },
        { href: '/admin/categories', label: 'Categories', icon: Tags },
      ],
    },
    { href: '/admin/licenses', icon: Key, label: 'Licenses' },
    { href: '/admin/transactions', icon: Receipt, label: 'Transactions' },
    { href: '/admin/accounting', icon: Calculator, label: 'Accounting' },
    { href: '/admin/custom-requests', icon: MessageSquare, label: 'Custom Requests' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const sidebarWidth = isSidebarCollapsed ? 'w-20' : 'w-72';
  const mainMargin = isSidebarCollapsed ? 'ml-20' : 'ml-72';

  return (
    <>
      {/* Baby Blue Premium Background */}
      <div className="overflow-hidden fixed inset-0 -z-10">
        {/* Base gradient - soft baby blue */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0a1628] to-slate-950"></div>
        
        {/* Baby blue ambient light */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(147,197,253,0.15),transparent)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_50%_50%_at_100%_100%,rgba(147,197,253,0.08),transparent)]"></div>
        
        {/* Floating orbs - baby blue theme */}
        <div className="absolute top-20 left-20 w-[500px] h-[500px] bg-sky-400/[0.07] rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/2 right-20 w-[400px] h-[400px] bg-blue-400/[0.05] rounded-full blur-[100px] animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-[600px] h-[600px] bg-sky-300/[0.04] rounded-full blur-[150px] animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(147,197,253,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(147,197,253,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      {isClient
        ? createPortal(
            <header className="fixed top-0 right-0 left-0 z-[70] h-16">
              <div className="h-full mx-3 mt-3 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
                <div className="flex justify-between items-center px-4 h-full">
                  {/* Left Section */}
                  <div className="flex gap-4 items-center">
                    {/* Sidebar Toggle */}
                    <button
                      onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                      className="flex justify-center items-center w-10 h-10 text-sky-400 rounded-xl border transition-all duration-300 bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/20 hover:text-sky-300"
                    >
                      {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                    
                    {/* Logo & Brand */}
                    <Link href="/admin" className="flex gap-3 items-center group">
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-blue-500 rounded-xl opacity-40 blur transition-opacity group-hover:opacity-60"></div>
                        <div className="flex relative justify-center items-center w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="hidden sm:block">
                        <h1 className="text-base font-bold text-white">Admin Panel</h1>
                        <p className="text-[10px] text-sky-400/70 uppercase tracking-wider">FreexStore</p>
                      </div>
                    </Link>
                  </div>

                  {/* Center - Search */}
                  <div className="hidden flex-1 mx-8 max-w-xl lg:flex">
                    <div className="relative w-full group search-container">
                      <Search className="absolute left-4 top-1/2 w-4 h-4 text-gray-500 transition-colors -translate-y-1/2 group-focus-within:text-sky-400" />
                      <input
                        type="text"
                        placeholder="Search anything... (Press Enter)"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowSearchResults(e.target.value.length > 0);
                        }}
                        onKeyDown={handleSearch}
                        onFocus={() => searchQuery && setShowSearchResults(true)}
                        className="w-full h-11 pl-11 pr-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-sky-500/50 focus:bg-white/[0.05] focus:outline-none transition-all"
                      />
                      <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] text-gray-500 bg-white/5 rounded-md border border-white/10">Enter</kbd>
                      
                      {/* Search Results Dropdown */}
                      {showSearchResults && searchQuery && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                          <div className="p-2">
                            <div className="text-xs text-gray-400 px-3 py-2 mb-1">Search in:</div>
                            {searchSuggestions.map((suggestion, index) => {
                              const Icon = suggestion.icon;
                              return (
                                <button
                                  key={index}
                                  onClick={() => {
                                    router.push(`${suggestion.path}?search=${encodeURIComponent(searchQuery)}`);
                                    setShowSearchResults(false);
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm text-gray-300 hover:bg-white/[0.05] hover:text-white transition-all group"
                                >
                                  <Icon className="w-4 h-4 text-gray-500 group-hover:text-sky-400 transition-colors" />
                                  <span>{suggestion.label}</span>
                                  <span className="ml-auto text-xs text-gray-500">"{searchQuery}"</span>
                                </button>
                              );
                            })}
                          </div>
                          <div className="border-t border-white/10 px-3 py-2 bg-white/[0.02]">
                            <div className="text-xs text-gray-500">Press <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">Enter</kbd> to search in current page</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex gap-2 items-center">
                    {/* Time Display */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <Clock className="w-4 h-4 text-sky-400/70" />
                      <span className="text-sm text-gray-400">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Quick Actions */}
                    <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/10 text-gray-400 hover:text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/30 transition-all duration-300">
                      <Home className="w-5 h-5" />
                    </Link>

                    {/* User Menu */}
                    <div className="relative ml-2 user-menu-container">
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-2xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] hover:border-sky-500/30 transition-all duration-300 group"
                      >
                        <div className="relative">
                          <div className="flex overflow-hidden justify-center items-center w-9 h-9 bg-gradient-to-br from-sky-400 via-blue-500 to-sky-600 rounded-xl">
                            {user?.avatar ? (
                              <img src={user.avatar} alt="Avatar" className="object-cover w-full h-full" />
                            ) : (
                              <span className="text-sm font-bold text-white">{(user?.discordUsername || user?.username || 'A').charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                        </div>
                        <div className="hidden text-left sm:block">
                          <p className="text-sm font-medium text-white">{user?.discordUsername || user?.username}</p>
                          <p className="text-[10px] text-sky-400">Administrator</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown */}
                      {showUserMenu && (
                        <div className="overflow-hidden absolute right-0 top-full mt-2 w-64 rounded-2xl border shadow-2xl backdrop-blur-xl bg-slate-900/95 border-white/10 animate-fade-in">
                          <div className="p-4 bg-gradient-to-r border-b from-sky-500/10 to-blue-500/10 border-white/10">
                            <div className="flex gap-3 items-center">
                              <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl">
                                {user?.avatar ? (
                                  <img src={user.avatar} alt="Avatar" className="object-cover w-full h-full rounded-xl" />
                                ) : (
                                  <span className="text-lg font-bold text-white">{(user?.discordUsername || user?.username || 'A').charAt(0).toUpperCase()}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-white">{user?.discordUsername || user?.username}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Crown className="w-3 h-3 text-amber-400" />
                                  <span className="text-xs text-amber-400">Admin</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-2">
                            <button onClick={() => { setShowUserMenu(false); router.push('/dashboard'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group">
                              <LayoutDashboard className="w-4 h-4 group-hover:text-sky-400" />
                              <span className="text-sm">User Dashboard</span>
                            </button>
                            <button onClick={() => { setShowUserMenu(false); setShowIpModal(true); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group">
                              <Globe className="w-4 h-4 group-hover:text-sky-400" />
                              <span className="text-sm">IP Settings</span>
                            </button>
                            <button onClick={() => { setShowUserMenu(false); router.push('/admin/settings'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group">
                              <Settings className="w-4 h-4 group-hover:text-sky-400" />
                              <span className="text-sm">Settings</span>
                            </button>
                          </div>
                          
                          <div className="p-2 border-t border-white/10">
                            <button onClick={() => { logout(); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
                              <LogOut className="w-4 h-4" />
                              <span className="text-sm">Sign Out</span>
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
            <aside className={`fixed bottom-0 left-0 transition-all duration-500 ease-out top-[76px] z-[60] ${sidebarWidth}`}>
              <div className="h-[calc(100vh-76px-12px)] mb-3 ml-3 mr-3 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] overflow-hidden flex flex-col">
                {/* Navigation */}
                <nav className="overflow-y-auto flex-1 p-3 space-y-1">
              {/* Section Label */}
              {!isSidebarCollapsed && (
                <div className="px-3 py-2">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Main Menu</span>
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
                        <div className="pl-3 mt-1 ml-3 space-y-1 border-l border-white/10">
                          {item.dropdownItems?.map((dropdownItem) => (
                            <button
                              key={dropdownItem.href}
                              onClick={() => router.push(dropdownItem.href)}
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
                      onClick={() => router.push(item.href)}
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

                {/* Help Link */}
                <button className="w-full flex items-center gap-3 px-3 py-3 mt-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/[0.05] transition-all">
                  <HelpCircle className="w-5 h-5" />
                  <span className="text-sm">Help & Support</span>
                  <ExternalLink className="ml-auto w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </aside>,
            document.body
          )
        : null}

      {/* Main Content Wrapper */}
      <div className="flex">
        {/* Main Content */}
        <main className={`flex-1 pt-24 pr-3 pb-6 transition-all duration-500 ease-out ${mainMargin}`}>
          <div className="min-h-[calc(100vh-120px)] rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] overflow-hidden">
            {children}
          </div>
        </main>
      </div>

      {/* IP Settings Modal */}
      <LicensesIpModal isOpen={showIpModal} onClose={() => setShowIpModal(false)} />
    </>
  );
}
