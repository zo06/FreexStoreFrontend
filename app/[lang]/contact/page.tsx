'use client'

import { useState } from 'react'
import { CheckCircle, Mail, Clock, MessageCircle, Send, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiClient } from '@/lib/api'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
  </svg>
)

export default function ContactPage() {
  const t = useTranslations('contact');
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error(t('fillAllFields')); return
    }
    if (formData.message.length < 10) {
      toast.error(t('messageTooShort')); return
    }
    try {
      setIsSubmitting(true)
      const response = await apiClient.submitContactForm(formData)
      if (response.success) {
        setIsSubmitted(true)
        toast.success('Message sent successfully!')
        setFormData({ name: '', email: '', subject: '', message: '' })
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send message. Please try again.')
    } finally { setIsSubmitting(false) }
  }

  /* ── Success state ─────────────────────────────────────────── */
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 pt-20">
        <div className="card-base p-12 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-[rgba(81,162,255,0.1)] border border-[rgba(81,162,255,0.2)] flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-[#51a2ff]" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Message Sent!</h2>
          <p className="text-[#888] mb-8 leading-relaxed">
            Thank you for reaching out. We'll get back to you as soon as possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => setIsSubmitted(false)} className="btn-primary">
              Send Another Message
            </button>
            <Link href="/">
              <button className="btn-ghost">Back to Home</button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="hero-glow" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-28">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="badge-blue inline-flex mb-4">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Contact Us</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Get in <span className="text-[#51a2ff]">Touch</span>
          </h1>
          <p className="text-[#888] max-w-xl mx-auto leading-relaxed">
            Have a question, suggestion, or need help? Fill out the form below and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Info cards */}
          <div className="space-y-4 lg:col-span-1">
            {[
              { icon: <Mail className="w-5 h-5 text-[#51a2ff]" />, title: 'Email Us', body: 'freexstores@gmail.com', link: null },
              { icon: <DiscordIcon />, title: 'Discord', body: 'Join our community server', link: { href: 'https://discord.gg/aTEmKr4K7k', label: 'discord.gg/aTEmKr4K7k' } },
              { icon: <Clock className="w-5 h-5 text-[#51a2ff]" />, title: 'Response Time', body: 'Usually within 24 hours', link: null },
            ].map((item) => (
              <div key={item.title} className="card-base p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[rgba(81,162,255,0.1)] border border-[rgba(81,162,255,0.2)] flex items-center justify-center flex-shrink-0 text-[#51a2ff]">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-0.5">{item.title}</h3>
                  <p className="text-[#888] text-sm">{item.body}</p>
                  {item.link && (
                    <a href={item.link.href} target="_blank" rel="noopener noreferrer" className="text-[#51a2ff] text-sm hover:underline">
                      {item.link.label}
                    </a>
                  )}
                </div>
              </div>
            ))}

            {/* FAQ link */}
            <div className="card-featured p-5">
              <h3 className="text-white font-semibold text-sm mb-1.5">Need Quick Answers?</h3>
              <p className="text-[#888] text-sm mb-4 leading-relaxed">
                Check our FAQ section for answers to common questions.
              </p>
              <Link href="/faq">
                <button className="btn-ghost btn-sm w-full justify-center">View FAQ</button>
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="card-base p-6 sm:p-8 lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Send className="w-5 h-5 text-[#51a2ff]" />
              Send us a Message
            </h2>
            <p className="text-[#888] text-sm mb-6">Fill out the form and we'll respond as soon as possible.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#ccc] mb-1.5">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                      className="input-base pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#ccc] mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      required
                      className="input-base pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#ccc] mb-1.5">Subject</label>
                <input
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="What is this about?"
                  required
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#ccc] mb-1.5">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us more about your inquiry..."
                  required
                  rows={6}
                  className="input-base resize-none"
                />
                <p className="text-[#444] text-xs mt-1.5">Minimum 10 characters required</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center disabled:opacity-60"
                style={{ borderRadius: '12px' }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
