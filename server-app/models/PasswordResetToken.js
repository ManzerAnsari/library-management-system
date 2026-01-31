const mongoose = require('mongoose');
const crypto = require('crypto');

const passwordResetTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  usedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

passwordResetTokenSchema.statics.createToken = async function (userId, hours = 1) {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  const doc = await this.create({ user: userId, tokenHash, expiresAt });
  return { token, doc };
};

passwordResetTokenSchema.statics.findByToken = function (token) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return this.findOne({ tokenHash });
};

passwordResetTokenSchema.methods.isActive = function () {
  return !this.usedAt && this.expiresAt > new Date();
};

passwordResetTokenSchema.methods.markUsed = function () {
  this.usedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);