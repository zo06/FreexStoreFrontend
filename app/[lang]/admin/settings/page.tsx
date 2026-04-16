"use client"

import { useState, useEffect } from 'react'
import { withAdminAuth } from '@/lib/auth-context'
import { ArrowLeft, Save, Settings, Shield, Globe, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { apiClient } from '@/lib/api'

function AdminSettings() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'FreeX',
    siteDescription: 'Premium Script Marketplace',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true
  })

  // Email settings state
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'FreeX'
  })

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: '24',
    maxLoginAttempts: '5',
    passwordMinLength: '8',
    requireStrongPasswords: true,
    enableTwoFactor: false
  })

  const handleSaveSystemSettings = async () => {
    setLoading(true)
    try {
      // TODO: Implement API call to save system settings
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('System settings saved successfully')
    } catch (error) {
      toast.error('Failed to save system settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEmailSettings = async () => {
    setLoading(true)
    try {
      // TODO: Implement API call to save email settings
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('Email settings saved successfully')
    } catch (error) {
      toast.error('Failed to save email settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSecuritySettings = async () => {
    setLoading(true)
    try {
      // TODO: Implement API call to save security settings
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('Security settings saved successfully')
    } catch (error) {
      toast.error('Failed to save security settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="card-base p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-xl"
                style={{ background: 'rgba(81,162,255,0.1)', border: '1px solid rgba(81,162,255,0.2)' }}
              >
                <Settings className="w-8 h-8 text-[#51a2ff]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">System Settings</h1>
                <p className="mt-1 text-[#555]">Configure system-wide settings and preferences</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="btn-ghost flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>

        {/* System Configuration */}
        <div className="card-base p-6 space-y-6">
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: 'rgba(81,162,255,0.08)', border: '1px solid rgba(81,162,255,0.15)' }}
            >
              <Globe className="w-5 h-5 text-[#51a2ff]" />
            </div>
            <div>
              <h2 className="text-white font-semibold">System Configuration</h2>
              <p className="text-[#555] text-sm">General system settings and site configuration</p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="pt-6 space-y-6">
            {/* Site Name & Description */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="siteName" className="text-white font-semibold text-sm block">Site Name</label>
                <input
                  id="siteName"
                  type="text"
                  value={systemSettings.siteName}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  className="input-base w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="siteDescription" className="text-white font-semibold text-sm block">Site Description</label>
                <input
                  id="siteDescription"
                  type="text"
                  value={systemSettings.siteDescription}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  className="input-base w-full"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              {/* Maintenance Mode */}
              <div className="flex items-center justify-between py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <p className="text-white font-semibold text-sm">Maintenance Mode</p>
                  <p className="text-[#555] text-sm">Enable to temporarily disable site access</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSystemSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                  style={{
                    background: systemSettings.maintenanceMode ? '#51a2ff' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  aria-checked={systemSettings.maintenanceMode}
                  role="switch"
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    style={{ transform: systemSettings.maintenanceMode ? 'translateX(22px)' : 'translateX(2px)' }}
                  />
                </button>
              </div>

              {/* User Registration */}
              <div className="flex items-center justify-between py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <p className="text-white font-semibold text-sm">User Registration</p>
                  <p className="text-[#555] text-sm">Allow new users to register accounts</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSystemSettings(prev => ({ ...prev, registrationEnabled: !prev.registrationEnabled }))}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                  style={{
                    background: systemSettings.registrationEnabled ? '#51a2ff' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  aria-checked={systemSettings.registrationEnabled}
                  role="switch"
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    style={{ transform: systemSettings.registrationEnabled ? 'translateX(22px)' : 'translateX(2px)' }}
                  />
                </button>
              </div>

              {/* Email Verification */}
              <div className="flex items-center justify-between py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <p className="text-white font-semibold text-sm">Email Verification Required</p>
                  <p className="text-[#555] text-sm">Require email verification for new accounts</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSystemSettings(prev => ({ ...prev, emailVerificationRequired: !prev.emailVerificationRequired }))}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                  style={{
                    background: systemSettings.emailVerificationRequired ? '#51a2ff' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  aria-checked={systemSettings.emailVerificationRequired}
                  role="switch"
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    style={{ transform: systemSettings.emailVerificationRequired ? 'translateX(22px)' : 'translateX(2px)' }}
                  />
                </button>
              </div>
            </div>

            <button
              onClick={handleSaveSystemSettings}
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save System Settings
            </button>
          </div>
        </div>

        {/* Email Configuration */}
        <div className="card-base p-6 space-y-6">
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}
            >
              <Mail className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Email Configuration</h2>
              <p className="text-[#555] text-sm">SMTP settings for sending system emails</p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="pt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="smtpHost" className="text-white font-semibold text-sm block">SMTP Host</label>
                <input
                  id="smtpHost"
                  type="text"
                  value={emailSettings.smtpHost}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                  placeholder="smtp.gmail.com"
                  className="input-base w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="smtpPort" className="text-white font-semibold text-sm block">SMTP Port</label>
                <input
                  id="smtpPort"
                  type="text"
                  value={emailSettings.smtpPort}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
                  placeholder="587"
                  className="input-base w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="smtpUser" className="text-white font-semibold text-sm block">SMTP Username</label>
                <input
                  id="smtpUser"
                  type="text"
                  value={emailSettings.smtpUser}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                  className="input-base w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="smtpPassword" className="text-white font-semibold text-sm block">SMTP Password</label>
                <input
                  id="smtpPassword"
                  type="password"
                  value={emailSettings.smtpPassword}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                  className="input-base w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="fromEmail" className="text-white font-semibold text-sm block">From Email</label>
                <input
                  id="fromEmail"
                  type="email"
                  value={emailSettings.fromEmail}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                  placeholder="noreply@freex.com"
                  className="input-base w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="fromName" className="text-white font-semibold text-sm block">From Name</label>
                <input
                  id="fromName"
                  type="text"
                  value={emailSettings.fromName}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                  className="input-base w-full"
                />
              </div>
            </div>

            <button
              onClick={handleSaveEmailSettings}
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save Email Settings
            </button>
          </div>
        </div>

        {/* Security Configuration */}
        <div className="card-base p-6 space-y-6">
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: 'rgba(81,162,255,0.08)', border: '1px solid rgba(81,162,255,0.15)' }}
            >
              <Shield className="w-5 h-5 text-[#51a2ff]" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Security Configuration</h2>
              <p className="text-[#555] text-sm">Security policies and authentication settings</p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="pt-6 space-y-6">
            {/* Numeric inputs */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <label htmlFor="sessionTimeout" className="text-white font-semibold text-sm block">Session Timeout (hours)</label>
                <input
                  id="sessionTimeout"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                  className="input-base w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="maxLoginAttempts" className="text-white font-semibold text-sm block">Max Login Attempts</label>
                <input
                  id="maxLoginAttempts"
                  type="number"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: e.target.value }))}
                  className="input-base w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="passwordMinLength" className="text-white font-semibold text-sm block">Min Password Length</label>
                <input
                  id="passwordMinLength"
                  type="number"
                  value={securitySettings.passwordMinLength}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: e.target.value }))}
                  className="input-base w-full"
                />
              </div>
            </div>

            {/* Security Toggles */}
            <div className="space-y-0">
              {/* Require Strong Passwords */}
              <div className="flex items-center justify-between py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <p className="text-white font-semibold text-sm">Require Strong Passwords</p>
                  <p className="text-[#555] text-sm">Enforce uppercase, lowercase, numbers, and symbols</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSecuritySettings(prev => ({ ...prev, requireStrongPasswords: !prev.requireStrongPasswords }))}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                  style={{
                    background: securitySettings.requireStrongPasswords ? '#51a2ff' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  aria-checked={securitySettings.requireStrongPasswords}
                  role="switch"
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    style={{ transform: securitySettings.requireStrongPasswords ? 'translateX(22px)' : 'translateX(2px)' }}
                  />
                </button>
              </div>

              {/* Two-Factor Auth */}
              <div className="flex items-center justify-between py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <p className="text-white font-semibold text-sm">Enable Two-Factor Authentication</p>
                  <p className="text-[#555] text-sm">Require 2FA for admin accounts</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSecuritySettings(prev => ({ ...prev, enableTwoFactor: !prev.enableTwoFactor }))}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                  style={{
                    background: securitySettings.enableTwoFactor ? '#51a2ff' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  aria-checked={securitySettings.enableTwoFactor}
                  role="switch"
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    style={{ transform: securitySettings.enableTwoFactor ? 'translateX(22px)' : 'translateX(2px)' }}
                  />
                </button>
              </div>
            </div>

            <button
              onClick={handleSaveSecuritySettings}
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save Security Settings
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default withAdminAuth(AdminSettings)
