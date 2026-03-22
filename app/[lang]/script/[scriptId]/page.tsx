'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { useTranslations } from 'next-intl';
import Head from 'next/head';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Shield, Download, Clock, CheckCircle, CreditCard, Star,
  Lock, Zap, Users, Award, Flame, Gift, ShoppingCart,
  Sparkles, TrendingUp, Package
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { MediaSlider } from '@/components/ui/media-slider';
import { useCartStore } from '@/lib/stores/cart-store';

interface Script {
  id: string;
  slug?: string;
  name: string;
  description: string;
  price: number;
  category: { id: string; name: string; description?: string; isActive: boolean; createdAt: string; updatedAt: string; };
  licenseType: 'forever' | 'date';
  foreverPrice?: number;
  datePrice?: number;
  defaultLicenseDurationDays?: number;
  imageUrl?: string;
  imageUrls?: string[];
  youtubeUrl?: string;
  downloadUrl?: string;
  features?: string | string[];
  requirements?: string;
  isActive: boolean;
  popular?: boolean;
  new?: boolean;
  trialAvailable?: boolean;
  createdAt: string;
  updatedAt: string;
}

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}


export default function ScriptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'en';
  const { user } = useAuth();
  const t = useTranslations('scriptDetail');

  const TRUST_STATS = [
    { icon: <Users className="w-5 h-5 text-cyan-400" />, value: '10K+', label: t('trustUsers') },
    { icon: <Star className="w-5 h-5 text-amber-400 fill-amber-400" />, value: '4.9/5', label: t('trustRating') },
    { icon: <Download className="w-5 h-5 text-emerald-400" />, value: 'Instant', label: t('trustDelivery') },
    { icon: <Shield className="w-5 h-5 text-violet-400" />, value: '24/7', label: t('trustSupport') },
  ];

  const [script, setScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLicenseType, setSelectedLicenseType] = useState<'forever' | 'date'>('forever');
  const [viewerCount] = useState(() => Math.floor(Math.random() * 18) + 7);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsAvg, setReviewsAvg] = useState(0);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [myReview, setMyReview] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewHover, setReviewHover] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);

  const scriptId = params.scriptId as string;

  useEffect(() => {
    if (!scriptId) return;
    const fetchScript = async () => {
      try {
        setLoading(true);
        const endpoint = isUUID(scriptId) ? `/scripts/${scriptId}` : `/scripts/by-slug/${scriptId}`;
        const response = await apiClient.get<{ data: Script }>(endpoint);
        const scriptData = (response as any).data || response;
        setScript(scriptData as Script);
        if (scriptData?.licenseType) setSelectedLicenseType(scriptData.licenseType);

        // Fetch reviews for this script
        const rid = scriptData?.id || scriptId;
        try {
          const rv = await apiClient.getScriptReviews(rid) as any;
          setReviews(rv?.reviews || []);
          setReviewsAvg(rv?.averageRating || 0);
          setReviewsTotal(rv?.total || 0);
        } catch {}

        // Fetch current user's review if logged in
        if (user) {
          try {
            const mine = await apiClient.getMyReview(rid) as any;
            if (mine?.id) {
              setMyReview(mine);
              setReviewRating(mine.rating);
              setReviewComment(mine.comment);
            }
          } catch {}
        }
      } catch (err: any) {
        setError(t('scriptNotFound'));
        toast.error(t('scriptNotFound'));
      } finally {
        setLoading(false);
      }
    };
    fetchScript();
  }, [scriptId, user]);

  const handleSubmitReview = async () => {
    if (!script) return;
    if (reviewComment.trim().length < 10) {
      toast.error('Comment must be at least 10 characters.');
      return;
    }
    setSubmittingReview(true);
    try {
      const saved = await apiClient.submitReview(script.id, reviewRating, reviewComment.trim()) as any;
      setMyReview(saved);
      setReviews((prev) => {
        const idx = prev.findIndex((r) => r.userId === saved.userId);
        if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
        return [saved, ...prev];
      });
      setReviewsTotal((t) => myReview ? t : t + 1);
      toast.success(myReview ? 'Review updated!' : 'Review submitted!');
    } catch (err: any) {
      toast.error(err?.message || 'You must own a license for this script to leave a review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview) return;
    try {
      await apiClient.deleteReview(myReview.id);
      setReviews((prev) => prev.filter((r) => r.id !== myReview.id));
      setMyReview(null);
      setReviewComment('');
      setReviewRating(5);
      setReviewsTotal((t) => t - 1);
      toast.success('Review deleted.');
    } catch {
      toast.error('Failed to delete review.');
    }
  };

  const getCurrentPrice = () => {
    if (!script) return 0;
    if (script.licenseType === 'forever') return script.foreverPrice || script.price;
    if (script.licenseType === 'date') return script.datePrice || script.price;
    return selectedLicenseType === 'forever' ? (script.foreverPrice || script.price) : (script.datePrice || script.price);
  };

  const currentPrice = getCurrentPrice();

  const formatFeatures = (features: string | string[] | undefined): string[] => {
    if (!features) return [];
    if (Array.isArray(features)) return features;
    if (typeof features === 'string') {
      try { const p = JSON.parse(features); return Array.isArray(p) ? p : [features]; } catch {}
      if (features.includes(',')) return features.split(',').map(f => f.trim()).filter(f => f);
      return features.split('\n').filter(f => f.trim());
    }
    return [];
  };

  const handleAddToCart = () => {
    if (!script) return;
    addItem({
      id: script.id,
      name: script.name,
      price: currentPrice,
      imageUrl: script.imageUrl,
    });
    setJustAdded(true);
    toast.success('Added to cart!');
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!user) {
      router.push(`/${locale}/auth/login?redirect=/${locale}/script/${scriptId}`);
      return;
    }
    router.push(`/${locale}/payment/${script?.slug || scriptId}`);
  };

  const handleFreeTrial = () => {
    if (!user) {
      router.push(`/${locale}/auth/login?redirect=/${locale}/script/${scriptId}`);
      return;
    }
    router.push(`/${locale}/payment/${script?.slug || scriptId}?trial=true`);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-400 text-sm">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !script) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center p-8 bg-white/[0.04] border border-white/[0.08] rounded-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{t('error')}</h2>
          <p className="text-gray-400 text-sm mb-6">{error || t('scriptNotFound')}</p>
          <Link href={`/${locale}/scripts`}>
            <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToScripts')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const features = formatFeatures(script.features);

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#030712]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(53,189,242,0.12),transparent)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_60%_60%_at_100%_100%,rgba(16,185,129,0.08),transparent)]" />
      </div>
      <div className="fixed top-20 left-10 w-40 h-40 bg-cyan-500/15 rounded-full blur-[80px] animate-pulse pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-40 h-40 bg-violet-500/10 rounded-full blur-[80px] animate-pulse pointer-events-none" style={{animationDelay:'2s'}} />

      <div className="relative z-10 container mx-auto px-4 py-8 pt-24">

        {/* Back nav */}
        <div className="mb-8">
          <Link href={`/${locale}/scripts`}>
            <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {t('backToScripts')}
            </button>
          </Link>
        </div>

        {/* Script Hero */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
              {script.category?.name || 'Script'}
            </span>
            {script.popular && (
              <span className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3" /> {t('popular')}
              </span>
            )}
            {script.new && (
              <span className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {t('new')}
              </span>
            )}
            {script.trialAvailable && (
              <span className="px-3 py-1 text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <Gift className="w-3 h-3" /> {t('freeTrialAvailable')}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
            {script.name}
          </h1>

          {/* Star rating row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
              <span className="text-white font-semibold ml-1">4.9</span>
              <span className="text-gray-500">(Premium)</span>
            </div>
            <span className="text-gray-700">·</span>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{viewerCount} {t('viewingNow')}</span>
            </div>
          </div>
        </div>

        {/* Trust Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {TRUST_STATS.map((stat, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <div className="flex-shrink-0">{stat.icon}</div>
              <div>
                <div className="text-white font-bold text-sm">{stat.value}</div>
                <div className="text-gray-500 text-xs">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* LEFT: Script info (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Media */}
            <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.02]">
              <MediaSlider
                imageUrl={script.imageUrl}
                imageUrls={script.imageUrls}
                youtubeUrl={script.youtubeUrl}
                className="w-full"
              />
            </div>

            {/* Description */}
            <div className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-400" />
                {t('aboutScript')}
              </h2>
              <p className="text-gray-300 leading-relaxed text-[15px]">{script.description}</p>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="p-6 bg-gradient-to-br from-emerald-900/10 to-teal-900/5 border border-emerald-500/15 rounded-2xl">
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/15">
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                  {t('keyFeatures')}
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 group">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-emerald-500/30 transition-colors">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                      </div>
                      <span className="text-gray-300 text-sm leading-snug" dir="auto">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {script.requirements && (
              <div className="p-6 bg-gradient-to-br from-yellow-900/10 to-orange-900/5 border border-yellow-500/15 rounded-2xl">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-yellow-500/15">
                    <Shield className="w-4 h-4 text-yellow-400" />
                  </div>
                  {t('systemRequirements')}
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed">{script.requirements}</p>
              </div>
            )}

            {/* Reviews */}
            <div className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-violet-400" />
                  Customer Reviews
                </h2>
                {reviewsTotal > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(reviewsAvg) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                      ))}
                    </div>
                    <span className="text-white text-sm font-bold">{reviewsAvg.toFixed(1)}</span>
                    <span className="text-gray-500 text-xs">({reviewsTotal})</span>
                  </div>
                )}
              </div>

              {/* Leave a review (logged in users) */}
              {user && (
                <div className="mb-5 p-4 bg-white/[0.03] border border-white/[0.07] rounded-xl">
                  <p className="text-sm font-semibold text-white mb-3">
                    {myReview ? 'Edit your review' : 'Leave a review'}
                  </p>
                  {/* Star picker */}
                  <div className="flex items-center gap-1 mb-3">
                    {[1,2,3,4,5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewRating(s)}
                        onMouseEnter={() => setReviewHover(s)}
                        onMouseLeave={() => setReviewHover(0)}
                        className="focus:outline-none"
                      >
                        <Star className={`w-6 h-6 transition-colors ${s <= (reviewHover || reviewRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                      </button>
                    ))}
                    <span className="text-gray-400 text-xs ml-2">{reviewRating}/5</span>
                  </div>
                  {/* Comment */}
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this script... (min 10 characters)"
                    rows={3}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-gray-200 placeholder:text-gray-600 text-sm focus:border-cyan-500/50 focus:outline-none resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || reviewComment.trim().length < 10}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                    >
                      {submittingReview ? 'Saving...' : myReview ? 'Update Review' : 'Submit Review'}
                    </button>
                    {myReview && (
                      <button
                        onClick={handleDeleteReview}
                        className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/20 transition-all"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Reviews list */}
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No reviews yet. Be the first to share your experience!
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {review.user?.discordAvatar ? (
                            <img src={review.user.discordAvatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500/40 to-blue-500/40 flex items-center justify-center text-xs font-bold text-white">
                              {(review.user?.username || '?')[0].toUpperCase()}
                            </div>
                          )}
                          <span className="text-white text-sm font-medium">{review.user?.username || 'Anonymous'}</span>
                          <span className="text-xs text-gray-600">{t('verifiedBuyer')}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">"{review.comment}"</p>
                      <p className="text-xs text-gray-600 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}

              {!user && (
                <div className="mt-4 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-center">
                  <p className="text-gray-500 text-sm">
                    <Link href={`/${locale}/auth/login`} className="text-cyan-400 hover:underline">Log in</Link> and purchase this script to leave a review.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Purchase card (1/3, sticky) */}
          <div className="lg:sticky lg:top-28 space-y-4">

            {/* Price card */}
            <div className="p-6 bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/[0.1] rounded-2xl backdrop-blur-xl shadow-xl">

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">${currentPrice}</span>
                <span className="text-gray-500 text-sm">
                  {script.licenseType === 'forever' ? t('perForever') : `/ ${script.defaultLicenseDurationDays || 30} ${t('days')}`}
                </span>
              </div>

              {/* Live viewers */}
              <div className="flex items-center gap-2 text-xs text-emerald-400 mb-5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {viewerCount} {t('viewingCard')}
              </div>

              {/* License info */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
                  <span className="text-gray-400 text-sm">{t('licenseType')}</span>
                  <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/25 text-xs">
                    {script.licenseType === 'forever' ? `♾️ ${t('lifetime')}` : `⏱️ ${t('timeBased')}`}
                  </Badge>
                </div>
                {script.licenseType === 'date' && script.defaultLicenseDurationDays && (
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
                    <span className="text-gray-400 text-sm">{t('duration')}</span>
                    <span className="text-white text-sm font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-yellow-400" />
                      {script.defaultLicenseDurationDays} {t('days')}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-400 text-sm">{t('support')}</span>
                  <span className="text-emerald-400 text-sm font-semibold">✓ {t('included')}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleBuyNow}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  <CreditCard className="w-4 h-4" />
                  {t('buyNow')} — ${currentPrice}
                </button>

                <button
                  onClick={handleAddToCart}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${
                    justAdded
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-white/[0.05] border-white/[0.1] text-gray-300 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {justAdded ? 'Added!' : t('addToCart')}
                </button>

                {script.trialAvailable && (
                  <button
                    onClick={handleFreeTrial}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Gift className="w-4 h-4" />
                    {t('startFreeTrial')}
                  </button>
                )}
              </div>

              {/* Security badges */}
              <div className="flex flex-wrap justify-center gap-3 mt-5 pt-5 border-t border-white/[0.05]">
                {[
                  { icon: <Lock className="w-3.5 h-3.5 text-green-400" />, label: t('sslSecure') },
                  { icon: <Shield className="w-3.5 h-3.5 text-blue-400" />, label: t('pciCompliant') },
                  { icon: <Award className="w-3.5 h-3.5 text-cyan-400" />, label: t('instantAccess') },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                    {b.icon}
                    {b.label}
                  </div>
                ))}
              </div>
            </div>

            {/* What you get */}
            <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <h3 className="text-white text-sm font-semibold mb-3">{t('whatsIncluded')}</h3>
              <ul className="space-y-2">
                {[
                  t('included1'),
                  t('included2'),
                  t('included3'),
                  t('included4'),
                  t('included5'),
                  t('included6'),
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
