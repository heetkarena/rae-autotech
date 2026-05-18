/**
 * ContactSection Component (TypeScript)
 * Senior-level implementation with:
 * - TypeScript for type safety
 * - Service layer separation (contactService)
 * - Custom hook (useContactForm)
 * - Proper error handling and validation
 * - Accessibility features
 */

import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import { useContactForm } from '../hooks/useContactForm';

interface ContactInfoItem {
  icon: React.ReactNode;
  title: string;
  content: string;
}

interface BusinessHours {
  day: string;
  hours: string;
}

const ContactSection: React.FC = () => {
  const {
    formData,
    isSubmitting,
    submitSuccess,
    submitError,
    fieldErrors,
    handleChange,
    handleSubmit,
    clearError,
  } = useContactForm((inquiryId) => {
    console.log('Contact form submitted successfully. Inquiry ID:', inquiryId);
  });

  const contactInfo: ContactInfoItem[] = [
    {
      icon: <FaMapMarkerAlt className="text-blue-700" />,
      title: 'Our Location',
      content: 'Sumit Complex, Jamjodhpur',
    },
    {
      icon: <FaPhone className="text-blue-700" />,
      title: 'Phone Number',
      content: '+91 87587 92793',
    },
    {
      icon: <FaEnvelope className="text-blue-700" />,
      title: 'Email Address',
      content: 'info@rameshwarautotech.com',
    },
    {
      icon: <FaWhatsapp className="text-blue-700" />,
      title: 'WhatsApp Business',
      content: '+91 87587 92793',
    },
  ];

  const businessHours: BusinessHours[] = [
    { day: 'Monday - Saturday', hours: '9:00 AM - 7:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
  ];

  const getFieldErrorClass = (fieldName: string): string => {
    return fieldErrors[fieldName] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500';
  };

  return (
    <section id="contact" className="py-20 bg-gray-100 reveal">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 font-montserrat mb-4">
            Contact Us
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions or need assistance? Reach out to us and we'll get back to you shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">Send Us a Message</h3>

            {/* Success Message */}
            {submitSuccess && (
              <div
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6"
                role="alert"
              >
                ✓ Thank you for your message! We'll get back to you as soon as possible.
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex justify-between items-center"
                role="alert"
              >
                <span>⚠ {submitError}</span>
                <button
                  onClick={clearError}
                  className="text-red-700 hover:text-red-900 font-bold"
                  aria-label="Close error message"
                >
                  ✕
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Name and Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${getFieldErrorClass(
                      'name'
                    )}`}
                    placeholder="John Doe"
                    aria-invalid={!!fieldErrors.name}
                    aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                  />
                  {fieldErrors.name && (
                    <p id="name-error" className="text-red-500 text-sm mt-1">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${getFieldErrorClass(
                      'email'
                    )}`}
                    placeholder="john@example.com"
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  />
                  {fieldErrors.email && (
                    <p id="email-error" className="text-red-500 text-sm mt-1">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone and Subject Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${getFieldErrorClass(
                      'phone'
                    )}`}
                    placeholder="+91 97788 87799"
                    aria-invalid={!!fieldErrors.phone}
                    aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
                  />
                  {fieldErrors.phone && (
                    <p id="phone-error" className="text-red-500 text-sm mt-1">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                {/* Subject Field */}
                <div>
                  <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="E.g., Battery Inquiry"
                  />
                </div>
              </div>

              {/* Message Field */}
              <div className="mb-6">
                <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  rows={5}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${getFieldErrorClass(
                    'message'
                  )}`}
                  placeholder="How can we help you?"
                  aria-invalid={!!fieldErrors.message}
                  aria-describedby={fieldErrors.message ? 'message-error' : undefined}
                />
                {fieldErrors.message && (
                  <p id="message-error" className="text-red-500 text-sm mt-1">
                    {fieldErrors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || submitSuccess}
                className={`w-full py-3 px-8 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center ${
                  isSubmitting || submitSuccess
                    ? 'bg-gray-400 text-white cursor-not-allowed opacity-70'
                    : 'bg-blue-700 hover:bg-blue-800 text-white hover:shadow-lg'
                }`}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-6">Contact Information</h3>

              <div className="space-y-8 mb-10">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4 shrink-0">
                      {info.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-1">{info.title}</h4>
                      <p className="text-gray-600">{info.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Hours */}
            <div>
              <h4 className="font-bold text-gray-800 mb-4">Business Hours</h4>
              <div className="grid grid-cols-2 gap-y-2">
                {businessHours.map((item, index) => (
                  <React.Fragment key={index}>
                    <span className="text-gray-700">{item.day}:</span>
                    <span className="text-gray-600">{item.hours}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
