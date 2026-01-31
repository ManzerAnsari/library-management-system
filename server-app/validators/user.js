const { z } = require('zod');

const createLibrarianSchema = z.object({
  fullname: z.string().min(2, 'Full name is required').trim(),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const updateUserSchema = z.object({
  fullname: z.string().min(2).optional(),
  email: z.string().email().optional(),
  mobileNumber: z.string().optional(),
  collegeUserId: z.string().optional()
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6)
});

const listUsersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  q: z.string().optional(),
  sort: z.string().optional(),
  role: z.enum(['user', 'librarian', 'admin']).optional()
});

// Admin: create user with role (user or librarian)
const createUserSchema = z.object({
  fullname: z.string().min(2, 'Full name is required').trim(),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'librarian'], { message: 'Role must be user or librarian' }),
  collegeUserId: z.string().trim().optional()
});

module.exports = { createLibrarianSchema, createUserSchema, updateUserSchema, changePasswordSchema, listUsersQuerySchema };
