const mongoose = require('mongoose');
const crypto = require('crypto');

const refreshTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  revokedAt: Date,
  replacedByTokenHash: String
});

refreshTokenSchema.statics.createToken = async function (userId, days = 7) {
  const token = crypto.randomBytes(48).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const doc = await this.create({ user: userId, tokenHash, expiresAt });
  return { token, doc };
};

refreshTokenSchema.statics.findByToken = function (token) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return this.findOne({ tokenHash });
};

refreshTokenSchema.methods.isActive = function () {
  return !this.revokedAt && this.expiresAt > new Date();
};

refreshTokenSchema.methods.revoke = function () {
  this.revokedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);