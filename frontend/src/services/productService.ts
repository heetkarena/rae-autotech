/**
 * Product Service
 * - Public product listing and details
 * - Admin create/update/delete operations use admin token from authService
 */

import { getToken } from './authService';

export interface Product {
  id?: number;
  name: string;
  slug?: string;
  price: number;
  description?: string;
  images?: string[];
  created_at?: string;
}

export interface ProductListResponse {
  success: boolean;
  products: Product[];
  total?: number;
}

export interface ProductResponse {
  success: boolean;
  product?: Product;
}

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

const baseUrl = import.meta.env.VITE_BASE_URL || '';

const retryRequest = async <T,>(fn: () => Promise<T>, retries = 2, delay = 800): Promise<T> => {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise(res => setTimeout(res, delay));
    return retryRequest(fn, retries - 1, delay * 2);
  }
};

export const fetchProducts = async (query = ''): Promise<ProductListResponse> => {
  const endpoint = `${baseUrl}/api/products${query ? `?${query}` : ''}`;
  try {
    const res = await retryRequest(() => fetch(endpoint, { method: 'GET' }));
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw { status: res.status, message: d.message || res.statusText } as ApiError;
    }
    return (await res.json()) as ProductListResponse;
  } catch (error) {
    if (error instanceof TypeError) throw { status: 0, message: 'Network error' } as ApiError;
    throw error;
  }
};

export const fetchProductById = async (id: number): Promise<ProductResponse> => {
  const endpoint = `${baseUrl}/api/products/${id}`;
  try {
    const res = await retryRequest(() => fetch(endpoint, { method: 'GET' }));
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw { status: res.status, message: d.message || res.statusText } as ApiError;
    }
    return (await res.json()) as ProductResponse;
  } catch (error) {
    if (error instanceof TypeError) throw { status: 0, message: 'Network error' } as ApiError;
    throw error;
  }
};

// Admin operations
const authHeaders = (): Record<string, string> => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const createProduct = async (product: Product): Promise<ProductResponse> => {
  const endpoint = `${baseUrl}/api/admin/products`;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw { status: res.status, message: d.message || res.statusText, details: d } as ApiError;
    }
    return (await res.json()) as ProductResponse;
  } catch (error) {
    if (error instanceof TypeError) throw { status: 0, message: 'Network error' } as ApiError;
    throw error;
  }
};

export const updateProduct = async (id: number, product: Partial<Product>): Promise<ProductResponse> => {
  const endpoint = `${baseUrl}/api/admin/products/${id}`;
  try {
    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw { status: res.status, message: d.message || res.statusText, details: d } as ApiError;
    }
    return (await res.json()) as ProductResponse;
  } catch (error) {
    if (error instanceof TypeError) throw { status: 0, message: 'Network error' } as ApiError;
    throw error;
  }
};

export const deleteProduct = async (id: number): Promise<{ success: boolean }> => {
  const endpoint = `${baseUrl}/api/admin/products/${id}`;
  try {
    const res = await fetch(endpoint, { method: 'DELETE', headers: authHeaders() });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw { status: res.status, message: d.message || res.statusText, details: d } as ApiError;
    }
    return await res.json();
  } catch (error) {
    if (error instanceof TypeError) throw { status: 0, message: 'Network error' } as ApiError;
    throw error;
  }
};

