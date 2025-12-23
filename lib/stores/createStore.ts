/**
 * Zustand Store Factory
 * Creates standardized stores with common actions
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import apiClient from '../api/client';

// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

// Store state interface
export interface EntityState<T extends BaseEntity> {
  // Data
  items: T[];
  currentItem: T | null;
  
  // Loading states
  loading: boolean;
  loadingItem: boolean;
  submitting: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  getAll: () => Promise<T[]>;
  getById: (id: string) => Promise<T | null>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  patch: (id: string, data: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
  
  // State management
  setItems: (items: T[]) => void;
  setCurrentItem: (item: T | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

// Store options
export interface StoreOptions {
  name: string;
  endpoint: string;
  persistData?: boolean;
}

// Create entity store factory
export function createEntityStore<T extends BaseEntity>(options: StoreOptions) {
  const { name, endpoint, persistData = false } = options;

  const initialState = {
    items: [] as T[],
    currentItem: null as T | null,
    loading: false,
    loadingItem: false,
    submitting: false,
    error: null as string | null,
  };

  const storeConfig = (set: any, get: any) => ({
    ...initialState,

    // Get all items
    getAll: async (): Promise<T[]> => {
      set({ loading: true, error: null });
      try {
        const data = await apiClient.get<T[]>(endpoint);
        const items = Array.isArray(data) ? data : [];
        set({ items, loading: false });
        return items;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to fetch items';
        set({ error: errorMessage, loading: false });
        throw error;
      }
    },

    // Get single item by ID
    getById: async (id: string): Promise<T | null> => {
      set({ loadingItem: true, error: null });
      try {
        const item = await apiClient.get<T>(`${endpoint}/${id}`);
        set({ currentItem: item, loadingItem: false });
        return item;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to fetch item';
        set({ error: errorMessage, loadingItem: false });
        throw error;
      }
    },

    // Create new item
    create: async (data: Partial<T>): Promise<T> => {
      set({ submitting: true, error: null });
      try {
        const item = await apiClient.post<T>(endpoint, data);
        const currentItems = get().items;
        set({ items: [item, ...currentItems], submitting: false });
        return item;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to create item';
        set({ error: errorMessage, submitting: false });
        throw error;
      }
    },

    // Update item (PUT)
    update: async (id: string, data: Partial<T>): Promise<T> => {
      set({ submitting: true, error: null });
      try {
        const item = await apiClient.put<T>(`${endpoint}/${id}`, data);
        const currentItems = get().items;
        const currentItem = get().currentItem;
        set({
          items: currentItems.map((i: T) => (i.id === id ? item : i)),
          currentItem: currentItem?.id === id ? item : currentItem,
          submitting: false,
        });
        return item;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to update item';
        set({ error: errorMessage, submitting: false });
        throw error;
      }
    },

    // Patch item (PATCH)
    patch: async (id: string, data: Partial<T>): Promise<T> => {
      set({ submitting: true, error: null });
      try {
        const item = await apiClient.patch<T>(`${endpoint}/${id}`, data);
        const currentItems = get().items;
        const currentItem = get().currentItem;
        set({
          items: currentItems.map((i: T) => (i.id === id ? item : i)),
          currentItem: currentItem?.id === id ? item : currentItem,
          submitting: false,
        });
        return item;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to patch item';
        set({ error: errorMessage, submitting: false });
        throw error;
      }
    },

    // Delete item
    remove: async (id: string): Promise<void> => {
      set({ submitting: true, error: null });
      try {
        await apiClient.delete(`${endpoint}/${id}`);
        const currentItems = get().items;
        const currentItem = get().currentItem;
        set({
          items: currentItems.filter((i: T) => i.id !== id),
          currentItem: currentItem?.id === id ? null : currentItem,
          submitting: false,
        });
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to delete item';
        set({ error: errorMessage, submitting: false });
        throw error;
      }
    },

    // State setters
    setItems: (items: T[]) => set({ items }),
    setCurrentItem: (item: T | null) => set({ currentItem: item }),
    setLoading: (loading: boolean) => set({ loading }),
    setError: (error: string | null) => set({ error }),
    clearError: () => set({ error: null }),
    reset: () => set(initialState),
  });

  if (persistData) {
    return create<EntityState<T>>()(
      devtools(
        persist(storeConfig, {
          name: `${name}-storage`,
          partialize: (state) => ({
            items: state.items,
            currentItem: state.currentItem,
          }),
        }),
        { name }
      )
    );
  }

  return create<EntityState<T>>()(
    devtools(storeConfig, { name })
  );
}

export default createEntityStore;

