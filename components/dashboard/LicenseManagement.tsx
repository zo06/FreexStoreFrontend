'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Key, Server, Calendar, Activity, Globe } from 'lucide-react'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

interface License {
  id: string
  privateKey: string
  licenseType: string
  expiresAt: string | null
  lastUsedIp: string
  isActive: boolean
  script: {
    id: string
    name: string
    version: string
  }
  createdAt: string
  updatedAt: string
}

interface LicenseManagementProps {
  licenses: License[]
  licensesIpAddress?: string | null
  onLicenseUpdate?: () => void
}

export function LicenseManagement({ licenses, licensesIpAddress, onLicenseUpdate }: LicenseManagementProps) {
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showPrivateKey, setShowPrivateKey] = useState<{ [key: string]: boolean }>({})




  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleUpdateIpAddress = async (licenseId: string, newIpAddress: string) => {
    try {
      if (!newIpAddress || !newIpAddress.trim()) {
        toast.error('Please enter a valid IP address')
        return
      }
      
      setIsUpdating(true)
      await apiClient.updateLicenseIpAddress(licenseId, newIpAddress.trim())
      toast.success('IP address updated successfully!')
      
      if (onLicenseUpdate) {
        onLicenseUpdate()
      }
      
    } catch (error) {
      console.error('Failed to update IP address:', error)
      toast.error('Failed to update IP address. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleValidateLicense = async (privateKey: string) => {
    try {
      const result = await apiClient.validateLicenseByPrivateKey(privateKey)
      if (result.valid) {
        toast.success('License is valid!')
      } else {
        toast.error('License is invalid or expired')
      }
    } catch (error) {
      console.error('Failed to validate license:', error)
      toast.error('Failed to validate license. Please try again.')
    }
  }

  const togglePrivateKeyVisibility = (licenseId: string) => {
    setShowPrivateKey(prev => ({
      ...prev,
      [licenseId]: !prev[licenseId]
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpired = (license: License) => {
    if (!license.expiresAt) return false
    return new Date(license.expiresAt) < new Date()
  }



  if (licenses.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="pt-6">
          <div className="py-8 text-center">
            <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gradient-to-r rounded-full from-cyan-500/20 to-blue-500/20">
              <Key className="w-8 h-8 text-muted" />
            </div>
            <h4 className="mb-2 font-semibold text-white">No Licenses Found</h4>
            <p className="mb-4 text-sm text-muted">You don't have any licenses yet.</p>
            <Button 
              onClick={() => window.location.href = '/scripts'}
              className="cursor-pointer"
            >
              Browse Scripts
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {licenses.map((license) => (
          <Card key={license.id} className="transition-colors bg-white/5 border-white/10 hover:bg-white/10">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-white">{license.script.name}</CardTitle>
                  <CardDescription className="text-muted">
                    Version {license.script.version} • Created {formatDate(license.createdAt)}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge 
                    variant={license.isActive && !isExpired(license) ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {license.isActive && !isExpired(license) ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {license.licenseType === 'forever' ? 'Lifetime' : 'Time-based'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Private Key Section */}
              <div className="space-y-2">
                <div className="flex gap-2 items-center">
                  <Key className="w-4 h-4 text-muted" />
                  <label className="text-sm font-medium text-white">Private Key</label>
                </div>
                <div className="flex gap-2 items-center">
                  <input 
                    type={showPrivateKey[license.id] ? 'text' : 'password'}
                    value={license.privateKey}
                    readOnly
                    className="flex-1 px-3 py-2 font-mono text-sm text-white rounded-lg border bg-white/10 border-white/20"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => togglePrivateKeyVisibility(license.id)}
                    className="px-3 cursor-pointer"
                  >
                    {showPrivateKey[license.id] ? 'Hide' : 'Show'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyToClipboard(license.privateKey)}
                    className="px-3 cursor-pointer"
                  >
                    Copy
                  </Button>
                </div>
              </div>

              {/* IP Address Section */}
              <div className="space-y-2">
                <div className="flex gap-2 items-center">
                  <Server className="w-4 h-4 text-muted" />
                  <label className="text-sm font-medium text-white">
                    IP Address
                  </label>
                </div>
                
                <div className="px-3 py-2 rounded-lg border bg-white/10 border-white/20">
                  <p className="font-mono text-sm text-white">
                    {licensesIpAddress || 'No IP restriction'}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    IP address for this license
                  </p>
                </div>
                
                {license.lastUsedIp && (
                  <p className="text-xs text-muted">
                    Last used IP: <span className="font-mono">{license.lastUsedIp}</span>
                  </p>
                )}
              </div>

              {/* License Details */}
              <div className="grid grid-cols-1 gap-4 pt-4 border-t md:grid-cols-2 border-white/10">
                {license.expiresAt && (
                  <div className="flex gap-2 items-center">
                    <Calendar className="w-4 h-4 text-muted" />
                    <div>
                      <p className="text-sm font-medium text-white">Expires</p>
                      <p className="text-xs text-muted">{formatDate(license.expiresAt)}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 items-center">
                  <Activity className="w-4 h-4 text-muted" />
                  <div>
                    <p className="text-sm font-medium text-white">Last Updated</p>
                    <p className="text-xs text-muted">{formatDate(license.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleValidateLicense(license.privateKey)}
                  className="cursor-pointer"
                >
                  Validate License
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedLicense(license)}
                  className="cursor-pointer"
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

