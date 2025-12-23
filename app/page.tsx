'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Zap, BarChart3, Plug, Bot, Sparkles, Rocket, Globe, Users, Flame, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  const [showTrialCTA, setShowTrialCTA] = useState(true);
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const [featuredScripts, setFeaturedScripts] = useState<any[]>([]);
  const [isLoadingScripts, setIsLoadingScripts] = useState(true);
  const router = useRouter();

  // Fetch popular/new scripts
  useEffect(() => {
    const fetchFeaturedScripts = async () => {
      try {
        const response: any = await apiClient.get('/scripts/active');
        const scripts = response.data?.data || response.data || [];
        // Filter for popular or new scripts, limit to 4
        const featured = scripts.filter((s: any) => s.popular || s.new).slice(0, 4);
        // If not enough featured, fill with any active scripts
        if (featured.length < 4) {
          const remaining = scripts.filter((s: any) => !featured.includes(s)).slice(0, 4 - featured.length);
          featured.push(...remaining);
        }
        setFeaturedScripts(featured.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch scripts:', error);
      } finally {
        setIsLoadingScripts(false);
      }
    };
    fetchFeaturedScripts();
  }, []);

  const handleStartTrial = () => {
    if (!isAuthenticated) {
      router.push('/auth/register');
      return;
    }
    
    // Check if user already has active trial
    if (user?.trialStartAt && user?.trialEndAt) {
      const trialEnd = new Date(user.trialEndAt);
      const now = new Date();
      
      if (trialEnd > now) {
        toast.error('You already have an active trial!');
        router.push('/dashboard');
        return;
      } else {
        toast.error('Your trial period has ended. Please purchase a license.');
        return;
      }
    }
    
    // Redirect to scripts page where user can choose a script to trial
    router.push('/scripts');
    toast.success('Browse scripts and click "Start Free Trial" on any script!');
  };

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setShowTrialCTA(true);
      return;
    }
    
    // Hide CTA if user has started a trial (active or ended)
    if (user.trialStartAt) {
      setShowTrialCTA(false);
    } else {
      setShowTrialCTA(true);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Hero section animations
    const heroElements = heroRef.current?.querySelectorAll('.animate-element');
    if (heroElements) {
      gsap.fromTo(heroElements, 
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1, 
          stagger: 0.2, 
          ease: "power2.out" 
        }
      );
    }

    // Features section scroll animation
    const featureCards = featuresRef.current?.querySelectorAll('.feature-card');
    if (featureCards) {
      gsap.fromTo(featureCards,
        { opacity: 0, y: 80, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Stats section scroll animation
    const statCards = statsRef.current?.querySelectorAll('.stat-card');
    if (statCards) {
      gsap.fromTo(statCards,
        { opacity: 0, y: 60, rotationY: 45 },
        {
          opacity: 1,
          y: 0,
          rotationY: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 75%",
            end: "bottom 25%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // CTA section scroll animation
    const ctaElement = ctaRef.current?.querySelector('.cta-content');
    if (ctaElement) {
      gsap.fromTo(ctaElement,
        { opacity: 0, scale: 0.8, rotationX: 15 },
        {
          opacity: 1,
          scale: 1,
          rotationX: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Refresh ScrollTrigger to prevent infinite scroll issues
    ScrollTrigger.refresh();

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
  return (
    <main className="min-h-screen relative overflow-x-hidden bg-[#030712]">
      {/* Enhanced Background Elements */}
      <div className="rotating-gradient"></div>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(53,189,242,0.15),transparent)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_60%_60%_at_100%_100%,rgba(16,185,129,0.1),transparent)]"></div>
      </div>
      <div className="floating-orb w-32 h-32 top-20 left-10"></div>
      <div className="floating-orb w-24 h-24 top-40 right-20 opacity-60" style={{animationDelay: '2s'}}></div>
      <div className="floating-orb w-40 h-40 bottom-20 left-1/4 opacity-40" style={{animationDelay: '4s'}}></div>
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/50 via-transparent to-transparent"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-cyan-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl"></div>
        </div>
        
        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_40%,transparent_100%)]"></div>
        
        <div className="container relative z-10">
          <div className="text-center max-w-6xl mx-auto padding-responsive">
            {/* Floating badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-cyan-500/20 rounded-full px-5 sm:px-8 py-2.5 sm:py-3 mb-8 sm:mb-10 lg:mb-12 animate-element shadow-lg shadow-cyan-500/10">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </div>
              <span className="text-xs sm:text-sm lg:text-base font-medium bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Trusted by 10,000+ FiveM developers</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-6 sm:mb-8 lg:mb-10 xl:mb-12 animate-element leading-[0.9] tracking-tight">
              <span className="block bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent drop-shadow-2xl">FiveM Scripts</span>
              <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">That Just Work</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-10 sm:mb-12 lg:mb-16 max-w-3xl mx-auto leading-relaxed animate-element px-4 sm:px-0">
              Premium NUI scripts with <span className="text-cyan-400 font-medium">modern design</span>, 
              <span className="text-blue-400 font-medium"> instant delivery</span>, and 
              <span className="text-emerald-400 font-medium"> secure licensing</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center mb-16 sm:mb-20 lg:mb-24 animate-element px-4 sm:px-0">
              <Link href="/scripts" className="w-full sm:w-auto group">
                <Button size="lg" className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-400/40 transition-all duration-500 hover:scale-[1.02] text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 h-auto font-semibold rounded-xl">
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                  <Rocket className="w-5 h-5 mr-2.5" />
                  Explore Scripts
                </Button>
              </Link>
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full border-gray-700 bg-white/5 text-gray-200 hover:bg-white/10 hover:text-white hover:border-gray-600 transition-all duration-300 backdrop-blur-xl text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 h-auto font-medium rounded-xl">
                  <Globe className="w-5 h-5 mr-2.5" />
                  Get Started Free
                </Button>
              </Link>
            </div>
            
            {/* Hero Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 animate-element max-w-4xl mx-auto">
              <div className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-500 hover:shadow-lg hover:shadow-cyan-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                <div className="relative">
                  <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">500+</div>
                  <p className="text-base text-gray-300 font-medium">Premium Scripts</p>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-500 hover:shadow-lg hover:shadow-blue-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                <div className="relative">
                  <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">10K+</div>
                  <p className="text-base text-gray-300 font-medium">Happy Customers</p>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-500 hover:shadow-lg hover:shadow-emerald-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transpa   rent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                <div className="relative">
                  <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">24/7</div>
                  <p className="text-base text-gray-300 font-medium">Expert Support</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Scripts Section */}
      <section ref={featuresRef} id="features" className="py-20 sm:py-28 lg:py-36 relative">
        {/* Section background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/20 to-transparent"></div>
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">Featured Scripts</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight">
              <span className="text-white">Popular & New</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">Scripts</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
              Discover our most popular and latest FiveM NUI scripts.
            </p>
          </div>

          {isLoadingScripts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-cyan-900/20 to-slate-900/80 backdrop-blur-xl overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-cyan-600/20 to-blue-600/20"></div>
                  <div className="p-5">
                    <div className="h-4 bg-white/10 rounded w-1/3 mb-3"></div>
                    <div className="h-6 bg-white/10 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
                    <div className="h-4 bg-white/10 rounded w-2/3 mb-4"></div>
                    <div className="h-10 bg-white/10 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredScripts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {featuredScripts.map((script, index) => (
                <Link href={`/scripts/${script.slug || script.id}`} key={script.id}>
                  <div 
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-cyan-900/20 to-slate-900/80 backdrop-blur-xl transition-all duration-500 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-2 cursor-pointer"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    {/* Image/Preview Area */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-cyan-600/20 to-blue-600/20">
                      {script.imageUrl ? (
                        <img 
                          src={script.imageUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${script.imageUrl}` : script.imageUrl}
                          alt={script.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                            <Zap className="w-10 h-10 text-cyan-400" />
                          </div>
                        </div>
                      )}
                      
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                      
                      {/* Badge */}
                      {script.popular && script.new ? (
                        <div className="absolute top-3 right-3 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full shadow-lg animate-pulse inline-flex items-center gap-1">
                          <Star className="w-3.5 h-3.5" />Special
                        </div>
                      ) : script.popular ? (
                        <div className="absolute top-3 right-3 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg inline-flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5" />Popular
                        </div>
                      ) : script.new ? (
                        <div className="absolute top-3 right-3 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg inline-flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />New
                        </div>
                      ) : null}
                      
                      {/* Price tag */}
                      <div className="absolute bottom-3 right-3 px-4 py-2 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10">
                        <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                          ${script.price || script.foreverPrice || '0.00'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5 sm:p-6">
                      {/* Category */}
                      <div className="mb-3 flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          <Zap className="w-3 h-3" />
                          <span>{script.category?.name || 'Script'}</span>
                        </span>
                      </div>
                      
                      {/* Title */}
                      <h3 className="mb-2 text-lg sm:text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300 line-clamp-1">
                        {script.name}
                      </h3>
                      
                      {/* Description */}
                      <p className="mb-4 text-sm text-slate-400 line-clamp-2 leading-relaxed">
                        {script.description}
                      </p>
                      
                      {/* View Button */}
                      <div className="flex gap-2">
                        <span className="flex-1 py-2.5 text-sm font-semibold text-center text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25">
                          View Details
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No featured scripts available yet.</p>
            </div>
          )}
          
          {/* View All Button */}
          <div className="text-center mt-12">
            <Link href="/scripts">
              <Button size="lg" variant="outline" className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400/50 px-8 py-4 h-auto font-semibold rounded-xl">
                View All Scripts
                <Rocket className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-24 sm:py-32 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/30 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Trusted Platform</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
              Powering <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">FiveM</span> Servers
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">Built for server owners, developers, and communities worldwide</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            <div className="stat-card group relative text-center p-8 bg-gradient-to-b from-white/[0.08] to-transparent backdrop-blur-xl border border-white/10 rounded-3xl hover:border-cyan-500/40 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">10K+</div>
                <div className="text-sm text-gray-400 font-medium">Active Users</div>
              </div>
            </div>
            
            <div className="stat-card group relative text-center p-8 bg-gradient-to-b from-white/[0.08] to-transparent backdrop-blur-xl border border-white/10 rounded-3xl hover:border-blue-500/40 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent mb-2">Fast</div>
                <div className="text-sm text-gray-400 font-medium">Instant Delivery</div>
              </div>
            </div>
            
            <div className="stat-card group relative text-center p-8 bg-gradient-to-b from-white/[0.08] to-transparent backdrop-blur-xl border border-white/10 rounded-3xl hover:border-emerald-500/40 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">99.9%</div>
                <div className="text-sm text-gray-400 font-medium">Uptime SLA</div>
              </div>
            </div>
            
            <div className="stat-card group relative text-center p-8 bg-gradient-to-b from-white/[0.08] to-transparent backdrop-blur-xl border border-white/10 rounded-3xl hover:border-violet-500/40 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-400 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent mb-2">24/7</div>
                <div className="text-sm text-gray-400 font-medium">Expert Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      {showTrialCTA && (
        <section ref={ctaRef} className="py-24 sm:py-32 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/30 to-transparent"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-emerald-500/20 rounded-full blur-[120px]"></div>
        
          <div className="container relative z-10 mx-auto px-4 sm:px-6">
            <div className="cta-content relative overflow-hidden bg-gradient-to-b from-white/[0.1] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-10 sm:p-14 lg:p-20 text-center max-w-4xl mx-auto shadow-2xl">
              {/* Glow effects */}
              <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/30 rounded-full blur-[100px]"></div>
              <div className="absolute -bottom-20 left-1/4 w-60 h-60 bg-blue-500/20 rounded-full blur-[80px]"></div>
              <div className="absolute -bottom-20 right-1/4 w-60 h-60 bg-emerald-500/20 rounded-full blur-[80px]"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/20 rounded-full px-5 py-2 mb-8">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <span className="text-sm font-medium text-cyan-300">Limited time offer</span>
                </div>
                
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-[1.1]">
                  Ready to <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">Level Up</span>?
                </h2>
                
                <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Start your free trial today and experience premium FiveM scripts with instant access.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                  <Button 
                    size="lg" 
                    className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-400/40 transition-all duration-500 hover:scale-[1.02] text-lg px-10 py-5 h-auto font-semibold rounded-xl"
                    onClick={handleStartTrial}
                    disabled={isStartingTrial}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    <Rocket className="w-5 h-5 mr-2.5" />
                    {isStartingTrial ? 'Starting...' : 'Start Free Trial'}
                  </Button>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                    <span>No credit card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                    <span>3-day trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>
    )}
    </main>
  );
}

