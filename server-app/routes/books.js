const express = require('express');
const { createBook, listBooks, getBook, updateBook, deleteBook } = require('../controllers/bookController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { validate, validateQuery } = require('../middleware/validate');
const { createBookSchema, updateBookSchema, listBooksQuerySchema } = require('../validators/book');

const router = express.Router();

router.post('/', authenticateToken, requireRole('librarian', 'admin'), validate(createBookSchema), createBook);
router.get('/', authenticateToken, validateQuery(listBooksQuerySchema), listBooks);
router.get('/:id', authenticateToken, getBook);
router.put('/:id', authenticateToken, requireRole('librarian', 'admin'), validate(updateBookSchema), updateBook);
router.delete('/:id', authenticateToken, requireRole('librarian', 'admin'), deleteBook);

module.exports = router;