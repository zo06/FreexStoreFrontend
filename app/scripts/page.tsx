'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useScripts, useActiveCategories } from '@/lib/simple-data-fetcher';
import { CodeSquare, Search, Filter, Grid3X3, List, TrendingUp, Zap, Package, RefreshCw } from 'lucide-react';
import { Robot, ChartBar, Plug, Cloud, Shield, Rocket, Brain, TrendUp, Eye, Database, Lightning, Warning, Star, Fire, Gift, CheckCircle, ArrowUp, Sparkle, Funnel, SortAscending } from 'phosphor-react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import PayPalBuyButton from '@/components/PayPalBuyButton';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { MediaSlider } from '@/components/ui/media-slider';

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
      'Automation': <Robot size={20} className="text-blue-400" />,
      'Data': <ChartBar size={20} className="text-green-400" />,
      'Infrastructure': <Plug size={20} className="text-orange-400" />,
      'Cloud': <Cloud size={20} className="text-sky-400" />,
      'Security': <Shield size={20} className="text-red-400" />,
      'DevOps': <Rocket size={20} className="text-cyan-400" />,
      'AI': <Brain size={20} className="text-pink-400" />,
      'Analytics': <TrendUp size={20} className="text-emerald-400" />,
      'Monitoring': <Eye size={20} className="text-yellow-400" />,
      'Database': <Database size={20} className="text-indigo-400" />
    };
    return iconMap[categoryName] || <Lightning size={20} className="text-gray-400" />;
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
    return <IconComponent size={20} className="text-blue-400" />;
  }

  // Fallback to default icon
  return <Lightning size={20} className="text-gray-400" />;
};

