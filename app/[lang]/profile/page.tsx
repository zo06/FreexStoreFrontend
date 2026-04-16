'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'react-hot-toast';
import { User, Shield, Activity, Save, RefreshCw } from 'lucide-react';
import apiClient from '@/lib/api';
import { useTranslations } from 'next-intl';

interface SecurityStats {
  activeTokens: number;
  lastLogin: string;
  loginAttempts: number;
  accountLocked: boolean;
}

type Tab = 'profile' | 'security' | 'activity';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { user, updateProfile, logout, logoutAll } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [profileData, setProfileData] = useState({ username: '', email: '', displayName: '' });
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null);
  const [isLoading, setIsLoading] = useState({ profile: false, security: false });

  useEffect(() => {
    if (user) {
      setProfileData({ username: user.username || '', email: user.email || '', displayName: user.displayName || '' });
    }
    loadSecurityStats();
  }, [user]);

  const loadSecurityStats = async () => {
    try {
      setIsLoading(prev => ({ ...prev, security: true }));
      const stats = await apiClient.getSecurityStats() as SecurityStats;
      setSecurityStats(stats);
    } catch (error: any) {
      console.error('Failed to load security stats:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, security: false }));
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(prev => ({ ...prev, profile: true }));
    try {
      await updateProfile(profileData);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAll();
      toast.success('Logged out from all devices');
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout from all devices');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'activity', label: 'Activity', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="page-container">
        <div className="page-section">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-1">Profile Settings</h1>
            <p className="text-[#888] text-sm">Manage your account settings and preferences</p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            {/* Tab bar */}
            <div className="flex gap-1 p-1 rounded-xl bg-[#111]" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === key
                      ? 'bg-[#51a2ff] text-white'
                      : 'text-[#888] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="card-base p-6 space-y-6">
                <div>
                  <h2 className="text-white font-semibold mb-0.5">Profile Information</h2>
                  <p className="text-[#555] text-sm">Update your personal information and preferences</p>
                </div>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="username" className="text-sm font-medium text-[#ccc]">Username</label>
                    <input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      className="input-base w-full"
                      placeholder="Enter username"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="displayName" className="text-sm font-medium text-[#ccc]">Display Name</label>
                    <input
                      id="displayName"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                      className="input-base w-full"
                      placeholder="Enter display name"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className={`badge-blue text-xs ${user.isAdmin ? '' : 'opacity-60'}`}>
                      {user.isAdmin ? 'Administrator' : 'User'}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
                      user.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="btn-primary flex items-center gap-2"
                    disabled={isLoading.profile}
                  >
                    {isLoading.profile ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isLoading.profile ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="card-base p-6 space-y-6">
                <div>
                  <h2 className="text-white font-semibold mb-0.5">Session Management</h2>
                  <p className="text-[#555] text-sm">Manage your active sessions and security settings</p>
                </div>
                <button
                  onClick={handleLogoutAll}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-red-400 transition-colors"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  Logout from All Devices
                </button>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="card-base p-6 space-y-6">
                <div>
                  <h2 className="text-white font-semibold mb-0.5">Security Activity</h2>
                  <p className="text-[#555] text-sm">Monitor your account security and recent activity</p>
                </div>
                {isLoading.security ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin" />
                  </div>
                ) : securityStats ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Active Sessions', value: securityStats.activeTokens },
                      { label: 'Last Login', value: new Date(securityStats.lastLogin).toLocaleString(), small: true },
                      { label: 'Recent Login Attempts', value: securityStats.loginAttempts },
                      {
                        label: 'Account Status',
                        badge: securityStats.accountLocked
                          ? 'bg-red-500/10 text-red-400 border-red-500/20 Locked'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 Active'
                      },
                    ].map(({ label, value, small, badge }) => (
                      <div key={label} className="space-y-1">
                        <p className="text-sm text-[#555]">{label}</p>
                        {badge ? (
                          <span className={`text-xs px-3 py-1 rounded-full font-medium border ${badge.split(' ').slice(0, 3).join(' ')}`}>
                            {badge.split(' ').slice(3).join(' ')}
                          </span>
                        ) : (
                          <div className={`font-bold text-white ${small ? 'text-sm' : 'text-2xl text-[#51a2ff]'}`}>{value}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-[#555] text-sm">Failed to load security statistics</div>
                )}
                <div className="border-t border-[rgba(255,255,255,0.06)] pt-4">
                  <button
                    onClick={loadSecurityStats}
                    className="btn-ghost btn-sm flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Activity
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
