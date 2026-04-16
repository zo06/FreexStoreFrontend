'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useScripts, useActiveCategories } from '@/lib/simple-data-fetcher';
import { CodeSquare, Search, Filter, Grid3X3, List, TrendingUp, Zap, Package, RefreshCw, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart-store';
import { Robot, ChartBar, Plug, Cloud, Shield, Rocket, Brain, TrendUp, Eye, Database, Lightning, Warning, Star, Fire, Gift, CheckCircle, ArrowUp, Sparkle, Funnel, SortAscending } from 'phosphor-react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import PayPalBuyButton from '@/components/PayPalBuyButton';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { MediaSlider } from '@/components/ui/media-slider';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

interface Script {
  id: string;
  slug?: string;
  name: string;
  description: string;
  price: string;
  category: string | { name: string };
  licenseType: 'forever' | 'date';
  foreverPrice?: number;
  datePrice?: number;
  defaultLicenseDurationDays?: number;
  imageUrl?: string;
  imageUrls?: string | string[];
  youtubeUrl?: string;
  downloadUrl?: string;
  features?: string | string[];
  requirements?: string;
  isActive: boolean;
  trialAvailable?: boolean;
  discountPercentage?: number;
  createdAt: string;
  updatedAt: string;
  // Frontend-only properties for display
  title?: string;
  icon?: React.ReactElement;
  popular?: boolean;
  new?: boolean;
}



// Categories will be loaded dynamically from the database

// Helper function to render category icon (handles both icon names and URLs)
const renderCategoryIcon = (iconValue: string | undefined, categoryName: string) => {
  // If no icon value, use fallback based on category name
  if (!iconValue) {
    const iconMap: { [key: string]: React.ReactElement } = {
      'Automation': <Robot size={20} className="text-[#51a2ff]" />,
      'Data': <ChartBar size={20} className="text-[#51a2ff]" />,
      'Infrastructure': <Plug size={20} className="text-[#51a2ff]" />,
      'Cloud': <Cloud size={20} className="text-[#51a2ff]" />,
      'Security': <Shield size={20} className="text-[#51a2ff]" />,
      'DevOps': <Rocket size={20} className="text-[#51a2ff]" />,
      'AI': <Brain size={20} className="text-[#51a2ff]" />,
      'Analytics': <TrendUp size={20} className="text-[#51a2ff]" />,
      'Monitoring': <Eye size={20} className="text-[#51a2ff]" />,
      'Database': <Database size={20} className="text-[#51a2ff]" />
    };
    return iconMap[categoryName] || <Lightning size={20} className="text-[#888]" />;
  }

  // If it's a URL (starts with http or /), render as image
  if (iconValue.startsWith('http') || iconValue.startsWith('/')) {
    const imageUrl = iconValue.startsWith('/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${iconValue}` : iconValue;
    return (
      <img
        src={imageUrl}
        alt={`${categoryName} icon`}
        className="object-contain w-5 h-5"
        onError={(e) => {
          // Fallback to default icon if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement?.appendChild(
            document.createElement('div')
          );
        }}
      />
    );
  }

  // If it's an icon name, try to render from phosphor-react
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    Robot, ChartBar, Plug, Cloud, Shield, Rocket, Brain, TrendUp, Eye, Database, Lightning
  };

  const IconComponent = iconMap[iconValue];
  if (IconComponent) {
    return <IconComponent size={20} className="text-[#51a2ff]" />;
  }

  // Fallback to default icon
  return <Lightning size={20} className="text-[#888]" />;
};

