'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { ArrowLeft, Code2, Clock, DollarSign, Mail, MessageCircle, Send, CheckCircle } from 'lucide-react'
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
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
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

  const selectClass = "w-full h-11 px-3 rounded-xl text-white text-sm focus:outline-none transition-colors appearance-none cursor-pointer"
  const selectStyle = { background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)', outline: 'none' }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="card-base w-full max-w-lg p-10 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#1a1a1a] flex items-center justify-center" style={{ border: '1px solid rgba(81,162,255,0.2)' }}>
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-3">Request Submitted!</h1>
            <p className="text-[#888] leading-relaxed">
              Thank you for your custom script request. Our team will review it and get back to you within 24-48 hours.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard" className="btn-ghost">
              Back to Dashboard
            </Link>
            <button onClick={() => setSubmitted(false)} className="btn-primary">
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="page-container">
        <div className="page-section">
          <div className="mb-8">
            <Link href="/scripts" className="inline-flex items-center gap-2 mb-5 text-sm text-[#888] hover:text-[#51a2ff] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Scripts
            </Link>
            <h1 className="text-3xl font-bold text-white mb-1">Request Custom Script</h1>
            <p className="text-[#888] text-sm">Need something specific? Tell us about your project and we&apos;ll make it happen.</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="card-base p-8 space-y-6">
              <div className="space-y-1.5">
                <label htmlFor="title" className="text-sm font-medium text-[#ccc] flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#51a2ff]" />
                  Script Title *
                </label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Advanced Vehicle Shop System"
                  className="input-base w-full"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="description" className="text-sm font-medium text-[#ccc]">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your script requirements in detail. Include features, functionality, and any specific requirements..."
                  className="input-base w-full min-h-[150px] resize-y"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="budget" className="text-sm font-medium text-[#ccc] flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#51a2ff]" />
                    Budget Range
                  </label>
                  <select id="budget" name="budget" value={formData.budget} onChange={handleChange}
                    className={selectClass} style={selectStyle}>
                    <option value="" style={{ background: '#1a1a1a' }}>Select budget range</option>
                    <option value="$50-$100" style={{ background: '#1a1a1a' }}>$50 - $100</option>
                    <option value="$100-$250" style={{ background: '#1a1a1a' }}>$100 - $250</option>
                    <option value="$250-$500" style={{ background: '#1a1a1a' }}>$250 - $500</option>
                    <option value="$500-$1000" style={{ background: '#1a1a1a' }}>$500 - $1,000</option>
                    <option value="$1000+" style={{ background: '#1a1a1a' }}>$1,000+</option>
                    <option value="Flexible" style={{ background: '#1a1a1a' }}>Flexible / Discuss</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="timeline" className="text-sm font-medium text-[#ccc] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#51a2ff]" />
                    Timeline
                  </label>
                  <select id="timeline" name="timeline" value={formData.timeline} onChange={handleChange}
                    className={selectClass} style={selectStyle}>
                    <option value="" style={{ background: '#1a1a1a' }}>Select timeline</option>
                    <option value="ASAP" style={{ background: '#1a1a1a' }}>ASAP</option>
                    <option value="1-2 weeks" style={{ background: '#1a1a1a' }}>1-2 weeks</option>
                    <option value="2-4 weeks" style={{ background: '#1a1a1a' }}>2-4 weeks</option>
                    <option value="1-2 months" style={{ background: '#1a1a1a' }}>1-2 months</option>
                    <option value="Flexible" style={{ background: '#1a1a1a' }}>Flexible</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contactEmail" className="text-sm font-medium text-[#ccc] flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#51a2ff]" />
                    Contact Email *
                  </label>
                  <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="input-base w-full"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contactDiscord" className="text-sm font-medium text-[#ccc] flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#51a2ff]" />
                    Discord Username
                  </label>
                  <input
                    id="contactDiscord"
                    name="contactDiscord"
                    value={formData.contactDiscord}
                    onChange={handleChange}
                    placeholder="username#1234"
                    className="input-base w-full"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Request
                  </>
                )}
              </button>

              <p className="text-xs text-center text-[#444]">
                By submitting this request, you agree to be contacted regarding your custom script project.
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
