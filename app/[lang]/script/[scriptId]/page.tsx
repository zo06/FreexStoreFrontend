'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Shield, Download, Clock, CheckCircle, CreditCard, Star, Lock, Zap } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { MediaSlider } from '@/components/ui/media-slider';
import { StripeCheckout } from '@/components/payment/StripeCheckout';

interface Script {
  id: string;
  name: string;
  description: string;
  price: number;
  category: {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
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
  createdAt: string;
  updatedAt: string;
}

function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export default function ScriptPurchasePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations('scriptDetail');
  const [script, setScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLicenseType, setSelectedLicenseType] = useState<'forever' | 'date'>('forever');

  const scriptId = params.scriptId as string;

  useEffect(() => {
    if (!scriptId) return;

    const fetchScript = async () => {
      try {
        setLoading(true);
        // Try by slug first if not a UUID, otherwise by ID
        const endpoint = isUUID(scriptId) 
          ? `/scripts/${scriptId}`
          : `/scripts/by-slug/${scriptId}`;
        
        const response = await apiClient.get<{ data: Script }>(endpoint);
        console.log(response);
        const scriptData = (response as any).data || response;
        setScript(scriptData as Script);
        
        if (scriptData?.licenseType) {
          setSelectedLicenseType(scriptData.licenseType);
        }
      } catch (err: any) {
        console.error('Failed to fetch script:', err);
        setError(t('scriptNotFound'));
        toast.error(t('scriptNotFound'));
      } finally {
        setLoading(false);
      }
    };

    fetchScript();
  }, [scriptId]);

  // Define getCurrentPrice based on current script state
  const getCurrentPrice = () => {
    if (!script) return 0;
    
    if (script.licenseType === 'forever') {
      return script.foreverPrice || script.price;
    } else if (script.licenseType === 'date') {
      return script.datePrice || script.price;
    }
    
    // Fallback to selected license type
    if (selectedLicenseType === 'forever') {
      return script.foreverPrice || script.price;
    } else {
      return script.datePrice || script.price;
    }
  };

  const currentPrice = getCurrentPrice();

  const formatFeatures = (features: string | string[] | undefined): string[] => {
    if (!features) return [];
    if (Array.isArray(features)) return features;
    if (typeof features === 'string') {
      try {
        const parsed = JSON.parse(features);
        return Array.isArray(parsed) ? parsed : [features];
      } catch {
        // Split by comma for comma-separated features (supports Arabic text)
        if (features.includes(',')) {
          return features.split(',').map(f => f.trim()).filter(f => f);
        }
        // Fallback to newline split
        return features.split('\n').filter(f => f.trim());
      }
    }
    return [];
  };

  const handleStripeSuccess = async (paymentIntent: any) => {
    console.log('Stripe Payment successful:', paymentIntent);
    toast.success(t('paymentSuccessful'));
    
    try {
      const result = await apiClient.confirmStripePayment(paymentIntent.id) as any;
      
      if (result.success) {
        toast.success(t('licenseActivated'));
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        console.error('License activation failed:', result);
        toast.error(t('paymentFailed'));
      }
    } catch (error) {
      console.error('Error activating license:', error);
      toast.error(t('activationError'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />
            <div className="absolute inset-0 h-12 w-12 animate-ping text-cyan-500 opacity-20">
              <Loader2 className="h-12 w-12" />
            </div>
          </div>
          <span className="text-white text-lg font-medium">{t('loading')}</span>
        </div>
      </div>
    );
  }

  if (error || !script) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-red-500/30 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-red-400 text-2xl">{t('error')}</CardTitle>
            <CardDescription className="text-gray-300 mt-2">
              {error || t('scriptNotFound')}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/scripts">
              <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('backToScripts')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-cyan-500/30 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-cyan-400 text-2xl">{t('authRequired')}</CardTitle>
            <CardDescription className="text-gray-300 mt-2">
              {t('pleaseLogin')}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Link href="/auth/login">
              <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg">
                {t('logIn')}
              </Button>
            </Link>
            <Link href="/scripts">
              <Button variant="outline" className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('backToScripts')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const features = formatFeatures(script.features);
  
  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#030712]">
      {/* Enhanced Background Elements - Match Landing Page */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(53,189,242,0.15),transparent)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_60%_60%_at_100%_100%,rgba(16,185,129,0.1),transparent)]"></div>
      </div>
      
