const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/protected', require('./protected'));
router.use('/users', require('./users'));
router.use('/books', require('./books'));
router.use('/borrowings', require('./borrowings'));

module.exports = router;