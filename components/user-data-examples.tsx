'use client';

import React, { useState } from 'react';
import {
  useAllUsers,
  useUser,
  useUsersByRole,
  useUserSearch,
  useCurrentUser,
  useUsersByIds
} from '@/hooks/use-user-data';
import { User } from '@/lib/user-data-fetcher';

/**
 * Example component demonstrating various user data fetching patterns
 * This shows how to fetch user data across the website using the new system
 */
export const UserDataExamples: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('user');
  const [userIds, setUserIds] = useState<string[]>([]);

  return (
    <div className="p-6 space-y-8">
      <h1 className="mb-6 text-3xl font-bold">User Data Fetching Examples</h1>
      
      {/* Current User Profile */}
      <CurrentUserExample />
      
      {/* All Users with Pagination */}
      <AllUsersExample />
      
      {/* Single User by ID */}
      <SingleUserExample 
        userId={selectedUserId} 
        onUserIdChange={setSelectedUserId} 
      />
      
      {/* Users by Role */}
      <UsersByRoleExample 
        role={selectedRole} 
        onRoleChange={setSelectedRole} 
      />
      
      {/* User Search */}
      <UserSearchExample 
        searchTerm={searchTerm} 
        onSearchTermChange={setSearchTerm} 
      />
      
      {/* Batch User Fetching */}
      <BatchUsersExample 
        userIds={userIds} 
        onUserIdsChange={setUserIds} 
      />
    </div>
  );
};

/**
 * Example: Fetch current user profile
 */
