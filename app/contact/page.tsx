'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  EnvelopeSimple, 
  User, 
  ChatCircle, 
  PaperPlaneTilt,
  CheckCircle,
  DiscordLogo,
  MapPin,
  Clock
} from 'phosphor-react'
import toast from 'react-hot-toast'
import { apiClient } from '@/lib/api'
import Link from 'next/link'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields')
      return
    }

    if (formData.message.length < 10) {
      toast.error('Message must be at least 10 characters')
      return
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
      console.error('Failed to submit contact form:', error)
      toast.error(error?.message || 'Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#030712] relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(53,189,242,0.15),transparent)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_60%_60%_at_100%_100%,rgba(16,185,129,0.1),transparent)]"></div>
        </div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="container relative z-10 px-4 py-16 mx-auto max-w-4xl">
          <Card className="text-center border-0 shadow-2xl bg-white/5 backdrop-blur-sm">
            <CardContent className="py-16">
              <div className="flex justify-center items-center mx-auto mb-6 w-20 h-20 bg-green-500/20 rounded-full">
                <CheckCircle size={48} className="text-green-400" weight="fill" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-white">Message Sent!</h2>
              <p className="mb-8 text-lg text-gray-400">
                Thank you for reaching out. We&apos;ll get back to you as soon as possible.
              </p>
              <div className="flex flex-col gap-4 justify-center sm:flex-row">
                <Button 
                  onClick={() => setIsSubmitted(false)}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                >
                  Send Another Message
                </Button>
                <Link href="/">
                  <Button variant="outline">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(53,189,242,0.15),transparent)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_60%_60%_at_100%_100%,rgba(16,185,129,0.1),transparent)]"></div>
      </div>
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="container relative z-10 px-4 py-16 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 md:text-5xl">
            Get in Touch
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Have a question, suggestion, or need help? We&apos;d love to hear from you. 
            Fill out the form below and we&apos;ll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact Info Cards */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="border-0 shadow-xl transition-all duration-300 bg-white/5 backdrop-blur-sm hover:bg-white/10">
              <CardContent className="flex gap-4 items-start p-6">
                <div className="flex justify-center items-center w-12 h-12 bg-cyan-500/20 rounded-lg">
                  <EnvelopeSimple size={24} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-white">Email Us</h3>
                  <p className="text-sm text-gray-400">freexstores@gmail.com</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl transition-all duration-300 bg-white/5 backdrop-blur-sm hover:bg-white/10">
              <CardContent className="flex gap-4 items-start p-6">
                <div className="flex justify-center items-center w-12 h-12 bg-blue-500/20 rounded-lg">
                  <DiscordLogo size={24} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-white">Discord</h3>
                  <p className="text-sm text-gray-400">Join our community server</p>
                  <a 
                    href="https://discord.gg/aTEmKr4K7k" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    discord.gg/freex
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl transition-all duration-300 bg-white/5 backdrop-blur-sm hover:bg-white/10">
              <CardContent className="flex gap-4 items-start p-6">
                <div className="flex justify-center items-center w-12 h-12 bg-green-500/20 rounded-lg">
                  <Clock size={24} className="text-green-400" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-white">Response Time</h3>
                  <p className="text-sm text-gray-400">Usually within 24 hours</p>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Link */}
            <Card className="border-0 shadow-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="mb-2 font-semibold text-white">Need Quick Answers?</h3>
                <p className="mb-4 text-sm text-gray-400">
                  Check out our FAQ section for answers to common questions.
                </p>
                <Link href="/faq">
                  <Button variant="outline" size="sm" className="w-full">
                    View FAQ
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="border-0 shadow-2xl lg:col-span-2 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center text-2xl text-white">
                <ChatCircle size={28} className="text-cyan-400" />
                Send us a Message
              </CardTitle>
              <CardDescription className="text-gray-400">
                Fill out the form below and we&apos;ll respond as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Your Name
                    </label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 text-gray-500 -translate-y-1/2" />
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="pl-10 border-white/10 bg-white/5 focus:border-cyan-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <EnvelopeSimple size={18} className="absolute left-3 top-1/2 text-gray-500 -translate-y-1/2" />
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="pl-10 border-white/10 bg-white/5 focus:border-cyan-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Subject
                  </label>
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="What is this about?"
                    className="border-white/10 bg-white/5 focus:border-cyan-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Message
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us more about your inquiry..."
                    className="min-h-[150px] border-white/10 bg-white/5 focus:border-cyan-500 resize-none"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Minimum 10 characters required
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                >
                  {isSubmitting ? (
                    <span className="flex gap-2 items-center">
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 animate-spin border-t-white"></div>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex gap-2 items-center">
                      <PaperPlaneTilt size={20} />
                      Send Message
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

