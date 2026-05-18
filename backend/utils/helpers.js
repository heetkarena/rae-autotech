// const nodemailer = require("nodemailer")
// import nodemailer from "nodemailer"

// Validation functions
const validateContactForm = (data) => {
  const errors = []

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long")
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push("Valid email address is required")
  }

  if (!data.phone || data.phone.trim().length < 10) {
    errors.push("Valid phone number is required")
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.push("Message must be at least 10 characters long")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

const validateProduct = (data) => {
  const errors = []

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Product name must be at least 2 characters long")
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.push("Description must be at least 10 characters long")
  }

  if (!data.category || data.category.trim().length < 2) {
    errors.push("Category is required")
  }

  if (!data.type || !["battery", "inverter"].includes(data.type)) {
    errors.push('Type must be either "battery" or "inverter"')
  }

  if (!data.brand || data.brand.trim().length < 2) {
    errors.push("Brand is required")
  }

  if (data.price && (isNaN(data.price) || data.price < 0)) {
    errors.push("Price must be a valid positive number")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

const validateTestimonial = (data) => {
  const errors = []

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long")
  }

  if (!data.rating || data.rating < 1 || data.rating > 5) {
    errors.push("Rating must be between 1 and 5")
  }

  if (!data.text || data.text.trim().length < 10) {
    errors.push("Testimonial text must be at least 10 characters long")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Email notification function (optional)
const sendNotificationEmail = async (inquiryData) => {
  // Configure this based on your email service
  // For now, just log the inquiry
  console.log("📧 New inquiry received:", {
    id: inquiryData.inquiryId,
    name: inquiryData.name,
    email: inquiryData.email,
    subject: inquiryData.subject,
  })

  // Uncomment and configure for actual email sending
  /*
  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'admin@rameshwarautotech.com',
      subject: `New Inquiry: ${inquiryData.subject}`,
      html: `
        <h3>New Contact Inquiry</h3>
        <p><strong>Name:</strong> ${inquiryData.name}</p>
        <p><strong>Email:</strong> ${inquiryData.email}</p>
        <p><strong>Phone:</strong> ${inquiryData.phone}</p>
        <p><strong>Subject:</strong> ${inquiryData.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${inquiryData.message}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Notification email sent successfully');
  } catch (error) {
    console.error('Failed to send notification email:', error);
  }
  */
}

export {
  validateContactForm,
  validateProduct,
  validateTestimonial,
  isValidEmail,
  sendNotificationEmail,
}
