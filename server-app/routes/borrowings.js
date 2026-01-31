const express = require('express');
const { borrowBook, returnBook, listBorrowings, getBorrowing } = require('../controllers/borrowingController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { validate, validateQuery } = require('../middleware/validate');
const { borrowBodySchema, listBorrowingsQuerySchema } = require('../validators/borrowing');

const router = express.Router();

// Issue a book to a user (librarian/admin only; body: bookId, userId)
router.post('/', authenticateToken, requireRole('librarian', 'admin'), validate(borrowBodySchema), borrowBook);

// Mark a book as returned (librarian/admin only)
router.post('/:id/return', authenticateToken, requireRole('librarian', 'admin'), returnBook);

// List borrowings (user: own only; librarian/admin: all, optional status/userId/bookId)
router.get('/', authenticateToken, validateQuery(listBorrowingsQuerySchema), listBorrowings);

// Get one borrowing (owner or librarian)
router.get('/:id', authenticateToken, getBorrowing);

module.exports = router;
