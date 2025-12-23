/**
 * Zustand Stores - Central Export
 * All entity stores for the application
 */

import { createEntityStore, BaseEntity, EntityState } from './createStore';

// ============================================
// Entity Types
// ============================================

export interface Developer extends BaseEntity {
  name: string;
  email?: string;
  website?: string;
  bio?: string;
  avatarUrl?: string;
  isActive: boolean;
  scripts?: any[];
}

export interface Category extends BaseEntity {
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
}

export interface User extends BaseEntity {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  isAdmin: boolean;
  role: string;
  discordId?: string;
  discordUsername?: string;
  discordAvatar?: string;
  lastLoginAt?: string;
}

export interface Script extends BaseEntity {
  name: string;
  description: string;
  price: number;
  version?: string;
  scriptUUID?: string;
  isActive: boolean;
  popular: boolean;
  new: boolean;
  licenseType: string;
  imageUrl?: string;
  imageUrls?: string[];
  youtubeUrl?: string;
  downloadUrl?: string;
  features?: string;
  requirements?: string;
  categoryId?: string;
  category?: Category;
  developers?: Developer[] | string[];
}

export interface License extends BaseEntity {
  userId: string;
  scriptId: string;
  publicKey: string;
  privateKey?: string;
  ipAddress?: string;
  isActive: boolean;
  isRevoked: boolean;
  expiresAt?: string;
  user?: User;
  script?: Script;
}

export interface Transaction extends BaseEntity {
  userId: string;
  scriptId: string;
  orderId?: string;
  paymentId?: string;
  amount: number;
  currency?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  provider?: 'paypal' | 'stripe' | 'manual';
  type?: 'purchase' | 'refund' | 'subscription' | 'renewal';
  description?: string;
  payerEmail?: string;
  payerName?: string;
  developerName?: string;
  developerId?: string;
  user?: User;
  script?: Script;
}

// ============================================
// Store Instances
// ============================================

// Developers Store
export const useDevelopersStore = createEntityStore<Developer>({
  name: 'developers',
  endpoint: '/admin/developers',
});

// Categories Store
export const useCategoriesStore = createEntityStore<Category>({
  name: 'categories',
  endpoint: '/admin/categories',
});

// Users Store
export const useUsersStore = createEntityStore<User>({
  name: 'users',
  endpoint: '/admin/users',
});

// Scripts Store
export const useScriptsStore = createEntityStore<Script>({
  name: 'scripts',
  endpoint: '/admin/scripts',
});

// Licenses Store
export const useLicensesStore = createEntityStore<License>({
  name: 'licenses',
  endpoint: '/admin/licenses',
});

// Transactions Store
export const useTransactionsStore = createEntityStore<Transaction>({
  name: 'transactions',
  endpoint: '/admin/transactions',
});

// ============================================
// Re-exports
// ============================================

export { createEntityStore };
export type { BaseEntity, EntityState };