const CurrentUserExample: React.FC = () => {
  const { data: currentUser, loading, error, refresh } = useCurrentUser({
    refreshInterval: 300000, // Refresh every 5 minutes
  });

  return (
    <div className="p-4 rounded-lg border">
      <h2 className="mb-4 text-xl font-semibold">Current User Profile</h2>
      
      <div className="flex gap-2 mb-4">
        <button 
          onClick={refresh}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh Profile'}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 text-red-500">Error: {error}</div>
      )}
      
      {currentUser && (
        <div className="p-4 bg-gray-50 rounded">
          <p><strong>ID:</strong> {currentUser.id}</p>
          <p><strong>Discord:</strong> {currentUser.discordUsername || 'N/A'}</p>
          <p><strong>Username:</strong> {currentUser.username || 'N/A'}</p>
          <p><strong>Admin:</strong> {currentUser.isAdmin ? 'Yes' : 'No'}</p>
          <p><strong>Server Member:</strong> {currentUser.isServerMember ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
};

/**
 * Example: Fetch all users with pagination
 */
const AllUsersExample: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  
  const { data: usersData, loading, error, refresh } = useAllUsers(
    { page, limit, search },
    { retryCount: 3, retryDelay: 1000 }
  );

  return (
    <div className="p-4 rounded-lg border">
      <h2 className="mb-4 text-xl font-semibold">All Users (Paginated)</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded border"
        />
        <select 
          value={limit} 
          onChange={(e) => setLimit(Number(e.target.value))}
          className="px-3 py-2 rounded border"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
        </select>
        <button 
          onClick={refresh}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 text-red-500">Error: {error}</div>
      )}
      
      {usersData && (
        <div>
          <div className="mb-4">
            <p>Total: {usersData.pagination.total} users</p>
            <p>Page {usersData.pagination.page} of {usersData.pagination.totalPages}</p>
          </div>
          
          <div className="grid gap-2 mb-4">
            {usersData.data.map((user: User) => (
              <div key={user.id} className="p-3 bg-gray-50 rounded">
                <p><strong>{user.discordUsername || user.username}</strong> {user.isAdmin && '(Admin)'}</p>
                <p className="text-sm text-gray-600">ID: {user.id}</p>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(Math.min(usersData.pagination.totalPages, page + 1))}
              disabled={page >= usersData.pagination.totalPages}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Example: Fetch single user by ID
 */
interface SingleUserExampleProps {
  userId: string;
  onUserIdChange: (userId: string) => void;
}

const SingleUserExample: React.FC<SingleUserExampleProps> = ({ userId, onUserIdChange }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  
  const { data: user, loading, error, refresh } = useUser(
    userId || null,
    isAdmin,
    { immediate: false } // Don't fetch immediately, wait for user input
  );

  return (
    <div className="p-4 rounded-lg border">
      <h2 className="mb-4 text-xl font-semibold">Single User by ID</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter user ID..."
          value={userId}
          onChange={(e) => onUserIdChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded border"
        />
        <label className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />
          Admin Access
        </label>
        <button 
          onClick={refresh}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          disabled={loading || !userId}
        >
          {loading ? 'Loading...' : 'Fetch User'}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 text-red-500">Error: {error}</div>
      )}
      
      {user && (
        <div className="p-4 bg-gray-50 rounded">
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Discord:</strong> {user.discordUsername || 'N/A'}</p>
          <p><strong>Username:</strong> {user.username || 'N/A'}</p>
          <p><strong>Admin:</strong> {user.isAdmin ? 'Yes' : 'No'}</p>
          <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
};

/**
 * Example: Fetch users by role
 */
interface UsersByRoleExampleProps {
  role: string;
  onRoleChange: (role: string) => void;
}

const UsersByRoleExample: React.FC<UsersByRoleExampleProps> = ({ role, onRoleChange }) => {
  const [page, setPage] = useState(1);
  
  const { data: usersData, loading, error, refresh } = useUsersByRole(
    role,
    { page, limit: 5 }
  );

  return (
    <div className="p-4 rounded-lg border">
      <h2 className="mb-4 text-xl font-semibold">Users by Role</h2>
      
      <div className="flex gap-2 mb-4">
        <select 
          value={role} 
          onChange={(e) => onRoleChange(e.target.value)}
          className="px-3 py-2 rounded border"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
        </select>
        <button 
          onClick={refresh}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 text-red-500">Error: {error}</div>
      )}
      
      {usersData && (
        <div>
          <p className="mb-2">Found {usersData.pagination.total} {role}s</p>
          <div className="grid gap-2">
            {usersData.data.map((user: User) => (
              <div key={user.id} className="p-3 bg-gray-50 rounded">
                <p><strong>{user.discordUsername || user.username}</strong></p>
                <p className="text-sm text-gray-600">{user.username || 'No username'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Example: Search users
 */
interface UserSearchExampleProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

const UserSearchExample: React.FC<UserSearchExampleProps> = ({ searchTerm, onSearchTermChange }) => {
  const [filters, setFilters] = useState<Record<string, any>>({});
  
  const { data: searchResults, loading, error } = useUserSearch(
    searchTerm,
    { page: 1, limit: 10, filters },
    { immediate: false } // Only search when user types
  );

  return (
    <div className="p-4 rounded-lg border">
      <h2 className="mb-4 text-xl font-semibold">User Search</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search users by username, Discord username..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded border"
        />
      </div>
      
      {error && (
        <div className="mb-4 text-red-500">Error: {error}</div>
      )}
      
      {loading && (
        <div className="mb-4 text-blue-500">Searching...</div>
      )}
      
      {searchResults && searchTerm && (
        <div>
          <p className="mb-2">Found {searchResults.pagination.total} results</p>
          <div className="grid gap-2">
            {searchResults.data.map((user: User) => (
              <div key={user.id} className="p-3 bg-gray-50 rounded">
                <p><strong>{user.discordUsername || user.username}</strong> {user.isAdmin && '(Admin)'}</p>
                <p className="text-sm text-gray-600">{user.username || 'No username'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Example: Batch fetch users by IDs
 */
interface BatchUsersExampleProps {
  userIds: string[];
  onUserIdsChange: (ids: string[]) => void;
}

const BatchUsersExample: React.FC<BatchUsersExampleProps> = ({ userIds, onUserIdsChange }) => {
  const [inputIds, setInputIds] = useState('');
  
  const { data: users, loading, error, refresh } = useUsersByIds(
    userIds,
    false,
    { immediate: false }
  );

  const handleFetchUsers = () => {
    const ids = inputIds.split(',').map(id => id.trim()).filter(id => id);
    onUserIdsChange(ids);
    refresh();
  };

  return (
    <div className="p-4 rounded-lg border">
      <h2 className="mb-4 text-xl font-semibold">Batch Fetch Users</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter user IDs separated by commas..."
          value={inputIds}
          onChange={(e) => setInputIds(e.target.value)}
          className="flex-1 px-3 py-2 rounded border"
        />
        <button 
          onClick={handleFetchUsers}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          disabled={loading || !inputIds.trim()}
        >
          {loading ? 'Loading...' : 'Fetch Users'}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 text-red-500">Error: {error}</div>
      )}
      
      {users && users.length > 0 && (
        <div>
          <p className="mb-2">Fetched {users.length} users:</p>
          <div className="grid gap-2">
            {users.map((user: User) => (
              <div key={user.id} className="p-3 bg-gray-50 rounded">
                <p><strong>{user.discordUsername || user.username}</strong> {user.isAdmin && '(Admin)'}</p>
                <p className="text-sm text-gray-600">ID: {user.id}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDataExamples;

