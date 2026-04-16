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
    { icon: <Users className="w-4 h-4 text-[#51a2ff]" />, value: '10K+', label: t('trustUsers') },
    { icon: <Star className="w-4 h-4 text-[#51a2ff]" />, value: '4.9/5', label: t('trustRating') },
    { icon: <Download className="w-4 h-4 text-[#51a2ff]" />, value: 'Instant', label: t('trustDelivery') },
    { icon: <Shield className="w-4 h-4 text-[#51a2ff]" />, value: '24/7', label: t('trustSupport') },
  ];

  const [script, setScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLicenseType, setSelectedLicenseType] = useState<'forever' | 'date'>('forever');
  const [viewerCount] = useState(() => Math.floor(Math.random() * 18) + 7);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

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
        const rid = scriptData?.id || scriptId;
        try {
          const rv = await apiClient.getScriptReviews(rid) as any;
          setReviews(rv?.reviews || []);
          setReviewsAvg(rv?.averageRating || 0);
          setReviewsTotal(rv?.total || 0);
        } catch { /* silent */ }
        if (user) {
          try {
            const mine = await apiClient.getMyReview(rid) as any;
            if (mine?.id) { setMyReview(mine); setReviewRating(mine.rating); setReviewComment(mine.comment); }
          } catch { /* silent */ }
        }
      } catch {
        setError(t('scriptNotFound'));
        toast.error(t('scriptNotFound'));
      } finally { setLoading(false); }
    };
    fetchScript();
  }, [scriptId, user]);

  const handleSubmitReview = async () => {
    if (!script) return;
    if (reviewComment.trim().length < 10) { toast.error('Comment must be at least 10 characters.'); return; }
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
    } finally { setSubmittingReview(false); }
  };

  const handleDeleteReview = async () => {
    if (!myReview) return;
    try {
      await apiClient.deleteReview(myReview.id);
      setReviews((prev) => prev.filter((r) => r.id !== myReview.id));
      setMyReview(null); setReviewComment(''); setReviewRating(5);
      setReviewsTotal((t) => t - 1);
      toast.success('Review deleted.');
    } catch { toast.error('Failed to delete review.'); }
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
    addItem({ id: script.id, name: script.name, price: currentPrice, imageUrl: script.imageUrl });
    setJustAdded(true);
    toast.success('Added to cart!');
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!user) { router.push(`/${locale}/auth/login?redirect=/${locale}/script/${scriptId}`); return; }
    if (script) addItem({ id: script.id, name: script.name, price: currentPrice, imageUrl: script.imageUrl });
    router.push(`/${locale}/checkout`);
  };

  const handleFreeTrial = async () => {
    if (!user) { router.push(`/${locale}/auth/login?redirect=/${locale}/script/${scriptId}`); return; }
    if (!script) return;
    try {
      await apiClient.createTrialLicense(script.id);
      toast.success('Trial license created! Check your dashboard.');
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to claim trial. Please try again.');
    }
  };

  /* ── Loading ──────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#1a1a1a] border-t-[#51a2ff] animate-spin" />
          <p className="text-[#888] text-sm">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !script) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="card-base w-full max-w-sm p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">{t('error')}</h2>
          <p className="text-[#888] text-sm mb-6">{error || t('scriptNotFound')}</p>
          <Link href={`/${locale}/scripts`}>
            <button className="btn-ghost btn-sm flex items-center gap-2 mx-auto">
              <ArrowLeft className="w-4 h-4" />
              {t('backToScripts')}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const features = formatFeatures(script.features);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="hero-glow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">

        {/* Back */}
        <div className="mb-7">
          <Link href={`/${locale}/scripts`}>
            <button className="flex items-center gap-2 text-[#888] hover:text-white transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              {t('backToScripts')}
            </button>
          </Link>
        </div>

        {/* Script hero */}
        <div className="mb-7">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="badge-blue">{script.category?.name || 'Script'}</span>
            {script.popular && (
              <span className="badge-active flex items-center gap-1">
                <Flame className="w-3 h-3" /> {t('popular')}
              </span>
            )}
            {script.new && (
              <span className="badge-active flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {t('new')}
              </span>
            )}
            {script.trialAvailable && (
              <span className="badge-blue flex items-center gap-1">
                <Gift className="w-3 h-3" /> {t('freeTrialAvailable')}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
            {script.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-[#888]">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-[#51a2ff] fill-[#51a2ff]" />
              ))}
              <span className="text-white font-semibold ml-1">4.9</span>
              <span className="text-[#555]">(Premium)</span>
            </div>
            <span className="text-[#333]">·</span>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {viewerCount} {t('viewingNow')}
            </div>
          </div>
        </div>

        {/* Trust stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {TRUST_STATS.map((stat, i) => (
            <div key={i} className="card-base p-4 flex items-center gap-3">
              {stat.icon}
              <div>
                <div className="text-white font-bold text-sm">{stat.value}</div>
                <div className="text-[#666] text-xs">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* LEFT: Script info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Media */}
            <div className="card-base overflow-hidden">
              <MediaSlider
                imageUrl={script.imageUrl}
                imageUrls={script.imageUrls}
                youtubeUrl={script.youtubeUrl}
                className="w-full"
              />
            </div>

            {/* Description */}
            <div className="card-base p-6">
              <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#51a2ff]" />
                {t('aboutScript')}
              </h2>
              <p className="text-[#999] leading-relaxed text-sm">{script.description}</p>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="card-base p-6">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#51a2ff]" />
                  {t('keyFeatures')}
                </h2>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[rgba(81,162,255,0.1)] border border-[rgba(81,162,255,0.2)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-3 h-3 text-[#51a2ff]" />
                      </div>
                      <span className="text-[#ccc] text-sm leading-snug" dir="auto">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {script.requirements && (
              <div className="card-base p-6">
                <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#51a2ff]" />
                  {t('systemRequirements')}
                </h2>
                <p className="text-[#999] text-sm leading-relaxed">{script.requirements}</p>
              </div>
            )}

            {/* Reviews */}
            <div className="card-base p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#51a2ff]" />
                  Customer Reviews
                </h2>
                {reviewsTotal > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(reviewsAvg) ? 'text-[#51a2ff] fill-[#51a2ff]' : 'text-[#333]'}`} />
                      ))}
                    </div>
                    <span className="text-white text-sm font-bold">{reviewsAvg.toFixed(1)}</span>
                    <span className="text-[#555] text-xs">({reviewsTotal})</span>
                  </div>
                )}
              </div>

              {/* Review form */}
              {user && (
                <div className="mb-5 p-4 bg-[#111] border border-white/[0.06] rounded-xl">
                  <p className="text-sm font-semibold text-white mb-3">
                    {myReview ? 'Edit your review' : 'Leave a review'}
                  </p>
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
                        <Star className={`w-6 h-6 transition-colors ${s <= (reviewHover || reviewRating) ? 'text-[#51a2ff] fill-[#51a2ff]' : 'text-[#333]'}`} />
                      </button>
                    ))}
                    <span className="text-[#888] text-xs ml-2">{reviewRating}/5</span>
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this script... (min 10 characters)"
                    rows={3}
                    className="input-base resize-none text-sm"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || reviewComment.trim().length < 10}
                      className="btn-primary btn-sm disabled:opacity-50"
                    >
                      {submittingReview ? 'Saving...' : myReview ? 'Update Review' : 'Submit Review'}
                    </button>
                    {myReview && (
                      <button
                        onClick={handleDeleteReview}
                        className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-full hover:bg-red-500/20 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}

              {reviews.length === 0 ? (
                <p className="text-center py-8 text-[#555] text-sm">
                  No reviews yet. Be the first to share your experience!
                </p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-[#111] rounded-xl border border-white/[0.05]">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {review.user?.discordAvatar ? (
                            <img src={review.user.discordAvatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[rgba(81,162,255,0.15)] border border-[rgba(81,162,255,0.2)] flex items-center justify-center text-xs font-bold text-[#51a2ff]">
                              {(review.user?.username || '?')[0].toUpperCase()}
                            </div>
                          )}
                          <span className="text-white text-sm font-medium">{review.user?.username || 'Anonymous'}</span>
                          <span className="text-xs text-[#555]">{t('verifiedBuyer')}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-[#51a2ff] fill-[#51a2ff]' : 'text-[#333]'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-[#ccc] text-sm leading-relaxed">"{review.comment}"</p>
                      <p className="text-xs text-[#555] mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}

              {!user && (
                <div className="mt-4 p-3 bg-[#111] border border-white/[0.06] rounded-xl text-center">
                  <p className="text-[#555] text-sm">
                    <Link href={`/${locale}/auth/login`} className="text-[#51a2ff] hover:underline">Log in</Link>
                    {' '}and purchase this script to leave a review.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Purchase card */}
          <div className="lg:sticky lg:top-28 space-y-4">

            {/* Price card */}
            <div className="card-featured p-6">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-black text-[#51a2ff]">${currentPrice}</span>
                <span className="text-[#666] text-sm">
                  {script.licenseType === 'forever' ? t('perForever') : `/ ${script.defaultLicenseDurationDays || 30} ${t('days')}`}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-400 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {viewerCount} {t('viewingCard')}
              </div>

              {/* License info */}
              <div className="space-y-0 mb-5">
                <div className="flex items-center justify-between py-2.5 border-b border-white/[0.06]">
                  <span className="text-[#888] text-sm">{t('licenseType')}</span>
                  <span className="badge-blue text-xs">
                    {script.licenseType === 'forever' ? `♾ ${t('lifetime')}` : `⏱ ${t('timeBased')}`}
                  </span>
                </div>
                {script.licenseType === 'date' && script.defaultLicenseDurationDays && (
                  <div className="flex items-center justify-between py-2.5 border-b border-white/[0.06]">
                    <span className="text-[#888] text-sm">{t('duration')}</span>
                    <span className="text-white text-sm font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#51a2ff]" />
                      {script.defaultLicenseDurationDays} {t('days')}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[#888] text-sm">{t('support')}</span>
                  <span className="text-[#51a2ff] text-sm font-semibold">✓ {t('included')}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-2.5">
                <button onClick={handleBuyNow} className="btn-primary w-full justify-center">
                  <CreditCard className="w-4 h-4" />
                  {t('buyNow')} — ${currentPrice}
                </button>
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-3 px-4 rounded-full font-bold text-sm transition-colors flex items-center justify-center gap-2 border ${
                    justAdded
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-transparent border-white/[0.1] text-[#888] hover:text-white hover:border-white/20'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {justAdded ? 'Added!' : t('addToCart')}
                </button>
                {script.trialAvailable && (
                  <button
                    onClick={handleFreeTrial}
                    className="btn-ghost w-full justify-center"
                  >
                    <Gift className="w-4 h-4" />
                    {t('startFreeTrial')}
                  </button>
                )}
              </div>

              {/* Security badges */}
              <div className="flex flex-wrap justify-center gap-4 mt-5 pt-5 border-t border-white/[0.06]">
                {[
                  { icon: <Lock className="w-3.5 h-3.5 text-[#51a2ff]" />, label: t('sslSecure') },
                  { icon: <Shield className="w-3.5 h-3.5 text-[#51a2ff]" />, label: t('pciCompliant') },
                  { icon: <Award className="w-3.5 h-3.5 text-[#51a2ff]" />, label: t('instantAccess') },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-[#555]">
                    {b.icon}
                    {b.label}
                  </div>
                ))}
              </div>
            </div>

            {/* What's included */}
            <div className="card-base p-5">
              <h3 className="text-white text-sm font-semibold mb-3">{t('whatsIncluded')}</h3>
              <ul className="space-y-2">
                {[
                  t('included1'), t('included2'), t('included3'),
                  t('included4'), t('included5'), t('included6'),
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-[#888]">
                    <CheckCircle className="w-3.5 h-3.5 text-[#51a2ff] flex-shrink-0" />
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
