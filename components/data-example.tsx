'use client';

import { useUsers, useCurrentUser } from '@/lib/simple-data-fetcher';
import { useState, useEffect } from 'react';

export function DataExample() {
  // Using the new simple data fetching system
  const { data: currentUser, loading: currentUserLoading, error: currentUserError, refresh: refreshCurrentUser } = useCurrentUser();
  const { data: usersData, loading: usersLoading, error: usersError, refresh: refreshUsers } = useUsers();
  
  // Filter admin users from the users data
  const adminUsers = usersData?.data?.filter((user: any) => user.isAdmin) || [];

  useEffect(() => {
    // Data is automatically fetched by the simple system
    console.log('Current user:', currentUser);
    console.log('Users data:', usersData);
    console.log('Admin users:', adminUsers);
  }, [currentUser, usersData, adminUsers]);

  if (currentUserLoading || usersLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="mb-4 w-1/4 h-4 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
            <div className="w-4/6 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (currentUserError || usersError) {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="mb-4 text-red-600">
          Error: {currentUserError || usersError}
        </p>
        <div className="space-x-2">
          <button 
            onClick={refreshCurrentUser}
            className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
          >
            Retry Current User
          </button>
          <button 
            onClick={refreshUsers}
            className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
          >
            Retry Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="mb-2 text-xl font-semibold text-blue-800">Current User</h2>
        {currentUser?.data ? (
          <div className="text-sm">
            <p><strong>Discord:</strong> {currentUser.data?.discordUsername || 'N/A'}</p>
            <p><strong>Username:</strong> {currentUser.data?.username || 'N/A'}</p>
            <p><strong>Admin:</strong> {currentUser.data?.isAdmin ? 'Yes' : 'No'}</p>
            <p><strong>Server Member:</strong> {currentUser.data?.isServerMember ? 'Yes' : 'No'}</p>
          </div>
        ) : (
          <p className="text-gray-600">No current user data</p>
        )}
      </div>

      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">All Users ({usersData?.data?.length || 0})</h2>
          <button 
            onClick={refreshUsers}
            className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
        
        <ul className="space-y-1">
          {usersData?.data?.map((user: any) => (
            <li key={user.id} className="px-2 py-1 text-sm bg-white rounded border">
              {user.discordUsername || user.username} {user.isAdmin && <span className="font-medium text-blue-600">(Admin)</span>}
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-green-800">Admin Users ({adminUsers.length})</h2>
          <button 
            onClick={refreshUsers}
            className="px-3 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600"
          >
            Refresh
          </button>
        </div>
        
        <ul className="space-y-1">
          {adminUsers.map((user: any) => (
            <li key={user.id} className="px-2 py-1 text-sm bg-white rounded border">
              {user.discordUsername || user.username} - <span className="font-medium text-green-600">Admin</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h3 className="mb-2 text-lg font-semibold text-yellow-800">Simple Data Fetcher</h3>
        <ul className="space-y-1 text-sm text-yellow-700">
          <li>• Replaced complex Redux/SWR system with simple data fetcher</li>
          <li>• Direct API calls with basic caching and error handling</li>
          <li>• Simplified state management without external dependencies</li>
          <li>• Clean and maintainable code structure</li>
          <li>• Easy to understand and modify</li>
        </ul>
      </div>
    </div>
  );
}