function ScriptsPageContent() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  const categoryParam = searchParams.get('category');
  
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
    // console.log(script)
     const displayPrice = script.price;
     const categoryName = script.category?.name || 'Uncategorized';
     const categoryIcon = renderCategoryIcon(script.category?.icon, categoryName);
    //  console.log(displayPrice)
     return {
       ...script,
       title: script.name, // Map name to title for display
       category: categoryName, // Use category name from relationship
       price: displayPrice ? `$${displayPrice}` : 'Coming SOON',
       features: script.features ? script.features.split(',').map((f: string) => f.trim()) : [],
       icon: categoryIcon,
       popular: script.popular || false,
       new: script.new || false,
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

  console.log(filteredScripts)

  const [trialLoading, setTrialLoading] = useState<string | null>(null);
  
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
    console.log(`Action: ${action} on script:`, script);
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
      setConfirmModal({ isOpen: false, type: 'buy', script: null });
      window.location.href = `/payment/${confirmModal.script.id}`;
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
    <main className="overflow-hidden relative pt-24 min-h-screen bg-[#030712]">
      {/* Enhanced Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(53,189,242,0.15),transparent)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_60%_60%_at_100%_100%,rgba(16,185,129,0.1),transparent)]"></div>
      </div>
      <div className="rotating-gradient"></div>
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute top-40 right-20 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '2s'}}></div>
      
      {/* Header Section */}
      <div className="container relative z-10 px-4 sm:px-6 pt-8 pb-12">
        <div className="mx-auto max-w-6xl">
          {/* Hero Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border backdrop-blur-sm bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
              <Package className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-300">Premium FiveM NUI Scripts</span>
            </div>
            
            <h1 className="mb-4 text-4xl sm:text-5xl lg:text-6xl font-bold">
              <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                Script Marketplace
              </span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              Discover premium NUI scripts for your FiveM server. Modern menus, HUDs, shops, and clean UI experiences.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-gradient-to-br from-white/[0.08] to-transparent backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search scripts by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                />
              </div>
              
              {/* Quick Filters */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveFilter(activeFilter === 'popular' ? null : 'popular')}
                  className={`h-12 px-4 rounded-xl font-medium transition-all duration-300 inline-flex items-center gap-2 ${
                    activeFilter === 'popular'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Fire size={18} weight="fill" />
                  <span className="hidden sm:inline">Popular</span>
                </button>
                <button
                  onClick={() => setActiveFilter(activeFilter === 'new' ? null : 'new')}
                  className={`h-12 px-4 rounded-xl font-medium transition-all duration-300 inline-flex items-center gap-2 ${
                    activeFilter === 'new'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Sparkle size={18} weight="fill" />
                  <span className="hidden sm:inline">New</span>
                </button>
                <button
                  onClick={() => setActiveFilter(activeFilter === 'trial' ? null : 'trial')}
                  className={`h-12 px-4 rounded-xl font-medium transition-all duration-300 inline-flex items-center gap-2 ${
                    activeFilter === 'trial'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Gift size={18} weight="fill" />
                  <span className="hidden sm:inline">Free Trial</span>
                </button>
              </div>
            </div>
            
            {/* Category Pills */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Funnel size={16} className="text-gray-500" />
                <span className="text-sm text-gray-500">Categories</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20'
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
              <span className="text-gray-400">
                Showing <span className="text-white font-semibold">{filteredScripts.length}</span> scripts
              </span>
              {(activeFilter || selectedCategory !== 'All' || searchTerm) && (
                <button
                  onClick={() => {
                    setActiveFilter(null);
                    setSelectedCategory('All');
                    setSearchTerm('');
                  }}
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Clear filters
                </button>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2 text-gray-500 text-sm">
              <Grid3X3 className="w-4 h-4" />
              Grid View
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="container relative z-10 px-4 sm:px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-cyan-900/20 to-slate-900/80 backdrop-blur-xl overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-cyan-600/10 to-blue-600/10"></div>
                  <div className="p-6">
                    <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
                    <div className="h-6 bg-white/10 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
                    <div className="h-4 bg-white/10 rounded w-2/3 mb-6"></div>
                    <div className="h-12 bg-white/10 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="container relative z-10 px-4 sm:px-6 pb-16">
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center">
                <Warning size={32} className="text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Error Loading Scripts</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <button 
                onClick={refresh} 
                className="h-12 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-300 inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Scripts Grid */}
      <div className="container relative z-10 px-4 sm:px-6 pb-16">
        <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScripts.forEach ? (
            // Using forEach as requested
             (() => {
               const scriptElements: React.ReactElement[] = [];
              filteredScripts.forEach((script: Script, index: number) => {
                console.log("MyScript" ,script)
                scriptElements.push(
                  <div
                    key={script.id}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-cyan-900/20 to-slate-900/80 backdrop-blur-xl transition-all duration-500 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-2 animate-slide-up cursor-pointer"
                    style={{animationDelay: `${index * 0.1}s`}}
                    onClick={() => handleScriptAction(script, 'preview')}
                  >
                    {/* Image/Preview Area */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-cyan-600/20 to-blue-600/20">
                      {script.imageUrl ? (
                        <img 
                          src={script.imageUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${script.imageUrl}` : script.imageUrl}
                          alt={script.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                            <div className="text-4xl">{script.icon}</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                      
                      {/* Badge */}
                      {script.popular && script.new ? (
                        <div className="absolute top-3 right-3 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full shadow-lg animate-pulse">
                          <Sparkle size={14} weight="fill" className="inline mr-1" />Special
                        </div>
                      ) : script.popular ? (
                        <div className="absolute top-3 right-3 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg">
                          <Fire size={14} weight="fill" className="inline mr-1" />Popular
                        </div>
                      ) : script.new ? (
                        <div className="absolute top-3 right-3 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg">
                          <Sparkle size={14} weight="fill" className="inline mr-1" />New
                        </div>
                      ) : null}
                      
                      {/* Price tag */}
                      <div className="absolute bottom-3 right-3 px-4 py-2 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10">
                        <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{script.price}</span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5 sm:p-6">
                      {/* Category & License Status */}
                      <div className="mb-3 flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {script.icon}
                          <span>{typeof script.category === 'string' ? script.category : script.category?.name}</span>
                        </span>
                        {/* License Status Badge */}
                        {(() => {
                          const licenseStatus = getLicenseStatus(script.id);
                          if (licenseStatus) {
                            if (licenseStatus.isTrial) {
                              return (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  <Gift size={14} weight="fill" className="inline mr-1" />Trial
                                </span>
                              );
                            } else {
                              return (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  <CheckCircle size={14} weight="fill" className="inline mr-1" />Paid
                                </span>
                              );
                            }
                          }
                          return null;
                        })()}
                      </div>
                      
                      {/* Title */}
                      <h3 className="mb-2 text-lg sm:text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300">
                        {script.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="mb-4 text-sm text-slate-400 line-clamp-2 leading-relaxed">
                        {script.description}
                      </p>
                      
                      {/* Features */}
                      <div className="mb-5 space-y-2">
                        {Array.isArray(script.features) ? (
                          script.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-center text-sm text-slate-300">
                              <svg className="w-4 h-4 mr-2 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="truncate">{feature}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center text-sm text-slate-300">
                            <svg className="w-4 h-4 mr-2 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="truncate">{script.features}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        {user ? (
                          (() => {
                            const licenseStatus = getLicenseStatus(script.id);
                            
                            // User has purchased the script
                            if (licenseStatus && !licenseStatus.isTrial) {
                              return (
                                <button 
                                  onClick={() => window.location.href = '/dashboard'}
                                  className="flex-1 py-2.5 text-sm font-semibold text-center text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl transition-all duration-300"
                                >
                                  <CheckCircle size={14} weight="fill" className="inline mr-1" />Owned - View
                                </button>
                              );
                            }
                            
                            // User has trial license - show upgrade button only
                            if (licenseStatus && licenseStatus.isTrial) {
                              return (
                                <button 
                                  onClick={() => handleScriptAction(script, 'buy')}
                                  className="flex-1 py-2.5 text-sm font-semibold text-center text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25 animate-pulse"
                                >
                                  <ArrowUp size={14} weight="bold" className="inline mr-1" />Upgrade to Full
                                </button>
                              );
                            }
                            
                            // No license - show trial/buy options (only if trialAvailable is true)
                            if (script.trialAvailable && user.trialEndAt && new Date(user.trialEndAt) > new Date()) {
                              return (
                                <div className="flex flex-1 gap-2">
                                  <button 
                                    onClick={() => handleScriptAction(script, 'trial')}
                                    className="flex-1 py-2.5 text-sm font-semibold text-center text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25"
                                  >
                                    <Gift size={14} weight="fill" className="inline mr-1" />Try Free
                                  </button>
                                  <button 
                                    onClick={() => handleScriptAction(script, 'buy')}
                                    className="flex-1 py-2.5 text-sm font-semibold text-center text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
                                  >
                                    Buy
                                  </button>
                                </div>
                              );
                            }
                            
                            // No trial available or trial expired - show buy only
                            return (
                              <button 
                                onClick={() => handleScriptAction(script, 'buy')}
                                className="flex-1 py-2.5 text-sm font-semibold text-center text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
                              >
                                Buy Now
                              </button>
                            );
                          })()
                        ) : (
                          <Link href="/auth/login" className="flex-1 py-2.5 text-sm font-semibold text-center text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25">
                            Login to Buy
                          </Link>
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
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-cyan-900/20 to-slate-900/80 backdrop-blur-xl transition-all duration-500 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-2 animate-slide-up cursor-pointer"
                style={{animationDelay: `${index * 0.1}s`}}
                onClick={() => handleScriptAction(script, 'preview')}
              >
                {/* Image/Preview Area */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-cyan-600/20 to-blue-600/20">
                  {script.imageUrl ? (
                    <img 
                      src={script.imageUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${script.imageUrl}` : script.imageUrl}
                      alt={script.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <div className="text-4xl">{script.icon}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                  
                  {script.popular && script.new ? (
                    <div className="absolute top-3 right-3 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full shadow-lg animate-pulse">
                      <Sparkle size={14} weight="fill" className="inline mr-1" />Special
                    </div>
                  ) : script.popular ? (
                    <div className="absolute top-3 right-3 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg">
                      <Fire size={14} weight="fill" className="inline mr-1" />Popular
                    </div>
                  ) : script.new ? (
                    <div className="absolute top-3 right-3 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg">
                      <Sparkle size={14} weight="fill" className="inline mr-1" />New
                    </div>
                  ) : null}
                  
                  <div className="absolute bottom-3 right-3 px-4 py-2 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10">
                    <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{script.price}</span>
                  </div>
                </div>
                
                <div className="p-5 sm:p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {script.icon}
                      <span>{typeof script.category === 'string' ? script.category : script.category?.name}</span>
                    </span>
                    {/* License Status Badge */}
                    {(() => {
                      const licenseStatus = getLicenseStatus(script.id);
                      if (licenseStatus) {
                        if (licenseStatus.isTrial) {
                          return (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <Gift size={14} weight="fill" className="inline mr-1" />Free Trial
                            </span>
                          );
                        } else {
                          return (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              <CheckCircle size={14} weight="fill" className="inline mr-1" />Purchased
                            </span>
                          );
                        }
                      }
                      return null;
                    })()}
                  </div>
                  
                  <h3 className="mb-2 text-lg sm:text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300">
                    {script.title}
                  </h3>
                  
                  <p className="mb-4 text-sm text-slate-400 line-clamp-2 leading-relaxed">
                    {script.description}
                  </p>
                  
                  <div className="mb-5 space-y-2">
                    {Array.isArray(script.features) ? (
                      script.features.slice(0, 3).map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-center text-sm text-slate-300">
                          <svg className="w-4 h-4 mr-2 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="truncate">{feature}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center text-sm text-slate-300">
                        <svg className="w-4 h-4 mr-2 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
                              className="flex-1 py-2.5 text-sm font-semibold text-center text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl transition-all duration-300"
                            >
                              ✅ Owned
                            </button>
                          );
                        }
                        
                        // User has trial license
                        if (licenseStatus && licenseStatus.isTrial) {
                          return (
                            <div className="flex flex-1 gap-2">
                              <button 
                                onClick={() => handleScriptAction(script, 'buy')}
                                className="flex-1 py-2.5 text-sm font-semibold text-center text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
                              >
                                ⬆️ Upgrade
                              </button>
                              <button 
                                onClick={() => window.location.href = '/dashboard'}
                                className="px-4 py-2.5 text-sm font-semibold text-center text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all duration-300"
                              >
                                📁 My Scripts
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
                                className="flex-1 py-2.5 text-sm font-semibold text-center text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25"
                              >
                                <Gift size={14} weight="fill" className="inline mr-1" />Try Free
                              </button>
                              <button 
                                onClick={() => handleScriptAction(script, 'buy')}
                                className="flex-1 py-2.5 text-sm font-semibold text-center text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
                              >
                                Buy
                              </button>
                            </div>
                          );
                        } else {
                          return (
                            <button 
                              onClick={() => handleScriptAction(script, 'buy')}
                              className="flex-1 py-2.5 text-sm font-semibold text-center text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
                            >
                              Buy Now
                            </button>
                          );
                        }
                      })()
                    ) : (
                      <Link href="/auth/login" className="flex-1 py-2.5 text-sm font-semibold text-center text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25">
                        Login to Buy
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
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center">
              <Search className="w-10 h-10 text-cyan-400/50" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No scripts found</h3>
            <p className="text-gray-400 mb-6">
              {scripts.length === 0 ? 'No scripts available in the database' : 'Try adjusting your search or filter criteria'}
            </p>
            <button
              onClick={() => {
                setActiveFilter(null);
                setSelectedCategory('All');
                setSearchTerm('');
              }}
              className="h-12 px-6 bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-300 inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Filters
            </button>
          </div>
        )}
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="container section-padding">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-900/40 via-slate-900/80 to-blue-900/40 backdrop-blur-xl p-8 sm:p-12 animate-scale-in">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative text-center">
            <h2 className="mb-4 text-2xl sm:text-3xl md:text-4xl font-bold text-white sm:mb-6">Need a Custom NUI Script?</h2>
            <p className="mx-auto mb-6 max-w-2xl text-lg text-slate-300 sm:mb-8">
              We can build custom FiveM NUI scripts tailored to your server's unique needs. Modern UI, clean code, secure licensing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="py-3.5 px-8 font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-0.5">
                Request Custom Script
              </Link>
              <Link href="/dashboard" className="py-3.5 px-8 font-semibold text-slate-300 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-500/50 rounded-xl transition-all duration-300">
                View My Scripts
              </Link>
            </div>
          </div>
        </div>
      </div>
      
    </main>

    {/* Modern Popup Modal - Rendered via Portal to document.body */}
    {showPopup && selectedScript && typeof document !== 'undefined' && createPortal(
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={closePopup}
      >
        <div 
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-cyan-900/30 to-slate-900 shadow-2xl shadow-cyan-500/20 animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button 
            onClick={closePopup}
            className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-black/60 hover:bg-black/80 transition-all duration-300 text-slate-400 hover:text-white"
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
                <span className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg">
                  <Fire size={14} weight="fill" className="inline mr-1" />Popular
                </span>
              )}
              {selectedScript.new && (
                <span className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg">
                  <Sparkle size={14} weight="fill" className="inline mr-1" />New
                </span>
              )}
            </div>
            
            {/* Price Badge */}
            <div className="absolute bottom-20 right-4 px-5 py-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 z-10">
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{selectedScript.price}</span>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Category & Title */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {selectedScript.icon}
                  <span>{typeof selectedScript.category === 'string' ? selectedScript.category : selectedScript.category?.name}</span>
                </span>
                {/* License Status Badge in Popup */}
                {(() => {
                  const licenseStatus = getLicenseStatus(selectedScript.id);
                  if (licenseStatus) {
                    if (licenseStatus.isTrial) {
                      return (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <Gift size={14} weight="fill" className="inline mr-1" />You have a Free Trial
                        </span>
                      );
                    } else {
                      return (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          <CheckCircle size={14} weight="fill" className="inline mr-1" />Purchased
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
            <p className="mb-6 text-slate-300 leading-relaxed">{selectedScript.description}</p>
            
            {/* Features Grid */}
            {Array.isArray(selectedScript.features) && selectedScript.features.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Features</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedScript.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-slate-300">
                      <svg className="w-4 h-4 mr-2 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
                        <div className="py-3.5 text-center font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl">
                          ✅ You have paid for this script
                        </div>
                        <Link 
                          href="/dashboard"
                          className="py-3.5 text-center font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
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
                        href={`/payment/${selectedScript.id}`}
                        className="flex-1 py-3.5 text-center font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 animate-pulse"
                      >
                        ⬆️ Upgrade from Trial - {selectedScript.price}
                      </Link>
                    );
                  }
                  
                  // No license - show normal buy button
                  return (
                    <Link 
                      href={`/payment/${selectedScript.id}`}
                      className="flex-1 py-3.5 text-center font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-0.5"
                    >
                      Buy Now - {selectedScript.price}
                    </Link>
                  );
                })()
              ) : (
                <Link 
                  href="/auth/login"
                  className="flex-1 py-3.5 text-center font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
                >
                  Login to Purchase
                </Link>
              )}
              <button 
                onClick={closePopup}
                className="py-3.5 px-6 font-semibold text-slate-300 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-500/50 rounded-xl transition-all duration-300"
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
        ? 'Start Free Trial?' 
        : 'Confirm Purchase'}
      description={confirmModal.type === 'trial'
        ? 'You are about to claim a free trial license for this script. The license will expire when your trial period ends.'
        : 'You will be redirected to the payment page to complete your purchase.'}
      confirmText={confirmModal.type === 'trial' ? 'Claim Trial' : 'Continue to Payment'}
      cancelText="Cancel"
      type={confirmModal.type}
      loading={confirmLoading}
      scriptName={confirmModal.script?.title || confirmModal.script?.name}
      scriptPrice={confirmModal.type === 'trial' ? 'FREE (Trial)' : confirmModal.script?.price}
    />
    </>
  );
}

export default function ScriptsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mb-4"></div>
          <p className="text-gray-400">Loading scripts...</p>
        </div>
      </div>
    }>
      <ScriptsPageContent />
    </Suspense>
  );
}

