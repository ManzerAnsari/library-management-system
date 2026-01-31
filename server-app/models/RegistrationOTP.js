const mongoose = require('mongoose');
const crypto = require('crypto');

const registrationOtpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  fullname: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  mobileNumber: { type: String, trim: true },
  collegeUserId: { type: String, trim: true },
  codeHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 5 },
  expiresAt: { type: Date, required: true },
  usedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

registrationOtpSchema.statics.createOtp = async function (payload, minutes = 15) {
  const code = (Math.floor(100000 + Math.random() * 900000)).toString();
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  const expiresAt = new Date(Date.now() + minutes * 60 * 1000);
  const doc = await this.create(Object.assign({}, payload, { codeHash, expiresAt }));
  return { code, doc };
};

registrationOtpSchema.statics.findByEmailAndCode = function (email, code) {
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  return this.findOne({ email: email.toLowerCase().trim(), codeHash });
};

registrationOtpSchema.methods.isActive = function () {
  return !this.usedAt && this.expiresAt > new Date() && this.attempts < this.maxAttempts;
};

registrationOtpSchema.methods.registerAttempt = function () {
  this.attempts += 1;
  return this.save();
};

registrationOtpSchema.methods.markUsed = function () {
  this.usedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('RegistrationOTP', registrationOtpSchema);
