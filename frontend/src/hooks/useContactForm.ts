/**
 * useContactForm Hook
 * Senior-level custom hook for managing contact form state and submission
 * Handles loading, error, and success states with proper cleanup
 */

import { useState, useCallback } from 'react';
import {
  submitContactForm,
  getErrorMessage,
  formatValidationErrors,
  type ContactFormData,
  type ApiError,
} from '../services/contactService';

export interface UseContactFormState {
  formData: ContactFormData;
  isSubmitting: boolean;
  submitSuccess: boolean;
  submitError: string | null;
  fieldErrors: Record<string, string>;
}

export interface UseContactFormActions {
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  resetForm: () => void;
  clearError: () => void;
  setFieldError: (field: string, error: string) => void;
}

const initialFormData: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

/**
 * Custom hook for contact form management
 * @param onSuccess - Optional callback when form submission succeeds
 * @returns Form state and action handlers
 */
export const useContactForm = (
  onSuccess?: (inquiryId?: number) => void
): UseContactFormState & UseContactFormActions => {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Timeout reference for success message cleanup
  let successTimeout: ReturnType<typeof setTimeout> | null = null;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));

      // Clear field error when user starts typing
      if (fieldErrors[name]) {
        setFieldErrors(prev => {
          const updated = { ...prev };
          delete updated[name];
          return updated;
        });
      }
    },
    [fieldErrors]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);
      setFieldErrors({});

      try {
        const response = await submitContactForm(formData);

        setSubmitSuccess(true);
        setFormData(initialFormData);

        // Call success callback
        onSuccess?.(response.inquiryId);

        // Auto-hide success message after 5 seconds
        successTimeout = setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      } catch (error) {
        const apiError = error as ApiError;

        // Handle validation errors
        if (apiError.details) {
          setFieldErrors(formatValidationErrors(apiError.details));
          setSubmitError('Please fix the validation errors below.');
        } else {
          setSubmitError(getErrorMessage(error));
        }

        console.error('Contact form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, onSuccess]
  );

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setSubmitSuccess(false);
    setSubmitError(null);
    setFieldErrors({});

    if (successTimeout) {
      clearTimeout(successTimeout);
      successTimeout = null;
    }
  }, []);

  const clearError = useCallback(() => {
    setSubmitError(null);
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  return {
    // State
    formData,
    isSubmitting,
    submitSuccess,
    submitError,
    fieldErrors,

    // Actions
    handleChange,
    handleSubmit,
    resetForm,
    clearError,
    setFieldError,
  };
};
