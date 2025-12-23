'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Server, Info, Loader2, Save, Globe, Shield, CheckCircle, RefreshCw, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface LicensesIpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LicensesIpModal({ isOpen, onClose }: LicensesIpModalProps) {
  const [licensesIpAddress, setLicensesIpAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLicensesIp();
    }
  }, [isOpen]);

  const loadLicensesIp = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getLicensesIp();
      // Handle both response formats: { data: { licensesIpAddress } } or { licensesIpAddress }
      const existingIp = response?.data?.licensesIpAddress || response?.licensesIpAddress || '';
      setLicensesIpAddress(existingIp);
    } catch (error) {
      console.error('Failed to load licenses IP:', error);
      // Don't show error toast, just set empty - user can still enter new IP
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!licensesIpAddress.trim()) {
      toast.error('Please enter a valid IP address');
      return;
    }

    try {
      setIsSaving(true);
      await apiClient.updateLicensesIp({ licensesIpAddress: licensesIpAddress.trim() });
      toast.success('Licenses IP address updated successfully');
      onClose();
    } catch (error) {
      console.error('Failed to update licenses IP:', error);
      toast.error('Please enter a valid IP address format (e.g. 192.168.1.100)');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    try {
      setIsSaving(true);
      await apiClient.updateLicensesIp({ licensesIpAddress: '' });
      setLicensesIpAddress('');
      toast.success('Licenses IP address cleared');
    } catch (error) {
      console.error('Failed to clear licenses IP:', error);
      toast.error('Failed to clear IP address');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Quick IP Settings</h2>
              <p className="text-sm text-gray-400">Configure your server IP address</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
              <p className="text-gray-400 text-sm">Loading settings...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Info Alert */}
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-400">
                    This IP address will be used for all your license validations. 
                    Set your FiveM server&apos;s public IP here.
                  </p>
                </div>
              </div>

              {/* Current Status */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${licensesIpAddress ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-gray-500'}`}></div>
                    <span className="text-gray-400 text-sm">Status:</span>
                  </div>
                  {licensesIpAddress ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-mono text-sm">{licensesIpAddress}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">Not configured</span>
                  )}
                </div>
              </div>

              {/* Input */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Server IP Address
                </label>
                <div className="relative">
                  <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Enter IP (e.g., 192.168.1.100)"
                    value={licensesIpAddress}
                    onChange={(e) => setLicensesIpAddress(e.target.value)}
                    className="pl-10 h-11 bg-white/5 border-white/10 rounded-xl font-mono text-white placeholder:text-gray-500 focus:border-cyan-500/50"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-white/10 bg-white/[0.02]">
          <div className="flex gap-2">
            {licensesIpAddress && !isLoading && (
              <Button 
                variant="outline" 
                onClick={handleClear}
                disabled={isSaving}
                className="h-10 px-4 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Clear
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isSaving}
              className="h-10 px-4 border-white/10 text-gray-300 hover:bg-white/5 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || isLoading || licensesIpAddress.trim() === ''}
              className="h-10 px-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium rounded-xl shadow-lg shadow-cyan-500/25"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1.5" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
