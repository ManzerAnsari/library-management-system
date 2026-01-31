const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Admin: create a librarian (librarians are created by admin, not self-registered)
const createLibrarian = asyncHandler(async (req, res) => {
  const { fullname, email, password } = req.body;
  const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (existing) return res.status(409).json({ error: 'User with this email already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const u = new User({
    fullname: String(fullname).trim(),
    email: String(email).toLowerCase().trim(),
    password: hashed,
    role: 'librarian'
  });
  await u.save();
  res.status(201).json({ message: 'Librarian created', userId: u._id });
});

// Admin: create user with role (user or librarian)
const createUser = asyncHandler(async (req, res) => {
  const { fullname, email, password, role, collegeUserId } = req.body;
  const emailNorm = String(email).toLowerCase().trim();
  const existing = await User.findOne({ email: emailNorm });
  if (existing) return res.status(409).json({ error: 'User with this email already exists' });
  const collegeId = collegeUserId ? String(collegeUserId).trim() : undefined;
  if (collegeId) {
    const existingId = await User.findOne({ collegeUserId: collegeId });
    if (existingId) return res.status(409).json({ error: 'College / Student ID already in use' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const u = new User({
    fullname: String(fullname).trim(),
    email: emailNorm,
    password: hashed,
    role: role === 'librarian' ? 'librarian' : 'user',
    ...(collegeId && { collegeUserId: collegeId })
  });
  await u.save();
  res.status(201).json({ message: 'User created', userId: u._id });
});

// Admin: delete user by id (cannot delete self)
const deleteUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const currentUserId = req.user && (req.user.id || req.user._id);
  if (targetId === currentUserId) return res.status(400).json({ error: 'You cannot delete your own account' });

  const user = await User.findByIdAndDelete(targetId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'User removed' });
});

const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const q = req.query.q ? String(req.query.q).trim() : null;
  const sort = req.query.sort ? String(req.query.sort).trim() : '-createdAt';
  const role = req.query.role ? String(req.query.role).trim() : null;

  const filter = {};
  if (role) filter.role = role;
  if (q) {
    filter.$or = [
      { fullname: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ];
  }

  // parse sort into mongoose-friendly spec
  const sortSpec = {};
  if (sort.startsWith('-')) {
    sortSpec[sort.slice(1)] = -1;
  } else if (sort.includes(':')) {
    const [field, dir] = sort.split(':');
    sortSpec[field] = dir === 'desc' ? -1 : 1;
  } else {
    sortSpec[sort] = 1;
  }

  const [users, count] = await Promise.all([
    User.find(filter).select('-password').skip((page - 1) * limit).limit(limit).sort(sortSpec),
    User.countDocuments(filter)
  ]);

  const totalPages = Math.max(Math.ceil(count / limit), 1);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  const meta = { total: count, page, limit, totalPages, hasNext, hasPrev, nextPage: hasNext ? page + 1 : null, prevPage: hasPrev ? page - 1 : null };

  // Pagination headers
  res.set('X-Total-Count', String(count));

  try {
    const base = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path === '/' ? '' : req.path}`;
    const buildLink = (p) => {
      const params = Object.assign({}, req.query, { page: String(p), limit: String(limit) });
      const qs = new URLSearchParams(params).toString();
      return `${base}?${qs}`;
    };

    const links = [];
    if (hasPrev) links.push(`<${buildLink(meta.prevPage)}>; rel="prev"`);
    links.push(`<${buildLink(1)}>; rel="first"`);
    if (hasNext) links.push(`<${buildLink(meta.nextPage)}>; rel="next"`);
    links.push(`<${buildLink(totalPages)}>; rel="last"`);
    res.set('Link', links.join(', '));
  } catch (err) {
    console.warn('Could not build pagination links', err);
  }

  res.json({ users, meta });
});

const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user && (req.user.id || req.user._id);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  let { fullname, email, mobileNumber, collegeUserId } = req.body;

  if (fullname) fullname = String(fullname).trim();
  if (email) email = String(email).toLowerCase().trim();
  if (mobileNumber) mobileNumber = String(mobileNumber).trim();
  if (collegeUserId) collegeUserId = String(collegeUserId).trim();

  const conditions = [];
  if (email) conditions.push({ email });
  if (mobileNumber) conditions.push({ mobileNumber });
  if (collegeUserId) conditions.push({ collegeUserId });

  if (conditions.length) {
    const existing = await User.findOne({ $or: conditions, _id: { $ne: userId } });
    if (existing) return res.status(409).json({ error: 'Conflicting user data' });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (fullname) user.fullname = fullname;
  if (email) user.email = email;
  if (mobileNumber !== undefined) user.mobileNumber = mobileNumber || undefined;
  if (collegeUserId !== undefined) user.collegeUserId = collegeUserId || undefined;

  await user.save();
  const out = user.toObject();
  delete out.password;
  res.json({ user: out });
});

const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user && (req.user.id || req.user._id);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return res.status(400).json({ error: 'Invalid current password' });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  // Revoke refresh tokens for safety
  const RefreshToken = require('../models/RefreshToken');
  await RefreshToken.updateMany({ user: userId, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });

  res.json({ message: 'Password changed' });
});

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user && (req.user.id || req.user._id);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const user = await User.findById(userId).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

module.exports = { createLibrarian, createUser, deleteUser, listUsers, updateProfile, changePassword, getProfile };