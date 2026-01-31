const { z } = require('zod');

// Registration is for users (students) only; no role field
const registerRequestSchema = z.object({
  fullname: z.string().min(2, 'Full name must be at least 2 characters').trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  email: z.string().email('Invalid email address'),
  mobileNumber: z
    .string()
    .regex(/^[0-9+ \-()]{7,15}$/, 'Invalid mobile number')
    .optional()
    .or(z.literal('')),
  collegeUserId: z.string().min(1, 'Student ID is required').trim()
});

const registerVerifySchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().min(4)
});

const resendRegisterOtpSchema = z.object({
  email: z.string().email('Invalid email address')
});

const loginSchema = z.object({
  email: z.email('email is required'),
  password: z.string().min(1, 'password is required')
});

const forgotPasswordSchema = z.object({
  email: z.email('Invalid email address')
});

const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Invalid token'),
  password: z.string().min(6, 'password must be at least 6 characters')
});

module.exports = { registerRequestSchema, registerVerifySchema, resendRegisterOtpSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema };
