'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Shield, Download, Clock, CheckCircle, CreditCard, Sparkles, Lock, Zap, Star } from 'lucide-react';
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

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
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
        const response = await apiClient.get<{ data: Script }>(`/scripts/${scriptId}`);
        console.log(response);
        const scriptData = (response as any).data || response;
        setScript(scriptData as Script);
        
        if (scriptData?.licenseType) {
          setSelectedLicenseType(scriptData.licenseType);
        }
      } catch (err: any) {
        console.error('Failed to fetch script:', err);
        setError('Failed to load script details');
        toast.error('Script not found');
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
        return features.split('\n').filter(f => f.trim());
      }
    }
    return [];
  };

  const handleStripeSuccess = async (paymentIntent: any) => {
    console.log('Stripe Payment successful:', paymentIntent);
    toast.success('Payment successful! Activating license...');
    
    try {
      const result = await apiClient.confirmStripePayment(paymentIntent.id) as any;
      
      if (result.success) {
        toast.success('License activated! Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        console.error('License activation failed:', result);
        toast.error('Payment succeeded but license activation failed. Contact support.');
      }
    } catch (error) {
      console.error('Error activating license:', error);
      toast.error('Error activating license. Please contact support.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
            <div className="absolute inset-0 h-12 w-12 animate-ping text-purple-500 opacity-20">
              <Loader2 className="h-12 w-12" />
            </div>
          </div>
          <span className="text-white text-lg font-medium">Loading payment details...</span>
        </div>
      </div>
    );
  }

  if (error || !script) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-red-500/30 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-red-400 text-2xl">Error</CardTitle>
            <CardDescription className="text-gray-300 mt-2">
              {error || 'Script not found'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/scripts">
              <Button variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Scripts
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-yellow-500/30 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-yellow-400 text-2xl">Authentication Required</CardTitle>
            <CardDescription className="text-gray-300 mt-2">
              Please log in to purchase this script
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Link href="/auth/login">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg">
                Log In
              </Button>
            </Link>
            <Link href="/scripts">
              <Button variant="outline" className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/20">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Scripts
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const features = formatFeatures(script.features);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/scripts">
            <Button variant="ghost" className="text-purple-300 hover:text-white hover:bg-purple-800/30 mb-4 transition-all">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Scripts
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Complete Your Purchase</h1>
          </div>
          <p className="text-gray-400 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-400" />
            Secure payment processing with 256-bit encryption
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Script Details */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 border-purple-500/20 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
              <CardHeader className="relative">
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <CardTitle className="text-white text-2xl mb-3 font-bold">{script.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
                        {(script.category as { name?: string })?.name || 'General'}
                      </Badge>
                      <Badge variant="outline" className="border-green-500/30 text-green-400">
                        <Star className="w-3 h-3 mr-1" />
                        Premium
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
                <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-500/20 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-4 flex items-center text-lg">
                    <div className="p-1.5 bg-green-500/20 rounded-lg mr-2">
                      <Zap className="h-5 w-5 text-green-400" />
                    </div>
                    Key Features
                  </h3>
                  <ul className="space-y-3">
                    {features.map((feature, index) => (
                      <li key={index} className="text-gray-300 flex items-start group">
                        <CheckCircle className="mr-3 h-5 w-5 text-green-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="flex-1">{feature}</span>
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
                    System Requirements
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
                License Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                <span className="text-gray-300 font-medium">License Type:</span>
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                  {script.licenseType === 'forever' ? '♾️ Lifetime' : '⏱️ Time-based'}
                </Badge>
              </div>
              
              {script.licenseType === 'date' && script.defaultLicenseDurationDays && (
                <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                  <span className="text-gray-300 font-medium">Duration:</span>
                  <span className="text-white flex items-center font-semibold">
                    <Clock className="mr-2 h-4 w-4 text-yellow-400" />
                    {script.defaultLicenseDurationDays} days
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                <span className="text-gray-300 font-medium">Support:</span>
                <span className="text-purple-400 font-semibold">✓ Included</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Section */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 border-purple-500/20 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-white text-2xl font-bold">Payment Method</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Complete your purchase securely
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative">
              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-2 border-green-500/30 p-6 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-400 text-sm block mb-1">Total Amount</span>
                    <span className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">${currentPrice}</span>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <Sparkles className="w-8 h-8 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 p-6 rounded-xl">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg mr-3">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-lg">Pay with Card</h3>
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
                  <span>Your payment information is secure and encrypted</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <span>All major credit cards accepted</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  <span>Receipt will be sent to your email address</span>
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
                    <h3 className="text-white font-bold mb-2 text-lg">🔐 Secure Transaction</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Your payment is protected by industry-leading 256-bit encryption. 
                      We never store your payment card details on our servers.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">SSL Encrypted</Badge>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">PCI Compliant</Badge>
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