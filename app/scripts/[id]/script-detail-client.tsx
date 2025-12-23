'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'
import PayPalBuyButton from '@/components/PayPalBuyButton'
import { MediaSlider } from '@/components/ui/media-slider'
import { ArrowLeft, Shield, Clock, CheckCircle, ShoppingCart, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Script {
  id: string
  slug?: string
  name: string
  description: string
  price: string
  category: string | { name: string }
  licenseType: 'forever' | 'date'
  foreverPrice?: number
  datePrice?: number
  defaultLicenseDurationDays?: number
  imageUrl?: string
  imageUrls?: string | string[]
  youtubeUrl?: string
  features?: string | string[]
  requirements?: string
  isActive: boolean
  trialAvailable?: boolean
}

interface Props {
  script: Script
}

export default function ScriptDetailClient({ script }: Props) {
  const { user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [hasTrialOrLicense, setHasTrialOrLicense] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUserLicense = async () => {
      if (!isAuthenticated || !user) return
      try {
        const response: any = await apiClient.get(`/licenses/user/@me`)
        const licenses = response.data?.data || response.data || []
        const hasLicense = licenses.some((license: any) => 
          license.scriptId === script.id || license.script?.id === script.id
        )
        setHasTrialOrLicense(hasLicense)
      } catch (error) {
        console.error('Failed to check license:', error)
      }
    }
    checkUserLicense()
  }, [isAuthenticated, user, script.id])

  const categoryName = typeof script.category === 'string' 
    ? script.category 
    : script.category?.name || 'General'

  const features = typeof script.features === 'string'
    ? script.features.split(',').map(f => f.trim()).filter(Boolean)
    : Array.isArray(script.features) ? script.features : []

  const handleStartTrial = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to start a trial')
      return
    }
    setIsLoading(true)
    try {
      await apiClient.post(`/licenses/trial/${script.id}`, {})
      toast.success('Trial started successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start trial')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen relative overflow-x-hidden py-8">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-emerald-900/20"></div>
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 max-w-7xl">
        <Link href="/scripts" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Scripts
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <MediaSlider 
              imageUrl={script.imageUrl} 
              imageUrls={script.imageUrls} 
              youtubeUrl={script.youtubeUrl} 
              className="rounded-2xl overflow-hidden" 
            />
            {script.youtubeUrl && (
              <a href={script.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-purple-400 hover:text-purple-300">
                <Play className="w-5 h-5" />
                Watch Demo Video
              </a>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <Badge className="mb-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/30 text-purple-300">{categoryName}</Badge>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{script.name}</h1>
              <p className="text-gray-300 text-lg leading-relaxed">{script.description}</p>
            </div>

            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-gray-400 text-sm">Price</p>
                    <p className="text-3xl font-bold text-white">
                      ${script.foreverPrice || script.price || 0}
                      {script.licenseType === 'forever' && <span className="text-sm text-gray-400 ml-2">lifetime</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400 text-sm">Secure License</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {isAuthenticated && user ? (
                    <PayPalBuyButton 
                      scriptId={script.id} 
                      scriptName={script.name} 
                      amount={Number(script.foreverPrice || script.price || 0)} 
                      userId={user.id}
                    />
                  ) : (
                    <Link href="/auth/login">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Login to Purchase
                      </Button>
                    </Link>
                  )}
                  {script.trialAvailable && !hasTrialOrLicense && (
                    <Button variant="outline" className="w-full border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10" onClick={handleStartTrial} disabled={isLoading}>
                      <Clock className="w-4 h-4 mr-2" />
                      Start Free Trial
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {features.length > 0 && (
              <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Features</h3>
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {script.requirements && (
              <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Requirements</h3>
                  <p className="text-gray-300">{script.requirements}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