function ScriptsPageContent() {
  const t = useTranslations('scripts');
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  const categoryParam = searchParams.get('category');
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'en';

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'buy' | 'trial';
    script: Script | null;
  }>({ isOpen: false, type: 'buy', script: null });
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { user } = useAuth();

  // Fetch scripts and categories using simple data fetcher
  const { data: scriptsData, loading, error, refresh } = useScripts();
  const { data: categoriesData, loading: categoriesLoading } = useActiveCategories();

  // Fetch user licenses to check script status
  const [userLicenses, setUserLicenses] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      apiClient.getUserLicenses().then((response: any) => {
        // Handle both array response and { data: [...] } response format
        const licenses = Array.isArray(response) ? response : (response?.data || []);
        setUserLicenses(licenses);
      }).catch(console.error);
    }
  }, [user]);

  // Get dynamic categories from database
  // Handle both array response and { data: [...] } response format
  const rawCategories = Array.isArray(categoriesData)
    ? categoriesData
    : (categoriesData as any)?.data || [];
  const categories = ["All", ...(rawCategories.map((cat: any) => cat.name) || [])];

  // Handle URL query parameters for filtering
  useEffect(() => {
    if (filterParam) {
      setActiveFilter(filterParam);
    }
    if (categoryParam) {
      // Find category name by ID
      const category = rawCategories.find((cat: any) => cat.id === categoryParam);
      if (category) {
        setSelectedCategory(category.name);
      }
    }
  }, [filterParam, categoryParam, rawCategories]);

  // Transform backend data to frontend format
  // Handle both array response and { data: [...] } response format
  const rawScripts = Array.isArray(scriptsData)
    ? scriptsData
    : (scriptsData as any)?.data || [];

  const transformedScripts = rawScripts.map((script: any) => {
    const displayPrice = script.price;
    const categoryName = script.category?.name || 'Uncategorized';
    const categoryIcon = renderCategoryIcon(script.category?.icon, categoryName);
    return {
      ...script,
      title: script.name, // Map name to title for display
      category: categoryName, // Use category name from relationship
      price: displayPrice ? `$${displayPrice}` : 'Coming SOON',
      features: script.features ? script.features.split(',').map((f: string) => f.trim()) : [],
      icon: categoryIcon,
      popular: script.popular || false,
      new: script.new || false,
      discountPercentage: script.discountPercentage || 0,
    };
  }) || [];

  // Use only backend data - no fallback
  const scripts = transformedScripts;

  const filteredScripts = scripts.filter((script: Script) => {
    const matchesCategory = selectedCategory === "All" || script.category === selectedCategory;
    const matchesSearch = (script.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         script.description?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false;

    // Apply active filter from URL params
    let matchesFilter = true;
    if (activeFilter === 'popular') {
      matchesFilter = script.popular === true;
    } else if (activeFilter === 'new') {
      matchesFilter = script.new === true;
    } else if (activeFilter === 'trial') {
      matchesFilter = script.trialAvailable === true;
    }

    return matchesCategory && matchesSearch && matchesFilter;
  });


  const { addItem, isInCart } = useCartStore();

  const [trialLoading, setTrialLoading] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<Set<string>>(new Set());

  const handleAddToCart = (e: React.MouseEvent, script: { id: string; name?: string; title?: string; price?: string; discountPercentage?: number; imageUrl?: string; slug?: string }) => {
    e.stopPropagation();
    const rawPrice = parseFloat((script.price || '0').replace('$', ''));
    if (isNaN(rawPrice) || rawPrice <= 0) return;
    if (!isInCart(script.id)) {
      addItem({ id: script.id, name: script.name || script.title || '', price: rawPrice, discountPercentage: script.discountPercentage, imageUrl: script.imageUrl, slug: script.slug });
      toast.success('Added to cart!');
      setJustAdded(prev => new Set(prev).add(script.id));
      setTimeout(() => setJustAdded(prev => { const n = new Set(prev); n.delete(script.id); return n; }), 1500);
    }
  };

  // Helper function to check user's license status for a script
  const getLicenseStatus = (scriptId: string) => {
    const license = userLicenses.find(l => l.scriptId === scriptId);
    if (!license) return null;
    return {
      isTrial: license.isTrial,
      isActive: license.isActive,
      expiresAt: license.expiresAt
    };
  };

  const handleScriptAction = async (script: Script, action: string) => {
    if (action === 'trial') {
      setConfirmModal({ isOpen: true, type: 'trial', script });
      return;
    }

    if (action === 'buy') {
      setConfirmModal({ isOpen: true, type: 'buy', script });
      return;
    }

    setSelectedScript(script);
    setShowPopup(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.script) return;

    if (confirmModal.type === 'trial') {
      try {
        setConfirmLoading(true);
        await apiClient.createTrialLicense(confirmModal.script.id);
        toast.success('Trial license created! Check your dashboard.');
        setConfirmModal({ isOpen: false, type: 'buy', script: null });
        window.location.href = '/dashboard';
      } catch (error: any) {
        console.error('Failed to create trial license:', error);
        toast.error(error?.message || 'Failed to claim trial. Please try again.');
      } finally {
        setConfirmLoading(false);
      }
    } else if (confirmModal.type === 'buy') {
      const s = confirmModal.script!;
      const rawPrice = parseFloat(String(s.price || '0').replace('$', '')) || 0;
      addItem({ id: s.id, name: s.name || (s as any).title || '', price: rawPrice, discountPercentage: s.discountPercentage, imageUrl: s.imageUrl, slug: s.slug });
      setConfirmModal({ isOpen: false, type: 'buy', script: null });
      window.location.href = `/${locale}/checkout`;
    }
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: 'buy', script: null });
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedScript(null);
  };

  return (
    <>
    <main className="overflow-hidden relative pt-24 min-h-screen bg-[#0a0a0a]">

      {/* Header Section */}
      <div className="relative z-10 px-4 sm:px-6 pt-8 pb-12 bg-[#0d0d0d] section-dots">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-white/[0.07] bg-[#151515]">
              <Package className="w-4 h-4 text-[#51a2ff]" />
              <span className="text-sm font-medium text-[#51a2ff]">{t('badge')}</span>
            </div>

            <h1 className="mb-4 text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.4]">
              {t('marketplace')}
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-[#999]">
              {t('marketplaceDesc')}
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="card-base p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888]" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-base w-full h-12 pl-12 pr-4"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveFilter(activeFilter === 'popular' ? null : 'popular')}
                  className={`h-12 px-4 rounded-[50px] font-medium transition-colors inline-flex items-center gap-2 text-sm ${
                    activeFilter === 'popular'
                      ? 'badge-active'
                      : 'badge-blue'
                  }`}
                >
                  <Fire size={16} weight="fill" />
                  <span className="hidden sm:inline">{t('popular')}</span>
                </button>
                <button
                  onClick={() => setActiveFilter(activeFilter === 'new' ? null : 'new')}
                  className={`h-12 px-4 rounded-[50px] font-medium transition-colors inline-flex items-center gap-2 text-sm ${
                    activeFilter === 'new'
                      ? 'badge-active'
                      : 'badge-blue'
                  }`}
                >
                  <Sparkle size={16} weight="fill" />
                  <span className="hidden sm:inline">{t('new')}</span>
                </button>
                <button
                  onClick={() => setActiveFilter(activeFilter === 'trial' ? null : 'trial')}
                  className={`h-12 px-4 rounded-[50px] font-medium transition-colors inline-flex items-center gap-2 text-sm ${
                    activeFilter === 'trial'
                      ? 'badge-active'
                      : 'badge-blue'
                  }`}
                >
                  <Gift size={16} weight="fill" />
                  <span className="hidden sm:inline">{t('freeTrial')}</span>
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3">
                <Funnel size={14} className="text-[#888]" />
                <span className="text-sm text-[#888]">{t('categories')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'badge-active'
                        : 'badge-blue'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Info Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-[#888]">
                {t('showingResults')} <span className="text-white font-semibold">{filteredScripts.length}</span> {t('scripts')}
              </span>
              {(activeFilter || selectedCategory !== 'All' || searchTerm) && (
                <button
                  onClick={() => {
                    setActiveFilter(null);
                    setSelectedCategory('All');
                    setSearchTerm('');
                  }}
                  className="text-sm text-[#51a2ff] hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {t('clearFilters')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="container relative z-10 px-4 sm:px-6 py-16 mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card-base overflow-hidden">
                  <div className="h-48 animate-shimmer bg-[#1a1a1a]"></div>
                  <div className="p-6">
                    <div className="h-4 animate-shimmer bg-[#1a1a1a] rounded w-1/3 mb-4"></div>
                    <div className="h-6 animate-shimmer bg-[#1a1a1a] rounded w-3/4 mb-3"></div>
                    <div className="h-4 animate-shimmer bg-[#1a1a1a] rounded w-full mb-2"></div>
                    <div className="h-4 animate-shimmer bg-[#1a1a1a] rounded w-2/3 mb-6"></div>
                    <div className="h-11 animate-shimmer bg-[#1a1a1a] rounded-[50px]"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="container relative z-10 px-4 sm:px-6 py-16 mx-auto">
          <div className="max-w-md mx-auto">
            <div className="card-base p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-[#1a1a1a] rounded-[14px] flex items-center justify-center">
                <Warning size={32} className="text-[#51a2ff]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('errorLoading')}</h3>
              <p className="text-[#888] mb-6">{error}</p>
              <button
                onClick={refresh}
                className="btn-primary inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {t('tryAgain')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scripts Grid */}
      <div className="container relative z-10 px-4 sm:px-6 py-16 mx-auto">
        <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScripts.forEach ? (
            // Using forEach as requested
             (() => {
               const scriptElements: React.ReactElement[] = [];
              filteredScripts.forEach((script: Script, index: number) => {
                scriptElements.push(
                  <div
                    key={script.id}
                    className="group card-base overflow-hidden transition-all duration-200 hover:border-[#51a2ff]/30 hover:-translate-y-1 cursor-pointer"
                    onClick={() => window.location.href = `/script/${script.slug || script.id}`}
                  >
                    {/* Image/Preview Area */}
                    <div className="relative h-48 overflow-hidden bg-[#111]">
                      {script.imageUrl ? (
                        <img
                          src={script.imageUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${script.imageUrl}` : script.imageUrl}
                          alt={`${script.name || script.title} - ${typeof script.category === 'string' ? script.category : script.category?.name || 'FiveM Script'} | Premium FiveM Resource for Download`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="w-20 h-20 rounded-[14px] bg-[#1a1a1a] border border-white/[0.07] flex items-center justify-center">
                            <div className="text-4xl">{script.icon}</div>
                          </div>
                        </div>
                      )}

                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-transparent opacity-70"></div>

                      {/* Badge */}
                      {script.popular && script.new ? (
                        <div className="absolute top-3 right-3 badge-active text-xs font-bold inline-flex items-center gap-1 px-2.5 py-1">
                          <Sparkle size={12} weight="fill" />Special
                        </div>
                      ) : script.popular ? (
                        <div className="absolute top-3 right-3 badge-active text-xs font-bold inline-flex items-center gap-1 px-2.5 py-1">
                          <Fire size={12} weight="fill" />Popular
                        </div>
                      ) : script.new ? (
                        <div className="absolute top-3 right-3 badge-active text-xs font-bold inline-flex items-center gap-1 px-2.5 py-1">
                          <Sparkle size={12} weight="fill" />New
                        </div>
                      ) : null}

                      {/* Free Trial badge (top-left) */}
                      {script.trialAvailable && !getLicenseStatus(script.id) && (
                        <div className="absolute top-3 left-3 badge-blue text-xs font-bold inline-flex items-center gap-1 px-2.5 py-1">
                          <Gift size={12} weight="fill" />Free Trial
                        </div>
                      )}

                      {/* Discount badge */}
                      {(script.discountPercentage ?? 0) > 0 && (
                        <div className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold text-white bg-[#51a2ff] rounded-full">
                          -{script.discountPercentage}%
                        </div>
                      )}

                      {/* Price tag */}
                      <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-[10px] bg-black/70 border border-white/[0.07]">
                        {(script.discountPercentage ?? 0) > 0 ? (
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-[#888] line-through">{script.price}</span>
                            <span className="text-lg font-bold text-[#51a2ff]">
                              ${(parseFloat((script.price || '0').replace('$', '')) * (1 - (script.discountPercentage ?? 0) / 100)).toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-[#51a2ff]">{script.price}</span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 sm:p-6">
                      {/* Category & License Status */}
                      <div className="mb-3 flex items-center gap-2 flex-wrap">
                        <span className="badge-blue inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full">
                          {script.icon}
                          <span>{typeof script.category === 'string' ? script.category : script.category?.name}</span>
                        </span>
                        {/* License Status Badge */}
                        {(() => {
                          const licenseStatus = getLicenseStatus(script.id);
                          if (licenseStatus) {
                            if (licenseStatus.isTrial) {
                              return (
                                <span className="badge-blue inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full">
                                  <Gift size={12} weight="fill" />Trial
                                </span>
                              );
                            } else {
                              return (
                                <span className="badge-active inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full">
                                  <CheckCircle size={12} weight="fill" />Paid
                                </span>
                              );
                            }
                          }
                          return null;
                        })()}
                      </div>

                      {/* Title */}
                      <h3 className="mb-2 text-lg sm:text-xl font-bold text-white group-hover:text-[#51a2ff] transition-colors duration-200">
                        {script.title}
                      </h3>

                      {/* Description */}
                      <p className="mb-4 text-sm text-[#888] line-clamp-2 leading-relaxed">
                        {script.description}
                      </p>

                      {/* Features */}
                      <div className="mb-5 space-y-1.5">
                        {Array.isArray(script.features) ? (
                          script.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-center text-sm text-[#999]">
                              <svg className="w-3.5 h-3.5 mr-2 text-[#51a2ff] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="truncate">{feature}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center text-sm text-[#999]">
                            <svg className="w-3.5 h-3.5 mr-2 text-[#51a2ff] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="truncate">{script.features}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        {user ? (
                          (() => {
                            const licenseStatus = getLicenseStatus(script.id);

                            // Owned
                            if (licenseStatus && !licenseStatus.isTrial) {
                              return (
                                <button
                                  onClick={() => window.location.href = '/dashboard'}
                                  className="w-full btn-primary flex items-center justify-center gap-1.5"
                                >
                                  <CheckCircle size={14} weight="fill" />{t('ownedView')}
                                </button>
                              );
                            }

                            // Trial active — upgrade
                            if (licenseStatus && licenseStatus.isTrial) {
                              return (
                                <button
                                  onClick={() => handleScriptAction(script, 'buy')}
                                  className="w-full btn-primary flex items-center justify-center gap-1.5"
                                >
                                  <ArrowUp size={14} weight="bold" />{t('upgradeFull')}
                                </button>
                              );
                            }

                            // No license + trial available → 3 buttons
                            if (script.trialAvailable && user.trialEndAt && new Date(user.trialEndAt) > new Date()) {
                              return (
                                <div className="space-y-2">
                                  <button
                                    onClick={() => handleScriptAction(script, 'buy')}
                                    className="w-full btn-primary"
                                  >
                                    {t('buyNow')}
                                  </button>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={(e) => handleAddToCart(e, script)}
                                      className={`flex-1 py-2 text-sm font-semibold rounded-[50px] transition-colors flex items-center justify-center gap-1.5 ${
                                        justAdded.has(script.id)
                                          ? 'bg-[#51a2ff] text-white'
                                          : isInCart(script.id)
                                          ? 'border border-[#51a2ff] text-[#51a2ff] bg-transparent'
                                          : 'btn-ghost'
                                      }`}
                                    >
                                      {justAdded.has(script.id) ? (
                                        <><CheckCircle size={14} weight="fill" /> Added!</>
                                      ) : isInCart(script.id) ? (
                                        <><ShoppingCart className="w-3.5 h-3.5" /> In Cart</>
                                      ) : (
                                        <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>
                                      )}
                                    </button>
                                    <button
                                      onClick={() => handleScriptAction(script, 'trial')}
                                      className="flex-1 py-2 text-sm font-semibold btn-ghost flex items-center justify-center gap-1.5"
                                    >
                                      <Gift size={14} weight="fill" />{t('tryFree')}
                                    </button>
                                  </div>
                                </div>
                              );
                            }

                            // No trial — Buy Now + Add to Cart
                            return (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleScriptAction(script, 'buy')}
                                  className="flex-1 btn-primary"
                                >
                                  {t('buyNow')}
                                </button>
                                <button
                                  onClick={(e) => handleAddToCart(e, script)}
                                  className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-[50px] transition-colors flex items-center gap-1.5 ${
                                    justAdded.has(script.id)
                                      ? 'bg-[#51a2ff] text-white'
                                      : isInCart(script.id)
                                      ? 'border border-[#51a2ff] text-[#51a2ff] bg-transparent'
                                      : 'btn-ghost'
                                  }`}
                                  title={isInCart(script.id) ? 'In Cart' : 'Add to Cart'}
                                >
                                  {justAdded.has(script.id) ? (
                                    <><CheckCircle size={14} weight="fill" /> Added!</>
                                  ) : isInCart(script.id) ? (
                                    <><ShoppingCart className="w-3.5 h-3.5" /> In Cart</>
                                  ) : (
                                    <><ShoppingCart className="w-3.5 h-3.5" /></>
                                  )}
                                </button>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleScriptAction(script, 'buy')}
                              className="flex-1 btn-primary"
                            >
                              {t('buyNow')}
                            </button>
                            <button
                              onClick={(e) => handleAddToCart(e, script)}
                              className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-[50px] transition-colors flex items-center gap-1.5 ${
                                justAdded.has(script.id)
                                  ? 'bg-[#51a2ff] text-white'
                                  : isInCart(script.id)
                                  ? 'border border-[#51a2ff] text-[#51a2ff] bg-transparent'
                                  : 'btn-ghost'
                              }`}
                              title={isInCart(script.id) ? 'In Cart' : 'Add to Cart'}
                            >
                              {justAdded.has(script.id) ? (
                                <><CheckCircle size={14} weight="fill" /> Added!</>
                              ) : isInCart(script.id) ? (
                                <><ShoppingCart className="w-3.5 h-3.5" /> In Cart</>
                              ) : (
                                <ShoppingCart className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              });
              return scriptElements;
            })()
          ) : (
            // Fallback to map if forEach is not available
            filteredScripts.map((script: Script, index: number) => (
              <div
                key={script.id}
                className="group card-base overflow-hidden transition-all duration-200 hover:border-[#51a2ff]/30 hover:-translate-y-1 cursor-pointer"
                onClick={() => window.location.href = `/script/${script.id}`}
              >
                {/* Image/Preview Area */}
                <div className="relative h-48 overflow-hidden bg-[#111]">
                  {script.imageUrl ? (
                    <img
                      src={script.imageUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${script.imageUrl}` : script.imageUrl}
                      alt={`${script.name || script.title} - ${typeof script.category === 'string' ? script.category : script.category?.name || 'FiveM Script'} | Premium FiveM Resource for Download`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-20 h-20 rounded-[14px] bg-[#1a1a1a] border border-white/[0.07] flex items-center justify-center">
                        <div className="text-4xl">{script.icon}</div>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-transparent opacity-70"></div>

                  {script.popular && script.new ? (
                    <div className="absolute top-3 right-3 badge-active text-xs font-bold inline-flex items-center gap-1 px-2.5 py-1">
                      <Sparkle size={12} weight="fill" />{t('special')}
                    </div>
                  ) : script.popular ? (
                    <div className="absolute top-3 right-3 badge-active text-xs font-bold inline-flex items-center gap-1 px-2.5 py-1">
                      <Fire size={12} weight="fill" />{t('popular')}
                    </div>
                  ) : script.new ? (
                    <div className="absolute top-3 right-3 badge-active text-xs font-bold inline-flex items-center gap-1 px-2.5 py-1">
                      <Sparkle size={12} weight="fill" />{t('new')}
                    </div>
                  ) : null}

                  {/* Free Trial badge */}
                  {script.trialAvailable && !getLicenseStatus(script.id) && (
                    <div className="absolute top-3 left-3 badge-blue text-xs font-bold inline-flex items-center gap-1 px-2.5 py-1">
                      <Gift size={12} weight="fill" />{t('freeTrial')}
                    </div>
                  )}

                  {/* Discount badge */}
                  {(script.discountPercentage ?? 0) > 0 && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold text-white bg-[#51a2ff] rounded-full">
                      -{script.discountPercentage}%
                    </div>
                  )}

                  <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-[10px] bg-black/70 border border-white/[0.07]">
                    {(script.discountPercentage ?? 0) > 0 ? (
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-[#888] line-through">{script.price}</span>
                        <span className="text-lg font-bold text-[#51a2ff]">
                          ${(parseFloat((script.price || '0').replace('$', '')) * (1 - (script.discountPercentage ?? 0) / 100)).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-[#51a2ff]">{script.price}</span>
                    )}
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="mb-3 flex items-center gap-2 flex-wrap">
                    <span className="badge-blue inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full">
                      {script.icon}
                      <span>{typeof script.category === 'string' ? script.category : script.category?.name}</span>
                    </span>
                    {/* License Status Badge */}
                    {(() => {
                      const licenseStatus = getLicenseStatus(script.id);
                      if (licenseStatus) {
                        if (licenseStatus.isTrial) {
                          return (
                            <span className="badge-blue inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full">
                              <Gift size={12} weight="fill" />{t('freeTrial')}
                            </span>
                          );
                        } else {
                          return (
                            <span className="badge-active inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full">
                              <CheckCircle size={12} weight="fill" />{t('purchased')}
                            </span>
                          );
                        }
                      }
                      return null;
                    })()}
                  </div>

                  <h3 className="mb-2 text-lg sm:text-xl font-bold text-white group-hover:text-[#51a2ff] transition-colors duration-200">
                    {script.title}
                  </h3>

                  <p className="mb-4 text-sm text-[#888] line-clamp-2 leading-relaxed">
                    {script.description}
                  </p>

                  <div className="mb-5 space-y-1.5">
                    {Array.isArray(script.features) ? (
                      script.features.slice(0, 3).map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-center text-sm text-[#999]">
                          <svg className="w-3.5 h-3.5 mr-2 text-[#51a2ff] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="truncate">{feature}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center text-sm text-[#999]">
                        <svg className="w-3.5 h-3.5 mr-2 text-[#51a2ff] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate">{script.features as string}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {user ? (
                      (() => {
                        const licenseStatus = getLicenseStatus(script.id);

                        // User has purchased the script
                        if (licenseStatus && !licenseStatus.isTrial) {
                          return (
                            <button
                              onClick={() => window.location.href = '/dashboard'}
                              className="flex-1 btn-primary flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle size={14} weight="fill" /> {t('owned')}
                            </button>
                          );
                        }

                        // User has trial license
                        if (licenseStatus && licenseStatus.isTrial) {
                          return (
                            <div className="flex flex-1 gap-2">
                              <button
                                onClick={() => handleScriptAction(script, 'buy')}
                                className="flex-1 btn-primary"
                              >
                                {t('upgrade')}
                              </button>
                              <button
                                onClick={() => window.location.href = '/dashboard'}
                                className="px-4 btn-ghost"
                              >
                                {t('myScripts')}
                              </button>
                            </div>
                          );
                        }

                        // No license - show trial/buy options
                        if (user.trialEndAt && new Date(user.trialEndAt) > new Date() && script.trialAvailable) {
                          return (
                            <div className="flex flex-1 gap-2">
                              <button
                                onClick={() => handleScriptAction(script, 'trial')}
                                className="flex-1 btn-ghost flex items-center justify-center gap-1.5"
                              >
                                <Gift size={14} weight="fill" />{t('tryFree')}
                              </button>
                              <button
                                onClick={() => handleScriptAction(script, 'buy')}
                                className="flex-1 btn-primary"
                              >
                                {t('buy')}
                              </button>
                            </div>
                          );
                        } else {
                          return (
                            <button
                              onClick={() => handleScriptAction(script, 'buy')}
                              className="flex-1 btn-primary"
                            >
                              {t('buyNow')}
                            </button>
                          );
                        }
                      })()
                    ) : (
                      <Link href="/auth/login" className="flex-1 btn-primary text-center">
                        {t('loginToBuy')}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredScripts.length === 0 && !loading && !error && (
          <div className="py-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-[#151515] border border-white/[0.07] rounded-[14px] flex items-center justify-center">
              <Search className="w-10 h-10 text-[#51a2ff]/50" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t('noScriptsFound')}</h3>
            <p className="text-[#888] mb-6">
              {scripts.length === 0 ? t('noScriptsInDb') : t('tryAdjustingSearch')}
            </p>
            <button
              onClick={() => {
                setActiveFilter(null);
                setSelectedCategory('All');
                setSearchTerm('');
              }}
              className="btn-ghost inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {t('resetFilters')}
            </button>
          </div>
        )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container section-padding mx-auto px-4 sm:px-6">
        <div className="relative mx-auto max-w-4xl overflow-hidden card-base p-8 sm:p-12">
          <div className="relative text-center">
            <h2 className="mb-4 text-2xl sm:text-3xl md:text-4xl font-bold text-white sm:mb-6">{t('customScriptTitle')}</h2>
            <p className="mx-auto mb-6 max-w-2xl text-lg text-[#999] sm:mb-8">
              {t('customScriptDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-primary">
                {t('requestCustom')}
              </Link>
              <Link href="/dashboard" className="btn-ghost">
                {t('viewMyScripts')}
              </Link>
            </div>
          </div>
        </div>
      </div>

    </main>

    {/* Popup Modal - Rendered via Portal to document.body */}
    {showPopup && selectedScript && typeof document !== 'undefined' && createPortal(
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80"
        onClick={closePopup}
      >
        <div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-[14px] border border-white/[0.07] bg-[#111] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={closePopup}
            className="absolute top-4 right-4 z-20 p-2 rounded-[10px] bg-[#1a1a1a] hover:bg-[#222] transition-colors text-[#888] hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Media Slider */}
          <div className="relative">
            <MediaSlider
              imageUrl={selectedScript.imageUrl}
              imageUrls={selectedScript.imageUrls}
              youtubeUrl={selectedScript.youtubeUrl}
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2 z-10">
              {selectedScript.popular && (
                <span className="badge-active px-2.5 py-1 text-xs font-bold inline-flex items-center gap-1">
                  <Fire size={12} weight="fill" />Popular
                </span>
              )}
              {selectedScript.new && (
                <span className="badge-active px-2.5 py-1 text-xs font-bold inline-flex items-center gap-1">
                  <Sparkle size={12} weight="fill" />New
                </span>
              )}
            </div>

            {/* Price Badge */}
            <div className="absolute bottom-20 right-4 px-4 py-2 rounded-[10px] bg-black/70 border border-white/[0.07] z-10">
              <span className="text-2xl font-bold text-[#51a2ff]">{selectedScript.price}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Category & Title */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="badge-blue inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full">
                  {selectedScript.icon}
                  <span>{typeof selectedScript.category === 'string' ? selectedScript.category : selectedScript.category?.name}</span>
                </span>
                {/* License Status Badge in Popup */}
                {(() => {
                  const licenseStatus = getLicenseStatus(selectedScript.id);
                  if (licenseStatus) {
                    if (licenseStatus.isTrial) {
                      return (
                        <span className="badge-blue inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full">
                          <Gift size={14} weight="fill" />You have a Free Trial
                        </span>
                      );
                    } else {
                      return (
                        <span className="badge-active inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full">
                          <CheckCircle size={14} weight="fill" />Purchased
                        </span>
                      );
                    }
                  }
                  return null;
                })()}
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">{selectedScript.title}</h3>
            </div>

            {/* Description */}
            <p className="mb-6 text-[#999] leading-relaxed">{selectedScript.description}</p>

            {/* Features Grid */}
            {Array.isArray(selectedScript.features) && selectedScript.features.length > 0 && (
              <div className="mb-6 p-4 rounded-[14px] bg-[#1a1a1a] border border-white/[0.07]">
                <h4 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-3">Features</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedScript.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-[#999]">
                      <svg className="w-3.5 h-3.5 mr-2 text-[#51a2ff] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {user ? (
                (() => {
                  const licenseStatus = getLicenseStatus(selectedScript.id);

                  // User has purchased the script
                  if (licenseStatus && !licenseStatus.isTrial) {
                    return (
                      <div className="flex-1 flex flex-col gap-3">
                        <div className="py-3 text-center font-semibold text-white bg-[#51a2ff] rounded-[50px]">
                          <CheckCircle size={14} weight="fill" className="inline mr-1.5" />You have paid for this script
                        </div>
                        <Link
                          href="/dashboard"
                          className="btn-ghost py-3 text-center"
                        >
                          Go to My Scripts
                        </Link>
                      </div>
                    );
                  }

                  // User has trial license - show upgrade button
                  if (licenseStatus && licenseStatus.isTrial) {
                    return (
                      <Link
                        href={`/script/${selectedScript.slug || selectedScript.id}`}
                        className="flex-1 btn-primary py-3 text-center"
                      >
                        <ArrowUp size={14} weight="bold" className="inline mr-1.5" />Upgrade from Trial - {selectedScript.price}
                      </Link>
                    );
                  }

                  // No license - show normal buy button
                  return (
                    <Link
                      href={`/script/${selectedScript.slug || selectedScript.id}`}
                      className="flex-1 btn-primary py-3 text-center"
                    >
                      Buy Now - {selectedScript.price}
                    </Link>
                  );
                })()
              ) : (
                <Link
                  href="/auth/login"
                  className="flex-1 btn-primary py-3 text-center"
                >
                  Login to Purchase
                </Link>
              )}
              <button
                onClick={closePopup}
                className="py-3 px-6 btn-ghost"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )}

    {/* Confirm Modal */}
    <ConfirmModal
      isOpen={confirmModal.isOpen}
      onClose={closeConfirmModal}
      onConfirm={handleConfirmAction}
      title={confirmModal.type === 'trial'
        ? t('startTrialTitle')
        : t('confirmPurchaseTitle')}
      description={confirmModal.type === 'trial'
        ? t('startTrialDesc')
        : t('confirmPurchaseDesc')}
      confirmText={confirmModal.type === 'trial' ? t('claimTrial') : t('continueToPayment')}
      cancelText={t('cancel')}
      type={confirmModal.type}
      loading={confirmLoading}
      scriptName={confirmModal.script?.title || confirmModal.script?.name}
      scriptPrice={confirmModal.type === 'trial' ? 'FREE (Trial)' : confirmModal.script?.price}
    />

    </>
  );
}

export default function ScriptsPage() {
  const t = useTranslations('scripts');
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen bg-[#0a0a0a]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#51a2ff] mb-4"></div>
          <p className="text-[#888]">{t('loading')}</p>
        </div>
      </div>
    }>
      <ScriptsPageContent />
    </Suspense>
  );
}
