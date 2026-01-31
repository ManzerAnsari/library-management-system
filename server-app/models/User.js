const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'librarian', 'user'], required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email address']
  },
  mobileNumber: { type: String, unique: true, sparse: true, trim: true },
  collegeUserId: { type: String, unique: true, sparse: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
