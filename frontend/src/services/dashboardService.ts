/**
 * Dashboard Service
 * - Provides admin dashboard data summaries
 * - Requires admin token for protected endpoints
 */

import { getToken } from './authService';

export interface DashboardSummary {
  totalUsers: number;
  totalSales: number;
  totalOrders: number;
  productsInStock: number;
}

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

const baseUrl = import.meta.env.VITE_BASE_URL || '';

const authHeaders = (): Record<string, string> => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  const endpoint = `${baseUrl}/api/admin/dashboard/summary`;
  try {
    const res = await fetch(endpoint, { method: 'GET', headers: authHeaders() });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw { status: res.status, message: d.message || res.statusText } as ApiError;
    }
    const data = await res.json();
    return data as DashboardSummary;
  } catch (error) {
    if (error instanceof TypeError) throw { status: 0, message: 'Network error' } as ApiError;
    throw error;
  }
};

export const fetchRecentOrders = async (limit = 10): Promise<any[]> => {
  const endpoint = `${baseUrl}/api/admin/dashboard/recent-orders?limit=${encodeURIComponent(String(limit))}`;
  try {
    const res = await fetch(endpoint, { method: 'GET', headers: authHeaders() });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw { status: res.status, message: d.message || res.statusText } as ApiError;
    }
    return (await res.json()).orders || [];
  } catch (error) {
    if (error instanceof TypeError) throw { status: 0, message: 'Network error' } as ApiError;
    throw error;
  }
};

