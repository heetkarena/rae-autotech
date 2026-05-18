/**
 * Auth Service - Example Pattern for Neon Data Fetching
 * This shows how to communicate with backend API to fetch/send data to Neon
 * 
 * When user logs in:
 * Frontend (this service) → Backend (Express) → Neon Postgres
 * 
 * When admin views dashboard:
 * Frontend → Backend queries Neon → Returns data → Frontend displays
 */

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
  error?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
}

/**
 * LOGIN FLOW (Saves to Neon)
 * 
 * 1. User enters username/password
 * 2. Frontend sends POST /api/admin/login
 * 3. Backend queries Neon: SELECT * FROM admin_users WHERE username = $1
 * 4. Backend compares password hash
 * 5. Backend generates JWT token
 * 6. Frontend stores token in localStorage
 * 7. Token used in Authorization header for future requests
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const baseUrl = import.meta.env.VITE_BASE_URL || '';
  
  try {
    const response = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    
    // Store token in sessionStorage for per-tab storage (cleared on tab close)
    if (data.token) {
      sessionStorage.setItem('adminToken', data.token);
      // Do NOT persist user info in browser storage for security
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * VERIFY TOKEN FLOW (Checks Neon)
 * 
 * When user refreshes page or opens admin dashboard:
 * 1. Check if token exists in localStorage
 * 2. Send GET /api/admin/verify with token
 * 3. Backend verifies token and checks if user exists in Neon
 * 4. Return user data or 401 Unauthorized
 */
export const verifyToken = async (token: string): Promise<User | null> => {
  const baseUrl = import.meta.env.VITE_BASE_URL || '';
  
  try {
    const response = await fetch(`${baseUrl}/api/admin/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Token invalid or expired
      sessionStorage.removeItem('adminToken');
      return null;
    }

    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

/**
 * LOGOUT FLOW (Invalidates session in Neon)
 * 
 * When user clicks logout:
 * 1. Send POST /api/admin/logout with token
 * 2. Backend marks session/token as invalid in Neon
 * 3. Frontend clears localStorage
 * 4. Redirect to login page
 */
export const logout = async (token: string): Promise<void> => {
  const baseUrl = import.meta.env.VITE_BASE_URL || '';
  
  try {
    await fetch(`${baseUrl}/api/admin/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear session storage regardless of server response
    sessionStorage.removeItem('adminToken');
  }
};

/**
 * GET STORED TOKEN
 */
export const getToken = (): string | null => {
  return sessionStorage.getItem('adminToken');
};

/**
 * GET STORED USER
 */
export const getStoredUser = (): User | null => {
  // For security, user info is not persisted in browser storage. Derive from token if needed.
  return null;
};

/**
 * ERROR MESSAGE FORMATTER
 */
export const getAuthErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Authentication error. Please try again.';
};
