'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Code, Clock, CurrencyDollar, Envelope, DiscordLogo, PaperPlaneTilt, CheckCircle } from 'phosphor-react'
import { apiClient } from '@/lib/api'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

export default function CustomRequestPage() {
  const t = useTranslations('customRequest');
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    timeline: '',
    contactEmail: user?.email || '',
    contactDiscord: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      toast.error('Please login to submit a custom script request')
      window.location.href = '/auth/login'
      return
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.contactEmail.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      await apiClient.createCustomRequest({
        title: formData.title,
        description: formData.description,
        budget: formData.budget || undefined,
        timeline: formData.timeline || undefined,
        contactEmail: formData.contactEmail,
        contactDiscord: formData.contactDiscord || undefined,
      })
      
      setSubmitted(true)
      toast.success('Custom script request submitted successfully!')
    } catch (error: any) {
      console.error('Failed to submit request:', error)
      toast.error(error?.message || 'Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <main className="overflow-hidden relative pt-16 min-h-screen lg:pt-24 bg-[#030712]">
        {/* Enhanced Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(53,189,242,0.15),transparent)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_60%_60%_at_100%_100%,rgba(16,185,129,0.1),transparent)]"></div>
        </div>
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="container relative z-10 px-4 py-4 mx-auto lg:px-6 lg:py-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center">
              <CheckCircle size={48} className="text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Request Submitted!</h1>
            <p className="text-lg text-muted mb-8">
              Thank you for your custom script request. Our team will review it and get back to you within 24-48 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button variant="outline" className="px-6 py-3 cursor-pointer">
                  Back to Dashboard
                </Button>
              </Link>
              <Button onClick={() => setSubmitted(false)} className="px-6 py-3 cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600">
                Submit Another Request
              </Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="overflow-hidden relative pt-16 min-h-screen lg:pt-24 bg-[#030712]">
      {/* Enhanced Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(53,189,242,0.15),transparent)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_60%_60%_at_100%_100%,rgba(16,185,129,0.1),transparent)]"></div>
      </div>
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute top-40 right-20 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
      
      <div className="container relative z-10 px-4 py-4 mx-auto lg:px-6 lg:py-8">
        <div className="mb-8 animate-fade-in">
          <Link href="/scripts" className="inline-flex items-center gap-2 mb-4 text-sm text-muted hover:text-white transition-colors">
            <ArrowLeft size={16} />
            Back to Scripts
          </Link>
          <h1 className="mb-2 text-2xl font-bold lg:text-4xl text-gradient">Request Custom Script</h1>
          <p className="text-sm text-muted lg:text-base">Need something specific? Tell us about your project and we'll make it happen.</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="p-6 lg:p-8 card-modern animate-slide-up space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2 text-white">
                <Code size={18} className="text-cyan-400" />
                Script Title *
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Advanced Vehicle Shop System"
                className="bg-white/5 border-white/20 focus:border-cyan-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your script requirements in detail. Include features, functionality, and any specific requirements..."
                className="bg-white/5 border-white/20 focus:border-cyan-500 min-h-[150px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget" className="flex items-center gap-2 text-white">
                  <CurrencyDollar size={18} className="text-green-400" />
                  Budget Range
                </Label>
                <select
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/20 focus:border-cyan-500 text-white"
                >
                  <option value="" className="bg-gray-900">Select budget range</option>
                  <option value="$50-$100" className="bg-gray-900">$50 - $100</option>
                  <option value="$100-$250" className="bg-gray-900">$100 - $250</option>
                  <option value="$250-$500" className="bg-gray-900">$250 - $500</option>
                  <option value="$500-$1000" className="bg-gray-900">$500 - $1,000</option>
                  <option value="$1000+" className="bg-gray-900">$1,000+</option>
                  <option value="Flexible" className="bg-gray-900">Flexible / Discuss</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline" className="flex items-center gap-2 text-white">
                  <Clock size={18} className="text-blue-400" />
                  Timeline
                </Label>
                <select
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/20 focus:border-cyan-500 text-white"
                >
                  <option value="" className="bg-gray-900">Select timeline</option>
                  <option value="ASAP" className="bg-gray-900">ASAP</option>
                  <option value="1-2 weeks" className="bg-gray-900">1-2 weeks</option>
                  <option value="2-4 weeks" className="bg-gray-900">2-4 weeks</option>
                  <option value="1-2 months" className="bg-gray-900">1-2 months</option>
                  <option value="Flexible" className="bg-gray-900">Flexible</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="flex items-center gap-2 text-white">
                  <Envelope size={18} className="text-cyan-400" />
                  Contact Email *
                </Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="bg-white/5 border-white/20 focus:border-cyan-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactDiscord" className="flex items-center gap-2 text-white">
                  <DiscordLogo size={18} className="text-indigo-400" />
                  Discord Username
                </Label>
                <Input
                  id="contactDiscord"
                  name="contactDiscord"
                  value={formData.contactDiscord}
                  onChange={handleChange}
                  placeholder="username#1234"
                  className="bg-white/5 border-white/20 focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-4 font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <PaperPlaneTilt size={20} />
                    Submit Request
                  </div>
                )}
              </Button>
            </div>

            <p className="text-xs text-center text-muted">
              By submitting this request, you agree to be contacted regarding your custom script project.
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}

