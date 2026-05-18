/**
 * Testimonial Service
 * - Fetches testimonials for public pages
 * - Submits new testimonials (with validation)
 * - Basic retry and rich error typing like contactService
 */

export interface Testimonial {
  id?: number;
  name: string;
  message: string;
  rating?: number; // 1-5
  created_at?: string;
}

export interface TestimonialListResponse {
  success: boolean;
  testimonials: Testimonial[];
}

export interface SubmitResponse {
  success: boolean;
  message?: string;
  id?: number;
}

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

const baseUrl = import.meta.env.VITE_BASE_URL || '';

const isValidRating = (r?: number) => typeof r === 'number' && r >= 1 && r <= 5;

const validateTestimonial = (t: Testimonial) => {
  const errors: Record<string, string> = {};
  if (!t.name || t.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!t.message || t.message.trim().length < 10) errors.message = 'Message must be at least 10 characters';
  if (t.rating !== undefined && !isValidRating(t.rating)) errors.rating = 'Rating must be between 1 and 5';
  return errors;
};

const retryRequest = async <T,>(fn: () => Promise<T>, retries = 2, delay = 800): Promise<T> => {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise(res => setTimeout(res, delay));
    return retryRequest(fn, retries - 1, delay * 2);
  }
};

export const fetchTestimonials = async (): Promise<TestimonialListResponse> => {
  const endpoint = `${baseUrl}/api/testimonials`;
  try {
    const res = await retryRequest(() => fetch(endpoint, { method: 'GET' }));
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { status: res.status, message: errorData.message || res.statusText } as ApiError;
    }
    return (await res.json()) as TestimonialListResponse;
  } catch (error) {
    if (error instanceof TypeError) throw { status: 0, message: 'Network error' } as ApiError;
    throw error;
  }
};

export const submitTestimonial = async (payload: Testimonial): Promise<SubmitResponse> => {
  const validation = validateTestimonial(payload);
  if (Object.keys(validation).length > 0) {
    throw { status: 400, message: 'Validation failed', details: validation } as ApiError;
  }

  const endpoint = `${baseUrl}/api/testimonials/submit`;

  try {
    const res = await retryRequest(() =>
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { status: res.status, message: errorData.message || res.statusText, details: errorData } as ApiError;
    }

    return (await res.json()) as SubmitResponse;
  } catch (error) {
    if (error instanceof TypeError) throw { status: 0, message: 'Network error' } as ApiError;
    throw error;
  }
};

