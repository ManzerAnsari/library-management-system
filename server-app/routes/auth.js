const express = require('express');
const { login, refresh, logout, forgotPassword, resetPassword, requestRegisterOtp, verifyRegisterOtp, resendRegisterOtp } = require('../controllers/authController');
const { getProfile, updateProfile } = require('../controllers/userController');
const { validate } = require('../middleware/validate');
const { registerRequestSchema, registerVerifySchema, resendRegisterOtpSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validators/auth');
const { updateUserSchema } = require('../validators/user');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', validate(registerRequestSchema), requestRegisterOtp);
router.post('/register/resend', validate(resendRegisterOtpSchema), resendRegisterOtp);
router.post('/register/verify', validate(registerVerifySchema), verifyRegisterOtp);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// Current user endpoints
router.get('/me', authenticateToken, getProfile);
router.put('/me', authenticateToken, validate(updateUserSchema), updateProfile);

module.exports = router;