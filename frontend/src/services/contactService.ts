/**
 * Contact Service
 * Handles all API communication for contact form submissions
 * Implements senior-level practices: typing, error handling, request validation, retry logic
 */

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
}

export interface ContactSubmitResponse {
  success: boolean;
  message: string;
  inquiryId?: number;
  error?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: ValidationError[];
}

// Request validation
const validateContactForm = (data: ContactFormData): { isValid: boolean; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  if (!data.phone || !isValidPhone(data.phone)) {
    errors.push({ field: 'phone', message: 'Please provide a valid phone number' });
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.push({ field: 'message', message: 'Message must be at least 10 characters long' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
  // Accepts common phone formats: +91 9876543210, 9876543210, +91-9876543210, etc.
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Retry mechanism for failed requests
const retryRequest = async <T,>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay * 2);
  }
};

/**
 * Submit contact form to backend
 * @param formData - Contact form data to submit
 * @returns Promise with response data
 */
export const submitContactForm = async (
  formData: ContactFormData
): Promise<ContactSubmitResponse> => {
  // Validate form data before sending
  const validation = validateContactForm(formData);
  if (!validation.isValid) {
    throw {
      status: 400,
      message: 'Validation failed',
      details: validation.errors,
    } as ApiError;
  }

  const baseUrl = import.meta.env.VITE_BASE_URL || '';
  const endpoint = `${baseUrl}/api/contact/submit`;

  try {
    const response = await retryRequest(
      () =>
        fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(formData),
        }),
      3
    );

    // Handle non-2xx status codes
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.error || `Server error: ${response.statusText}`,
        details: errorData.details,
      } as ApiError;
    }

    const data = await response.json();

    if (!data.success) {
      throw {
        status: 500,
        message: data.message || 'Failed to submit form',
      } as ApiError;
    }

    return data as ContactSubmitResponse;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError) {
      throw {
        status: 0,
        message: 'Network error. Please check your connection.',
      } as ApiError;
    }

    // Re-throw API errors
    if ('status' in (error as any)) {
      throw error;
    }

    // Handle unexpected errors
    throw {
      status: 500,
      message: 'An unexpected error occurred. Please try again.',
    } as ApiError;
  }
};

/**
 * Get human-readable error message for API error
 * @param error - API error object
 * @returns User-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Object && 'message' in error) {
    const apiError = error as ApiError;
    return apiError.message || 'Something went wrong. Please try again.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Format validation errors for display
 * @param details - Validation error details
 * @returns Object mapping field names to error messages
 */
export const formatValidationErrors = (
  details?: ValidationError[]
): Record<string, string> => {
  const formatted: Record<string, string> = {};

  if (Array.isArray(details)) {
    details.forEach(error => {
      formatted[error.field] = error.message;
    });
  }

  return formatted;
};
