'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { withAdminAuth } from '@/lib/auth-context';
import { safeAdminApi, License, User, Script } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatedSelect } from '@/components/ui/animated-select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Key, Server, Calendar, User as UserIcon, CheckCircle, Loader2, Copy, Save, Plus, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';

function LicenseManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const licenseId = searchParams.get('id');
  const userId = searchParams.get('userId');
  const scriptId = searchParams.get('scriptId');
  
  const isEditing = !!licenseId;
  const isCreating = !isEditing;

  // State management
  const [license, setLicense] = useState<License | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [copied, setCopied] = useState(false);


  // Form data
  const [formData, setFormData] = useState({
    userId: userId || '',
    scriptId: scriptId || '',
    expiresAt: '',
    isActive: true
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [licenseId]);



  const loadInitialData = async () => {
    setLoading(true);
    
    try {
      // Load users and scripts in parallel
      const [usersResult, scriptsResult] = await Promise.all([
        safeAdminApi.users.getAll(),
        safeAdminApi.scripts.getAll()
      ]);

      if (usersResult.data) {
        setUsers(usersResult.data || []);
      } else {
        throw new Error('Failed to load users');
      }
      if (scriptsResult) {
        setScripts(scriptsResult || []);
      } else {
        throw new Error('Failed to load scripts');
      }

      // Load license if editing
      if (isEditing && licenseId) {
        const licenseData = await safeAdminApi.licenses.getById(licenseId);
        if (licenseData) {
          setLicense(licenseData);
          setFormData({
            userId: licenseData.userId,
            scriptId: licenseData.scriptId,
            expiresAt: licenseData.expiresAt ? new Date(licenseData.expiresAt).toISOString().split('T')[0] : '',
            isActive: licenseData.isActive
          });
        } else {
          throw new Error('Failed to load license');
        }
      } else {
        // Set default expiration date for new licenses (30 days from now)
        const defaultExpiration = new Date();
        defaultExpiration.setDate(defaultExpiration.getDate() + 30);
        setFormData(prev => ({
          ...prev,
          expiresAt: defaultExpiration.toISOString().split('T')[0]
        }));
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validation
      if (!formData.userId.trim()) {
        toast.error('User is required');
        setSaving(false);
        return;
      }
      if (!formData.scriptId.trim()) {
        toast.error('Script is required');
        setSaving(false);
        return;
      }
      
      const selectedScript = scripts.find(s => s.id === formData.scriptId);
      const isForeverScript = selectedScript?.licenseType === 'forever';
      
      const expirationDate = new Date(formData.expiresAt);

      if (isCreating) {
        // Get user and script details for logging
        const selectedUser = users.find(u => u.id === formData.userId);
        const selectedScript = scripts.find(s => s.id === formData.scriptId);
        
        // Create new license
        const createData = {
          userId: formData.userId.trim(),
          scriptId: formData.scriptId.trim(),
          expiresAt: expirationDate.toISOString()
        };
        
        const result = await safeAdminApi.licenses.create(createData);
        console.log(result)
        if (result) {
          // Show success message with activity log details
          const expiryDateFormatted = isForeverScript 
            ? 'Forever (No Expiration)' 
            : new Date(formData.expiresAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });
          
          toast.success(
            `License created successfully!\n\n✓ Admin gave ${selectedUser?.username || 'User'} access to "${selectedScript?.name || 'Script'}"\n✓ License Type: ${isForeverScript ? 'Forever' : 'Date-based'}\n✓ Expires: ${expiryDateFormatted}\n✓ Status: Active\n\n📝 Activity logged in user's Recent Activity`,
            { duration: 5000 }
          );
          
          setTimeout(() => {
            router.push('/admin/licenses');
          }, 1500);
        } else {
          toast.error('Failed to create license');
        }
      } else if (license) {
        // Update existing license
        const updateData = {
          expiresAt: expirationDate.toISOString(),
          isActive: formData.isActive
        };
        
        const result = await safeAdminApi.licenses.update(license.id, updateData);
        if (result) {
          toast.success('License updated successfully');
          router.push('/admin/licenses');
        } else {
          toast.error('Failed to update license');
        }
      }
    } catch (err: any) {
      console.error('Operation failed:', err);
      
      // Handle specific error cases
      if (err?.response?.status === 409) {
        toast.error('License already exists for this user and script combination');
      } else if (err?.message) {
        toast.error(err.message);
      } else {
        toast.error('Operation failed');
      }
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getStatusBadge = (license: License) => {
    if (!license.isActive) {
      return <Badge variant="destructive">Revoked</Badge>;
    }
    
    const now = new Date();
    if (!license.expiresAt) {
      return <Badge variant="default">No Expiration</Badge>;
    }
    const expiresAt = new Date(license.expiresAt);
    
    if (expiresAt <= now) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 7) {
      return <Badge variant="destructive">Expires Soon</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return <Badge variant="secondary">Expires in {daysUntilExpiry} days</Badge>;
    }
    
    return <Badge variant="default">Active</Badge>;
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900">
        <div className="mx-auto max-w-4xl">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <span className="ml-2 text-white">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex gap-4 items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/licenses')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Licenses
          </Button>
          <div className="flex gap-3 items-center">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Key className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {isCreating ? 'Create License' : 'Edit License'}
              </h1>
              <p className="text-gray-400">
                {isCreating ? 'Create a new license for a user and script' : 'Modify license details and settings'}
              </p>
            </div>
          </div>
        </div>



        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="flex gap-2 items-center text-white">
                  {isCreating ? <Plus className="w-5 h-5" /> : <Key className="w-5 h-5" />}
                  License Details
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {isCreating ? 'Enter the details for the new license' : 'Update the license information'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* User Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="userId" className="flex gap-2 items-center text-white">
                      <UserIcon className="w-4 h-4" />
                      User
                    </Label>
                    <AnimatedSelect
                      options={users.map(user => ({ value: user.id, label: `${user.username} (${user.email})` }))}
                      value={formData.userId}
                      onChange={(value) => setFormData(prev => ({ ...prev, userId: value }))}
                      placeholder="Select a user"
                      isDisabled={isEditing}
                    />
                  </div>

                  {/* Script Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="scriptId" className="flex gap-2 items-center text-white">
                      <Key className="w-4 h-4" />
                      Script
                    </Label>
                    <AnimatedSelect
                      options={scripts.map(script => ({ value: script.id, label: `${script.name} (v${script.version})` }))}
                      value={formData.scriptId}
                      onChange={(value) => {
                        setFormData(prev => ({ ...prev, scriptId: value }));
                        // Check if selected script has forever expiration
                        const selectedScript = scripts.find(s => s.id === value);
                        if (selectedScript?.licenseType === 'forever') {
                          // Set expiration to far future for forever scripts
                          const foreverDate = new Date('2099-12-31');
                          setFormData(prev => ({ ...prev, expiresAt: foreverDate.toISOString().split('T')[0] }));
                        }
                      }}
                      placeholder="Select a script"
                      isDisabled={isEditing}
                    />
                  </div>



                  {/* Expiration Date */}
                  <div className="space-y-2">
                    <Label htmlFor="expiresAt" className="flex gap-2 items-center text-white">
                      <Calendar className="w-4 h-4" />
                      Expiration Date
                    </Label>
                    {(() => {
                      const selectedScript = scripts.find(s => s.id == formData.scriptId);
                      const isForeverScript = selectedScript?.licenseType === 'forever';
                      
                      if (isForeverScript) {
                        return (
                          <div className="p-3 text-white rounded-md border bg-white/10 border-white/20">
                            <div className="flex gap-2 items-center">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span>This script has no expiration date (Forever)</span>
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <Input
                          id="expiresAt"
                          type="date"
                          value={formData.expiresAt}
                          onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                          className="text-white bg-white/10 border-white/20"
                          required
                        />
                      );
                    })()}
                  </div>

                  {/* Active Status (only for editing) */}
                  {isEditing && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                      />
                      <Label htmlFor="isActive" className="text-white">
                        License Active
                      </Label>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="text-white bg-blue-600 hover:bg-blue-700"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                          {isCreating ? 'Creating...' : 'Updating...'}
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 w-4 h-4" />
                          {isCreating ? 'Create License' : 'Update License'}
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/admin/licenses')}
                      className="text-white border-white/20 hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* License Info Sidebar */}
          <div className="space-y-6">
            {/* Current License Info (for editing) */}
            {isEditing && license && (
              <Card className="backdrop-blur-sm bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="flex gap-2 items-center text-white">
                    <Key className="w-5 h-5" />
                    License Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(license)}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300">Private Key</Label>
                    <div className="flex gap-2 items-center mt-1">
                      <code className="p-2 text-xs text-white break-all rounded bg-black/20">
                        {license.privateKey}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(license.privateKey)}
                        className="text-white hover:bg-white/10"
                      >
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300">Created</Label>
                    <p className="text-sm text-white">
                      {new Date(license.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300">Last Updated</Label>
                    <p className="text-sm text-white">
                      {new Date(license.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help Card */}
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-lg text-white">Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-300">
                <div>
                  <strong className="text-white">User:</strong> The user who will own this license
                </div>
                <div>
                  <strong className="text-white">Script:</strong> The script this license grants access to
                </div>
                <div>
                  <strong className="text-white">Server IP:</strong> Optional IP restriction for the license
                </div>
                <div>
                  <strong className="text-white">Expiration:</strong> When the license will expire
                </div>
                {isEditing && (
                  <div>
                    <strong className="text-white">Active:</strong> Whether the license is currently active
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function LicenseManagement() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <LicenseManagementContent />
    </Suspense>
  );
}

export default withAdminAuth(LicenseManagement);
