const express = require('express');
const { createLibrarian, createUser, deleteUser, listUsers, updateProfile, changePassword, getProfile } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { validate, validateQuery } = require('../middleware/validate');
const { createLibrarianSchema, createUserSchema, updateUserSchema, changePasswordSchema, listUsersQuerySchema } = require('../validators/user');

const router = express.Router();

// Admin-only: create librarian (kept for backward compatibility)
router.post('/librarian', authenticateToken, requireRole('admin'), validate(createLibrarianSchema), createLibrarian);
// Admin-only: create user with role (user or librarian)
router.post('/', authenticateToken, requireRole('admin'), validate(createUserSchema), createUser);
// Admin-only: delete user
router.delete('/:id', authenticateToken, requireRole('admin'), deleteUser);
// Admin & librarian: list users (librarian typically uses ?role=user for issuing books)
router.get('/', authenticateToken, requireRole('admin', 'librarian'), validateQuery(listUsersQuerySchema), listUsers);

// Authenticated user: get own profile
router.get('/me', authenticateToken, getProfile);
// Authenticated user: update own profile
router.put('/me', authenticateToken, validate(updateUserSchema), updateProfile);
// Change password
router.put('/me/password', authenticateToken, validate(changePasswordSchema), changePassword);

module.exports = router;