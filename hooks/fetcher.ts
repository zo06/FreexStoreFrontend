import { apiClient } from '@/lib/api';

// Generic fetcher function for SWR
const fetcher = async <T>(url: string): Promise<T> => {
  const response = await apiClient.get<T>(url);
  return response;
};

export default fetcher;
