const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrowedAt: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

borrowingSchema.index({ book: 1, user: 1 });
borrowingSchema.index({ user: 1, returnedAt: 1 });
borrowingSchema.index({ dueDate: 1, returnedAt: 1 });

borrowingSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

// Virtual / helper: active = not yet returned
borrowingSchema.virtual('isActive').get(function () {
  return this.returnedAt == null;
});

// Don't allow duplicate active borrowings for same book+user
borrowingSchema.statics.findActiveByBookAndUser = function (bookId, userId) {
  return this.findOne({ book: bookId, user: userId, returnedAt: null });
};

module.exports = mongoose.model('Borrowing', borrowingSchema);
