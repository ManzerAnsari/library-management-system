const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  res.json({ message: 'Protected content', user: req.user });
});

router.get('/admin', authenticateToken, requireRole('admin'), (req, res) => {
  res.json({ message: 'Admin area' });
});

module.exports = router;