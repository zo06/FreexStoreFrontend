'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { Scroll, Globe, HardDrives } from 'phosphor-react'
import toast from 'react-hot-toast'

interface LicenseCardProps {
  license: {
    id: string
    name: string
    category: string
    status: string
    price: number
    privateKey: string
    lastUsedIp: string
    licenseType: string
    expiresAt: string | null
    version: string
    downloadCount: number
  }
  licensesIpAddress?: string | null
  onUpdate?: () => void
}

export function LicenseCard({ license, licensesIpAddress, onUpdate }: LicenseCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'expired':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'suspended':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }



  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleUpdateIpAddress = async (newIpAddress: string) => {
    try {
      if (!newIpAddress || !newIpAddress.trim()) {
        toast.error('Please enter a valid IP address')
        return
      }
      
      setIsUpdating(true)
      await apiClient.updateLicenseIpAddress(license.id, newIpAddress.trim())
      toast.success('IP address updated successfully!')
      
      if (onUpdate) {
        onUpdate()
      }
      
    } catch (error) {
      console.error('Failed to update IP address:', error)
      toast.error('Failed to update IP address. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleValidateLicense = async () => {
    try {
      const result = await apiClient.validateLicenseByPrivateKey(license.privateKey)
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

  const handleScriptAction = (action: string) => {
    if (action === 'download') {
      toast.success('Download started!')
    } else if (action === 'manage') {
      toast.success('Opening script management...')
    }
  }

  return (
    <div className="p-4 rounded-lg border transition-colors lg:p-6 bg-white/5 border-cyan-500/20 hover:bg-white/10 group">
      <div className="flex flex-col gap-4 justify-between lg:flex-row lg:items-start">
        <div className="flex-1">
          <div className="flex gap-3 items-center mb-3 lg:gap-4">
            <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-gradient-to-r rounded-lg lg:w-12 lg:h-12 from-cyan-500/20 to-blue-500/20">
              <Scroll size={24} className="text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white truncate transition-colors group-hover:text-gradient lg:text-base">
                {license.name}
              </h4>
              <div className="flex flex-wrap gap-2 items-center mt-1 lg:gap-4">
                <span className="text-xs text-muted lg:text-sm">{license.category}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(license.status)}`}>
                  {license.status}
                </span>
                <span className="text-xs text-muted lg:text-sm">{license.downloadCount} downloads</span>
                <span className="text-xs text-muted lg:text-sm">{license.version}</span>
              </div>
            </div>
          </div>
          
          {/* License Details */}
          <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-2">
            <div>
              <label className="block mb-1 text-xs font-medium text-muted">Private Key</label>
              <div className="flex gap-2 items-center">
                <input 
                  type="text" 
                  value={license.privateKey}
                  readOnly
                  className="flex-1 px-2 py-1 font-mono text-xs text-white rounded border bg-white/10 border-white/20"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(license.privateKey)}
                  className="px-2 py-1 text-xs cursor-pointer"
                >
                  Copy
                </Button>
              </div>
            </div>
            
            <div>
              <label className="flex gap-1 items-center text-xs font-medium text-muted">
                <HardDrives className="w-3 h-3" />
                Allowed IP
              </label>
              
              <div className="px-2 py-1 text-xs rounded border bg-white/10 border-white/20">
                <span className="font-mono text-white">
                  {licensesIpAddress || 'No IP restriction'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="flex flex-wrap gap-4 items-center text-xs text-muted">
            <span>License Type: <span className="font-medium text-white">
              {license.licenseType === 'forever' ? 'Lifetime' : 'Time-based'}
            </span></span>
            {license.expiresAt && (
              <span>Expires: <span className="font-medium text-white">
                {new Date(license.expiresAt).toLocaleDateString()}
              </span></span>
            )}
            <span>Last IP: <span className="font-mono font-medium text-white">{license.lastUsedIp}</span></span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-accent lg:text-base">${license.price}</span>
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="px-3 py-2 text-xs cursor-pointer lg:px-4 lg:text-sm"
              onClick={() => handleScriptAction('download')}
              disabled={license.status !== 'active'}
            >
              Download
            </Button>
            <Button 
              size="sm" 
              className="px-3 py-2 text-xs cursor-pointer lg:px-4 lg:text-sm"
              onClick={() => handleScriptAction('manage')}
            >
              Manage
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="px-3 py-2 text-xs cursor-pointer lg:px-4 lg:text-sm"
              onClick={handleValidateLicense}
            >
              Validate
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

