'use client';

import { useAuth } from '@/lib/auth-context';

interface ServerMembershipData {
  isServerMember: boolean;
  serverJoinedAt?: string;
}

export default function ServerMembershipStatus() {
  const { user, isLoading: authLoading } = useAuth();

  // Use auth context data directly instead of making separate API calls
  const membershipData: ServerMembershipData = {
    isServerMember: user?.isServerMember || false,
    serverJoinedAt: user?.serverJoinedAt ? user.serverJoinedAt : undefined
  };

  const loading = authLoading;
  const error = null; // No error since we're using auth context data

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Discord Server Status</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Discord Server Status</h3>
        <div className="text-red-600 dark:text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Discord Server Status</h3>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            membershipData.isServerMember ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm font-medium">
            {membershipData.isServerMember ? 'Server Member' : 'Not a Server Member'}
          </span>
        </div>
        
        {membershipData.isServerMember && membershipData.serverJoinedAt && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>Joined: {(() => {
              try {
                return new Date(membershipData.serverJoinedAt).toLocaleDateString();
              } catch (error) {
                console.error('Error formatting date:', error);
                return 'Invalid date';
              }
            })()}</p>
          </div>
        )}
        
        {!membershipData.isServerMember && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>Join our Discord server to access exclusive features!</p>
            <a 
              href="https://discord.gg/your-invite-link" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Join Discord Server →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
