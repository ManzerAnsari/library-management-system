const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const RegistrationOTP = require("../models/RegistrationOTP");
const PasswordResetToken = require("../models/PasswordResetToken");
const { sendMail } = require("../utils/email");

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET ||
  process.env.JWT_SECRET ||
  "change_this_secret";
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRES_DAYS = parseInt(
  process.env.REFRESH_TOKEN_EXPIRES_DAYS || "7",
  10,
);

function generateAccessToken(user) {
  return jwt.sign(
    { id: String(user._id), role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY },
  );
}

// Internal helper to create user from pre-hashed password (registration creates role 'user' only)
async function createUserFromData({ fullname, passwordHash, email, mobileNumber, collegeUserId }) {
  const user = new User({
    fullname: String(fullname).trim(),
    password: passwordHash,
    role: 'user',
    email: String(email).toLowerCase().trim(),
    mobileNumber: mobileNumber || undefined,
    collegeUserId: collegeUserId || undefined
  });
  await user.save();
  return user;
}

const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || "refreshToken";

function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.REFRESH_COOKIE_SAMESITE || "lax",
    maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    path: process.env.REFRESH_COOKIE_PATH || "/api/auth",
  };
}

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, getRefreshCookieOptions());
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    path: process.env.REFRESH_COOKIE_PATH || "/api/auth",
  });
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const emailValue = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: emailValue });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Create access token
    const accessToken = generateAccessToken(user);

    // Create refresh token (opaque, stored hashed in DB)
    const { token: refreshTokenPlain } = await RefreshToken.createToken(
      user._id,
      REFRESH_TOKEN_EXPIRES_DAYS,
    );
    setRefreshCookie(res, refreshTokenPlain);

    res.json({
      accessToken,
      user: {
        id: String(user._id),
        fullname: user.fullname,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Registration with OTP: for users (students) only
async function requestRegisterOtp(req, res) {
  try {
    const { fullname, password, email, mobileNumber, collegeUserId } = req.body;
    const emailValue = String(email).toLowerCase().trim();
    const fullnameValue = String(fullname).trim();
    const mobile = mobileNumber ? String(mobileNumber).trim() : undefined;
    const collegeId = collegeUserId ? String(collegeUserId).trim() : undefined;

    if (!fullnameValue) return res.status(400).json({ error: 'Full name is required' });

    const exists = await User.findOne({ email: emailValue });
    if (exists) return res.status(409).json({ error: 'Email already in use' });

    await RegistrationOTP.updateMany({ email: emailValue, usedAt: { $exists: false } }, { $set: { usedAt: new Date() } });

    const passwordHash = await bcrypt.hash(password, 10);
    const expiresMinutes = parseInt(process.env.REGISTRATION_OTP_EXPIRES_MINUTES || '15', 10);
    const { code } = await RegistrationOTP.createOtp(
      { email: emailValue, fullname: fullnameValue, passwordHash, mobileNumber: mobile, collegeUserId: collegeId },
      expiresMinutes
    );

    // send OTP to email
    const text = `Your verification code is: ${code}`;
    const html = `<p>Your verification code is: <strong>${code}</strong></p>`;
    await sendMail({ to: emailValue, subject: 'Your registration verification code', text, html });

    res.json({ message: 'Verification code sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function resendRegisterOtp(req, res) {
  try {
    const emailValue = String(req.body.email).toLowerCase().trim();

    const existing = await User.findOne({ email: emailValue });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const pending = await RegistrationOTP.findOne({
      email: emailValue,
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
      $expr: { $lt: ['$attempts', '$maxAttempts'] }
    });
    if (!pending) {
      return res.status(400).json({ error: 'No pending registration or code expired. Please start registration again.' });
    }

    await pending.markUsed();

    const expiresMinutes = parseInt(process.env.REGISTRATION_OTP_EXPIRES_MINUTES || '15', 10);
    const payload = {
      email: pending.email,
      fullname: pending.fullname,
      passwordHash: pending.passwordHash,
      mobileNumber: pending.mobileNumber,
      collegeUserId: pending.collegeUserId
    };
    const { code } = await RegistrationOTP.createOtp(payload, expiresMinutes);

    const text = `Your verification code is: ${code}`;
    const html = `<p>Your verification code is: <strong>${code}</strong></p>`;
    await sendMail({ to: emailValue, subject: 'Your registration verification code', text, html });

    res.json({ message: 'Verification code sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function verifyRegisterOtp(req, res) {
  try {
    const { email, code } = req.body;
    const stored = await RegistrationOTP.findByEmailAndCode(String(email).toLowerCase().trim(), String(code));
    if (!stored) {
      // if there's a doc for this email, increment attempts
      const byEmail = await RegistrationOTP.findOne({ email: String(email).toLowerCase().trim() });
      if (byEmail) {
        await byEmail.registerAttempt();
        if (!byEmail.isActive()) return res.status(400).json({ error: 'Code expired or max attempts reached' });
      }
      return res.status(400).json({ error: 'Invalid code' });
    }

    if (!stored.isActive()) return res.status(400).json({ error: 'Code expired or max attempts reached' });

    // check again if user exists (race condition)
    const existing = await User.findOne({ email: stored.email });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const user = await createUserFromData({
      fullname: stored.fullname,
      passwordHash: stored.passwordHash,
      email: stored.email,
      mobileNumber: stored.mobileNumber,
      collegeUserId: stored.collegeUserId
    });

    await RegistrationOTP.updateMany({ email: stored.email, usedAt: { $exists: false } }, { $set: { usedAt: new Date() } });

    const accessToken = generateAccessToken(user);
    const { token: refreshTokenPlain } = await RefreshToken.createToken(user._id, REFRESH_TOKEN_EXPIRES_DAYS);
    setRefreshCookie(res, refreshTokenPlain);

    res.status(201).json({ accessToken, user: { id: user._id, fullname: user.fullname, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) return res.status(409).json({ error: 'Duplicate field value' });
    res.status(500).json({ error: 'Server error' });
  }
} 

// Forgot / Reset password
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const emailValue = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: emailValue });

    // Respond success even if user not found to avoid enumeration
    if (!user) return res.json({ message: 'If the email exists, a reset link has been sent.' });

    const { token: resetPlain } = await require('../models/PasswordResetToken').createToken(user._id, parseInt(process.env.RESET_TOKEN_EXPIRES_HOURS || '1', 10));

    // send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetPlain}`;
    await sendMail({
      to: user.email,
      subject: 'Password reset',
      text: `Use this link to reset your password: ${resetUrl}`,
      html: `<p>Use this link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`
    });

    res.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    const PasswordResetToken = require('../models/PasswordResetToken');

    const stored = await PasswordResetToken.findByToken(token);
    if (!stored || !stored.isActive()) return res.status(400).json({ error: 'Invalid or expired token' });

    const user = await User.findById(stored.user);
    if (!user) return res.status(400).json({ error: 'User not found' });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    // mark token used and revoke all refresh tokens
    await stored.markUsed();
    await RefreshToken.updateMany({ user: user._id, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });
    clearRefreshCookie(res);

    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function refresh(req, res) {
  try {
    const refreshTokenPlain = req.cookies && req.cookies[REFRESH_COOKIE_NAME];
    if (!refreshTokenPlain)
      return res.status(401).json({ error: "Missing refresh token" });

    const stored = await RefreshToken.findByToken(refreshTokenPlain);
    if (!stored || !stored.isActive())
      return res
        .status(401)
        .json({ error: "Invalid or expired refresh token" });

    // rotate refresh token
    stored.revokedAt = new Date();
    const { token: newRefreshPlain } =
      await RefreshToken.createToken(stored.user, REFRESH_TOKEN_EXPIRES_DAYS);
    stored.replacedByTokenHash = crypto
      .createHash("sha256")
      .update(newRefreshPlain)
      .digest("hex");
    await stored.save();

    setRefreshCookie(res, newRefreshPlain);

    const user = await User.findById(stored.user);
    if (!user)
      return res.status(401).json({ error: "User not found for token" });

    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

async function logout(req, res) {
  try {
    const refreshTokenPlain = req.cookies && req.cookies[REFRESH_COOKIE_NAME];
    if (refreshTokenPlain) {
      const stored = await RefreshToken.findByToken(refreshTokenPlain);
      if (stored) await stored.revoke();
    }
    clearRefreshCookie(res);
    res.json({ message: "Logged out" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

async function revokeAllRefreshTokens(req, res) {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    await RefreshToken.updateMany(
      { user: userId, revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date() } },
    );
    clearRefreshCookie(res);
    res.json({ message: "All refresh tokens revoked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { login, refresh, logout, revokeAllRefreshTokens, forgotPassword, resetPassword, requestRegisterOtp, resendRegisterOtp, verifyRegisterOtp };
