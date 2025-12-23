'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LogOut, Settings, Shield, Globe, Crown, ChevronDown, User, Sparkles, Zap, Home, Package, LayoutDashboard, Command } from 'lucide-react';
import LicensesIpModal from '@/components/licenses-ip-modal';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [showUserMenu, setShowUserMenu] = useState(false);
  const [showIpModal, setShowIpModal] = useState(false);
  const pathname = usePathname();
  const { user, isAdmin, logout, isLoading } = useAuth();

  const isTrialActive = !!user?.trialEndAt && new Date(user.trialEndAt).getTime() > Date.now();
  const userNameClassName = !isAdmin && isTrialActive ? 'text-emerald-400' : 'text-white';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setShowUserMenu(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  const isActive = (path: string) => pathname === path;
  
  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/scripts', label: 'Scripts', icon: Package },
    ...(user ? [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: Command }] : [])
  ];

  // Don't render navigation on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Ultra Premium Liquid Glass Background */}
      <div className="fixed top-0 left-0 right-0 h-20 z-40 pointer-events-none overflow-hidden">
        {/* Animated Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.07] via-purple-500/[0.05] to-blue-500/[0.07] animate-gradient-x"></div>
        
        {/* Floating Orbs */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -top-10 right-1/4 w-32 h-32 bg-purple-500/15 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute -top-5 right-10 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
        
        {/* Prismatic Light Effect */}
        <div 
          className="absolute inset-0 opacity-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(6,182,212,0.15), transparent 40%)`
          }}
        ></div>
        
        {/* Glass Noise Texture */}
        <div className="absolute inset-0 opacity-[0.015]" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'}}></div>
        
        {/* Bottom Glow Line */}
        <div className="absolute bottom-0 left-0 right-0 h-px">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent blur-sm"></div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${
        isScrolled 
          ? 'py-2' 
          : 'py-3'
      }`}>
        {/* Glass Container */}
        <div className={`mx-4 sm:mx-6 lg:mx-auto lg:max-w-7xl transition-all duration-700 ${
          isScrolled
            ? 'bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]'
            : 'bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/[0.05]'
        }`}>
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              
              {/* Premium Logo */}
              <Link href="/" className="flex items-center gap-3 group relative">
                {/* Logo Glow */}
                <div className="absolute -inset-3 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                
                <div className="relative">
                  {/* Outer Ring */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-2xl opacity-75 blur-sm group-hover:opacity-100 group-hover:blur-md transition-all duration-500 animate-spin-slow"></div>
                  
                  {/* Logo Container */}
                  <div className="relative w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-cyan-500/50 transition-all duration-500 overflow-hidden">
                    {/* Inner Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <img src="/FreexLogo.png" alt="FreeX" className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-500 group-hover:scale-110" />
                  </div>
                </div>
                
                {/* Brand Text */}
                <div className="hidden sm:flex flex-col">
                  <span className="text-xl font-bold tracking-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-white group-hover:from-cyan-300 group-hover:via-white group-hover:to-blue-300 transition-all duration-500">Free</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:from-cyan-300 group-hover:to-blue-400 transition-all duration-500">X</span>
                  </span>
                  <span className="text-[10px] text-gray-500 tracking-widest uppercase">Premium Scripts</span>
                </div>
              </Link>

              {/* Desktop Navigation - Floating Pills */}
              <div className="hidden lg:flex items-center">
                <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.05]">
                  {navLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <Link 
                        key={link.href}
                        href={link.href} 
                        className={`relative px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-500 group flex items-center gap-2 ${
                          isActive(link.href)
                            ? 'text-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {/* Active Background */}
                        {isActive(link.href) && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/25 to-cyan-500/20 rounded-xl"></div>
                            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent rounded-xl"></div>
                            <div className="absolute inset-px bg-gradient-to-b from-white/[0.05] to-transparent rounded-[10px]"></div>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                          </>
                        )}
                        
                        {/* Hover Effect */}
                        <div className="absolute inset-0 rounded-xl bg-white/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <Icon className={`relative z-10 w-4 h-4 transition-all duration-300 ${isActive(link.href) ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`} />
                        <span className="relative z-10">{link.label}</span>
                        
                        {/* Shine Effect */}
                        <div className="absolute inset-0 rounded-xl overflow-hidden">
                          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000"></div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Medium Screen Navigation */}
              <div className="hidden md:flex lg:hidden items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                {navLinks.slice(0, 3).map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link 
                      key={link.href}
                      href={link.href} 
                      className={`relative px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center gap-1.5 ${
                        isActive(link.href)
                          ? 'text-white bg-gradient-to-r from-cyan-500/20 to-blue-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

          {/* Auth Section - Ultra Premium */}
              <div className="hidden items-center gap-3 md:flex">
                {user ? (
                  <div className="relative user-menu-container">
                    {/* Premium User Button */}
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="relative flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-2xl transition-all duration-500 group overflow-hidden"
                    >
                      {/* Button Background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/[0.08] to-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/10 group-hover:border-cyan-500/30 transition-all duration-500"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 rounded-2xl transition-all duration-500"></div>
                      
                      {/* Avatar with Glow */}
                      <div className="relative">
                        <div className={`absolute -inset-1 rounded-full blur-md opacity-0 group-hover:opacity-75 transition-opacity duration-500 ${isAdmin ? 'bg-gradient-to-r from-cyan-500 via-pink-500 to-orange-400' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}></div>
                        <div className={`relative w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold overflow-hidden ${
                          isAdmin 
                            ? 'bg-gradient-to-br from-cyan-500 via-pink-500 to-orange-400' 
                            : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                        }`}>
                          {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-bold">{(user.discordUsername || user.username || 'U').charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        {isAdmin && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center ring-2 ring-black/50">
                            <Crown className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* User Info */}
                      <div className="relative z-10 flex flex-col items-start">
                        <span className={`text-sm font-semibold ${userNameClassName}`}>{user.discordUsername || user.username}</span>
                        <div className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-cyan-400' : 'bg-emerald-400'} animate-pulse`}></div>
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider">{isAdmin ? 'Admin' : 'Online'}</span>
                        </div>
                      </div>
                      
                      <ChevronDown className={`relative z-10 w-4 h-4 text-gray-500 transition-all duration-500 group-hover:text-cyan-400 ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Premium Dropdown */}
                    {showUserMenu && (
                      <div className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-3xl animate-fade-in">
                        {/* Dropdown Glass Effect */}
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl rounded-3xl"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent rounded-3xl"></div>
                        <div className="absolute inset-px bg-gradient-to-b from-white/[0.05] to-transparent rounded-[23px]"></div>
                        <div className="absolute inset-0 rounded-3xl border border-white/10"></div>
                        
                        {/* Content */}
                        <div className="relative z-10">
                          {/* User Header */}
                          <div className="p-4 border-b border-white/10">
                            <div className="flex items-center gap-4">
                              <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden ${
                                isAdmin 
                                  ? 'bg-gradient-to-br from-cyan-500 via-pink-500 to-orange-400' 
                                  : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                              }`}>
                                {user.avatar ? (
                                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-white text-xl font-bold">{(user.discordUsername || user.username || 'U').charAt(0).toUpperCase()}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className={`font-semibold ${userNameClassName}`}>{user.discordUsername || user.username}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{isAdmin ? 'Administrator' : 'Member'}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">PRO</span>
                                  {isAdmin && <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">ADMIN</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Menu Items */}
                          <div className="p-2">
                            <button
                              onClick={() => { setShowUserMenu(false); window.location.href = '/dashboard'; }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all duration-300 group/item"
                            >
                              <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center group-hover/item:bg-cyan-500/20 transition-colors">
                                <LayoutDashboard className="w-4 h-4 group-hover/item:text-cyan-400 transition-colors" />
                              </div>
                              <div className="flex-1 text-left">
                                <span className="text-sm font-medium">Dashboard</span>
                                <p className="text-[10px] text-gray-600">View your overview</p>
                              </div>
                            </button>
                            
                            <button
                              onClick={() => { setShowUserMenu(false); setShowIpModal(true); }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all duration-300 group/item"
                            >
                              <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center group-hover/item:bg-blue-500/20 transition-colors">
                                <Globe className="w-4 h-4 group-hover/item:text-blue-400 transition-colors" />
                              </div>
                              <div className="flex-1 text-left">
                                <span className="text-sm font-medium">IP Settings</span>
                                <p className="text-[10px] text-gray-600">Configure server IP</p>
                              </div>
                            </button>
                            
                            {isAdmin && (
                              <>
                                <div className="mx-3 my-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                                <button
                                  onClick={() => { setShowUserMenu(false); window.location.href = '/admin'; }}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-all duration-300 group/item"
                                >
                                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-cyan-400" />
                                  </div>
                                  <div className="flex-1 text-left">
                                    <span className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Admin Panel</span>
                                    <p className="text-[10px] text-gray-600">Manage everything</p>
                                  </div>
                                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                                </button>
                              </>
                            )}
                          </div>
                          
                          {/* Logout */}
                          <div className="p-2 border-t border-white/10">
                            <button
                              onClick={() => { logout(); setShowUserMenu(false); }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 group/item"
                            >
                              <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                                <LogOut className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-medium">Sign Out</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full border-2 animate-spin border-white/20 border-t-cyan-400"></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* Login Button */}
                    <Link 
                      href="/auth/login" 
                      className="relative px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white rounded-xl transition-all duration-500 group overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/[0.05] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10">Login</span>
                    </Link>
                    
                    {/* Sign Up Button - Premium */}
                    <Link 
                      href="/auth/register" 
                      className="relative px-5 py-2.5 rounded-xl text-sm font-semibold overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute inset-px bg-gradient-to-b from-white/20 to-transparent rounded-[10px]"></div>
                      <div className="absolute inset-0 rounded-xl overflow-hidden">
                        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700"></div>
                      </div>
                      <span className="relative z-10 text-white">Get Started</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button - Premium */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative w-11 h-11 md:hidden rounded-xl transition-all duration-500 group overflow-hidden"
                aria-label="Toggle menu"
              >
                <div className="absolute inset-0 bg-white/[0.05] rounded-xl border border-white/10 group-hover:border-cyan-500/30 transition-all duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 rounded-xl transition-all duration-300"></div>
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <div className="w-5 h-5 flex flex-col justify-center items-center gap-1.5">
                    <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2 bg-cyan-400' : ''}`}></span>
                    <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${isMenuOpen ? 'opacity-0 scale-0' : ''}`}></span>
                    <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2 bg-cyan-400' : ''}`}></span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isMenuOpen 
            ? 'pb-6 mt-6 opacity-100 max-h-[600px]' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="pt-6 border-t border-white/10">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link, index) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={`relative px-5 py-4 rounded-2xl font-medium transition-all duration-500 touch-target overflow-hidden group ${
                    isActive(link.href)
                      ? 'text-white bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-500/30 shadow-lg shadow-cyan-500/20'
                      : 'text-gray-300 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <span className="font-medium">{link.label}</span>
                    {isActive(link.href) && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                        <div className="w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
                      </div>
                    )}
                  </div>
                  {isActive(link.href) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 animate-pulse"></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-full group-hover:translate-x-0"></div>
                </Link>
              ))}
              
              {/* Mobile Auth Section */}
              {user ? (
                <div className="pt-6 mt-6 space-y-3 border-t border-white/10" style={{ animationDelay: '0.4s' }}>
                  {/* Mobile Avatar Header */}
                  <div className="flex items-center gap-4 px-5 py-4 mb-3 rounded-2xl bg-gradient-to-r from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10">
                    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                      isAdmin 
                        ? 'bg-gradient-to-br from-cyan-500 via-pink-500 to-orange-400 ring-2 ring-cyan-400/50' 
                        : 'bg-gradient-to-br from-blue-500 to-cyan-600'
                    }`}>
                      {user.avatar ? (
                        <img 
                          src={user.avatar}
                          alt="Avatar Discord"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-lg font-bold">{(user.discordUsername || user.username || 'U').charAt(0).toUpperCase()}</span>
                      )}
                      {isAdmin && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold text-white ${userNameClassName}`}>{user.discordUsername || user.username}</p>
                      <p className="text-sm text-gray-500">{isAdmin ? 'Administrator' : 'Member'}</p>
                    </div>
                  </div>
                  <Link 
                    href="/dashboard"
                    className="flex items-center gap-3 px-5 py-4 text-gray-300 rounded-2xl transition-all duration-500 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm touch-target group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowIpModal(true);
                    }}
                    className="flex items-center gap-3 px-5 py-4 text-gray-300 rounded-2xl transition-all duration-500 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm touch-target group text-left w-full"
                  >
                    <Globe className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                    <span className="font-medium">IP Settings</span>
                  </button>
                  {isAdmin && (
                    <Link 
                      href="/admin"
                      className="flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-500 hover:bg-white/10 hover:backdrop-blur-sm touch-target bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                      <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Admin Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-5 py-4 w-full text-left text-red-400 rounded-2xl transition-all duration-500 hover:bg-red-500/10 hover:backdrop-blur-sm hover:text-red-300 touch-target group"
                  >
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              ) : isLoading ? (
                <div className="flex justify-center pt-6 mt-6 space-y-3 border-t border-white/10" style={{ animationDelay: '0.4s' }}>
                  <div className="w-10 h-10 rounded-full border-2 animate-spin border-white/20 border-t-cyan-400"></div>
                </div>
              ) : (
                <div className="pt-6 mt-6 space-y-3 border-t border-white/10" style={{ animationDelay: '0.4s' }}>
                  <Link 
                    href="/auth/login"
                    className="block px-5 py-4 text-center text-gray-300 rounded-2xl transition-all duration-500 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm touch-target font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/auth/register"
                    className="py-4 w-full text-center bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-2xl transition-all duration-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 touch-target font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
              
              {/* Mobile CTA */}
              <div className="pt-4" style={{ animationDelay: '0.5s' }}>
                <Link 
                  href="/scripts" 
                  className="py-4 w-full text-center bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white rounded-2xl transition-all duration-700 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 touch-target font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    backgroundSize: '200% auto',
                    backgroundPosition: '0% 0%'
                  }}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>

      {/* Mobile Menu Backdrop */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-md z-40 animate-fade-in"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"></div>
        </div>
      )}
      </nav>
      
      {/* IP Settings Modal */}
      <LicensesIpModal
        isOpen={showIpModal}
        onClose={() => setShowIpModal(false)}
      />
    </>
  );
}

