const { z } = require('zod');

const borrowBodySchema = z.object({
  bookId: z.string().min(1, 'bookId is required'),
  userId: z.string().min(1, 'userId is required') // librarian issues book to this user
});

const listBorrowingsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  q: z.string().optional(), // librarian: search by book title or borrower name/email
  status: z.enum(['active', 'overdue', 'returned']).optional(),
  userId: z.string().optional(),
  bookId: z.string().optional(),
  sort: z.string().optional()
});

module.exports = { borrowBodySchema, listBorrowingsQuerySchema };
