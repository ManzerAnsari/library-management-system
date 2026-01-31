const { z } = require('zod');

const createBookSchema = z.object({
  title: z.string().min(1, 'title is required'),
  author: z.string().optional(),
  isbn: z.string().optional(),
  description: z.string().optional(),
  publisher: z.string().optional(),
  publishedDate: z.string().optional(), // ISO date string
  copies: z.number().int().min(0).optional(),
  tags: z.array(z.string()).optional()
});

const updateBookSchema = z.object({
  title: z.string().min(1).optional(),
  author: z.string().optional(),
  isbn: z.string().optional(),
  description: z.string().optional(),
  publisher: z.string().optional(),
  publishedDate: z.string().optional(),
  copies: z.number().int().min(0).optional(),
  tags: z.array(z.string()).optional()
});

const listBooksQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  q: z.string().optional(),
  tags: z.string().optional(),
  sort: z.string().optional()
});

module.exports = { createBookSchema, updateBookSchema, listBooksQuerySchema };