      {/* Floating Orbs */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-[80px] animate-pulse pointer-events-none"></div>
      <div className="fixed top-40 right-20 w-24 h-24 bg-blue-500/15 rounded-full blur-[60px] animate-pulse pointer-events-none" style={{animationDelay: '2s'}}></div>
      <div className="fixed bottom-20 left-1/4 w-40 h-40 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{animationDelay: '4s'}}></div>
      
      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none opacity-30"></div>
      
      <div className="container relative z-10 mx-auto px-4 py-8">
        {/* Header - Modern Style */}
        <div className="mb-12 mt-4">
          <Link href="/scripts">
            <Button variant="ghost" className="text-cyan-300 hover:text-white hover:bg-white/5 mb-6 transition-all backdrop-blur-sm border border-white/10 rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToScripts')}
            </Button>
          </Link>
          

          
          <div className="flex items-center gap-4 mb-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-75"></div>
              <div className="relative p-3 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl">
                <Star className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-4xl leading-[1.4] font-black bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">{t('completeYourPurchase')}</h1>
          </div>

        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Script Details */}
          <div className="space-y-6">
            <Card className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
              <CardHeader className="relative">
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <CardTitle className="text-white text-2xl mb-3 font-bold">{script.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-0">
                        {(script.category as { name?: string })?.name || 'General'}
                      </Badge>
                      <Badge variant="outline" className="border-green-500/30 text-green-400">
                        <Star className="w-3 h-3 mr-1" />
                        {t('premium')}
                      </Badge>
                    </div>
                  </div>
                </div>
            </CardHeader>
            
            {/* Media Slider for Images and Video */}
            <div className="px-6 pb-4">
              <MediaSlider 
                imageUrl={script.imageUrl}
                imageUrls={script.imageUrls}
                youtubeUrl={script.youtubeUrl}
                className="w-full"
              />
            </div>
            <CardContent className="space-y-6 relative">
              <p className="text-gray-300 leading-relaxed">{script.description}</p>
              
              {features.length > 0 && (
                <div className="relative group/features bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-500/20 rounded-xl p-5 hover:border-green-500/40 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover/features:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  <h3 className="relative text-white font-bold mb-5 flex items-center text-lg">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-green-500/30 rounded-lg blur"></div>
                      <div className="relative p-2 bg-green-500/20 rounded-lg">
                        <Zap className="h-5 w-5 text-green-400" />
                      </div>
                    </div>
                    <span className="ml-3 mr-2 bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">{t('keyFeatures')}</span>
                  </h3>
                  <ul className="space-y-3 relative">
                    {features.map((feature, index) => (
                      <li key={index} className="text-gray-300 flex items-start group/item hover:text-white transition-colors gap-2">
                        <CheckCircle className="mr-3 h-5 w-5 text-green-400 mt-0.5 flex-shrink-0 group-hover/item:scale-110 group-hover/item:text-green-300 transition-all" />
                        <span className="flex-1 leading-relaxed" dir="auto">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {script.requirements && (
                <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/10 border border-yellow-500/20 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center text-lg">
                    <div className="p-1.5 bg-yellow-500/20 rounded-lg mr-2">
                      <Shield className="h-5 w-5 text-yellow-400" />
                    </div>
                    {t('systemRequirements')}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{script.requirements}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* License Information */}
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 border-blue-500/20 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-xl">
                <div className="p-2 bg-blue-500/20 rounded-lg mr-2">
                  <Download className="h-5 w-5 text-blue-400" />
                </div>
                {t('licenseInformation')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                <span className="text-gray-300 font-medium">{t('licenseType')}:</span>
                <Badge className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-0">
                  {script.licenseType === 'forever' ? `♾️ ${t('lifetime')}` : `⏱️ ${t('timeBased')}`}
                </Badge>
              </div>
              
              {script.licenseType === 'date' && script.defaultLicenseDurationDays && (
                <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                  <span className="text-gray-300 font-medium">{t('duration')}:</span>
                  <span className="text-white flex items-center font-semibold">
                    <Clock className="mr-2 h-4 w-4 text-yellow-400" />
                    {script.defaultLicenseDurationDays} {t('days')}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between p-3 bg-cyan-500/10 rounded-lg">
                <span className="text-gray-300 font-medium">{t('support')}:</span>
                <span className="text-cyan-400 font-semibold">✓ {t('included')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Section */}
        <div className="space-y-6 mt-8">
          <Card className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-white text-2xl font-bold">{t('paymentMethod')}</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                {t('completePurchase')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative">
              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-2 border-green-500/30 p-6 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-400 text-sm block mb-1">{t('totalAmount')}</span>
                    <span className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">${currentPrice}</span>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <Star className="w-8 h-8 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 p-6 rounded-xl">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg mr-3">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-lg">{t('payWithCard')}</h3>
                </div>
                <StripeCheckout 
                  amount={currentPrice} 
                  currency="usd" 
                  metadata={{ scriptId: script.id, licenseType: selectedLicenseType }}
                  onSuccess={(paymentIntent) => handleStripeSuccess(paymentIntent)}
                  onError={(err) => console.error(err)}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2 mt-6 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <Lock className="w-4 h-4 text-green-400" />
                  <span>{t('paymentSecure')}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <span>{t('allCardsAccepted')}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>{t('receiptEmail')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

            {/* Security Notice */}
            <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500/30 backdrop-blur-xl shadow-xl">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <Shield className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold mb-2 text-lg">🔐 {t('secureTransaction')}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {t('encryptionNotice')}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{t('sslEncrypted')}</Badge>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{t('pciCompliant')}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
