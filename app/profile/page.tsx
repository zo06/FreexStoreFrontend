'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { User, Shield, Activity, Save, RefreshCw } from 'lucide-react';
import apiClient from '@/lib/api';

interface SecurityStats {
  activeTokens: number;
  lastLogin: string;
  loginAttempts: number;
  accountLocked: boolean;
}

export default function ProfilePage() {
  const { user, updateProfile, logout, logoutAll } = useAuth();
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    displayName: ''
  });

  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null);
  const [isLoading, setIsLoading] = useState({
    profile: false,

    security: false
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        displayName: user.displayName || ''
      });
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
      await logoutAll(); // Logout from all devices
      toast.success('Logged out from all devices');
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout from all devices');
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br via-cyan-900 from-slate-900 to-slate-900">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen bg-gradient-to-br via-cyan-900 from-slate-900 to-slate-900">
      <div className="mx-auto space-y-6 max-w-4xl">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="text-slate-400">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full bg-slate-800/50">
            <TabsTrigger value="profile" className="data-[state=active]:bg-cyan-600">
              <User className="mr-2 w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-cyan-600">
              <Shield className="mr-2 w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-cyan-600">
              <Activity className="mr-2 w-4 h-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
                <CardDescription className="text-slate-400">
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-white">Username</Label>
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                        className="text-white bg-slate-700 border-slate-600"
                        placeholder="Enter username"
                        required
                      />
                    </div>

                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-white">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                      className="text-white bg-slate-700 border-slate-600"
                      placeholder="Enter display name"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
                      {user.isAdmin ? 'Administrator' : 'User'}
                    </Badge>
                    <Badge variant={user.isActive ? 'default' : 'destructive'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                    disabled={isLoading.profile}
                  >
                    {isLoading.profile ? (
                      <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 w-4 h-4" />
                    )}
                    {isLoading.profile ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">


              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Session Management</CardTitle>
                  <CardDescription className="text-slate-400">
                    Manage your active sessions and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleLogoutAll}
                    variant="destructive"
                    className="w-full"
                  >
                    Logout from All Devices
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Security Activity</CardTitle>
                <CardDescription className="text-slate-400">
                  Monitor your account security and recent activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading.security ? (
                  <div className="flex justify-center items-center py-8">
                    <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                  </div>
                ) : securityStats ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-white">Active Sessions</Label>
                      <div className="text-2xl font-bold text-cyan-400">{securityStats.activeTokens}</div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Last Login</Label>
                      <div className="text-sm text-slate-400">
                        {new Date(securityStats.lastLogin).toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Recent Login Attempts</Label>
                      <div className="text-2xl font-bold text-blue-400">{securityStats.loginAttempts}</div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Account Status</Label>
                      <Badge variant={securityStats.accountLocked ? 'destructive' : 'default'}>
                        {securityStats.accountLocked ? 'Locked' : 'Active'}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400">
                    Failed to load security statistics
                  </div>
                )}
                <Separator className="my-4 bg-slate-600" />
                <Button
                  onClick={loadSecurityStats}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <RefreshCw className="mr-2 w-4 h-4" />
                  Refresh Activity
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
