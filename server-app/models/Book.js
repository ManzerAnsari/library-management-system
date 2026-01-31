const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, trim: true },
  isbn: { type: String, unique: true, sparse: true, trim: true },
  description: { type: String, trim: true },
  publisher: { type: String, trim: true },
  publishedDate: Date,
  copies: { type: Number, default: 1, min: 0 },
  availableCopies: { type: Number, default: 1, min: 0 },
  tags: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

bookSchema.pre('save', function () {
  this.updatedAt = Date.now();
  if (this.isModified('copies') && (this.availableCopies == null || this.availableCopies > this.copies)) {
    this.availableCopies = Math.min(this.availableCopies || this.copies, this.copies);
  }
});

module.exports = mongoose.model('Book', bookSchema);