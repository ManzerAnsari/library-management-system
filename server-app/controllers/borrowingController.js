const asyncHandler = require('../middleware/asyncHandler');
const Borrowing = require('../models/Borrowing');
const Book = require('../models/Book');
const User = require('../models/User');

const BORROW_DAYS = parseInt(process.env.BORROW_DAYS || '14', 10);

function getBorrowingStatus(borrowing) {
  if (borrowing.returnedAt) return 'returned';
  return borrowing.dueDate < new Date() ? 'overdue' : 'active';
}

// Issue a book to a user (librarian/admin only; route enforces role)
const borrowBook = asyncHandler(async (req, res) => {
  const { bookId, userId: targetUserId } = req.body;

  const user = await User.findById(targetUserId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const book = await Book.findById(bookId);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  if (book.availableCopies < 1) return res.status(409).json({ error: 'No copies available to borrow' });

  const existing = await Borrowing.findActiveByBookAndUser(bookId, targetUserId);
  if (existing) return res.status(409).json({ error: 'User already has this book borrowed' });

  const dueDate = new Date(Date.now() + BORROW_DAYS * 24 * 60 * 60 * 1000);
  const borrowing = new Borrowing({
    book: bookId,
    user: targetUserId,
    dueDate
  });
  await borrowing.save();

  book.availableCopies -= 1;
  await book.save();

  const populated = await Borrowing.findById(borrowing._id).populate('book', 'title author isbn').populate('user', 'fullname email');
  const out = populated.toObject();
  out.status = getBorrowingStatus(populated);
  res.status(201).json({ borrowing: out });
});

// Mark a book as returned (librarian/admin only; route enforces role)
const returnBook = asyncHandler(async (req, res) => {
  const borrowingId = req.params.id;

  const borrowing = await Borrowing.findById(borrowingId).populate('book');
  if (!borrowing) return res.status(404).json({ error: 'Borrowing record not found' });
  if (borrowing.returnedAt) return res.status(400).json({ error: 'Book already returned' });

  borrowing.returnedAt = new Date();
  await borrowing.save();

  const book = await Book.findById(borrowing.book._id || borrowing.book);
  if (book) {
    book.availableCopies = Math.min(book.availableCopies + 1, book.copies);
    await book.save();
  }

  const populated = await Borrowing.findById(borrowing._id).populate('book', 'title author isbn').populate('user', 'fullname email');
  const out = populated.toObject();
  out.returnedAt = borrowing.returnedAt;
  out.status = 'returned';
  res.json({ borrowing: out });
});

// List borrowings: users see their own; librarians/admins see all with optional filters
const listBorrowings = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  const isLibrarian = ['admin', 'librarian'].includes(currentUser.role);

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const q = req.query.q ? String(req.query.q).trim() : null;
  const status = req.query.status ? String(req.query.status).trim().toLowerCase() : null;
  const userId = req.query.userId ? String(req.query.userId).trim() : null;
  const bookId = req.query.bookId ? String(req.query.bookId).trim() : null;
  const sort = req.query.sort ? String(req.query.sort).trim() : '-borrowedAt';

  const filter = {};
  if (!isLibrarian) {
    filter.user = currentUser.id;
  } else {
    if (userId) filter.user = userId;
    if (bookId) filter.book = bookId;
    if (q) {
      const bookIds = await Book.find({ title: { $regex: q, $options: 'i' } }).distinct('_id');
      const userIds = await User.find({
        $or: [
          { fullname: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } }
        ]
      }).distinct('_id');
      filter.$or = [
        { book: { $in: bookIds } },
        { user: { $in: userIds } }
      ];
    }
  }

  if (status === 'active') {
    filter.returnedAt = null;
    filter.dueDate = { $gte: new Date() };
  } else if (status === 'overdue') {
    filter.returnedAt = null;
    filter.dueDate = { $lt: new Date() };
  } else if (status === 'returned') {
    filter.returnedAt = { $ne: null };
  }

  const sortSpec = {};
  if (sort.startsWith('-')) {
    sortSpec[sort.slice(1)] = -1;
  } else if (sort.includes(':')) {
    const [field, dir] = sort.split(':');
    sortSpec[field] = dir === 'desc' ? -1 : 1;
  } else {
    sortSpec[sort] = 1;
  }

  const [borrowings, count] = await Promise.all([
    Borrowing.find(filter)
      .populate('book', 'title author isbn copies availableCopies')
      .populate('user', 'fullname email role')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sortSpec),
    Borrowing.countDocuments(filter)
  ]);

  const items = borrowings.map(b => {
    const obj = b.toObject();
    obj.status = getBorrowingStatus(b);
    return obj;
  });

  const totalPages = Math.max(Math.ceil(count / limit), 1);
  const meta = {
    total: count,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  };

  res.set('X-Total-Count', String(count));
  res.json({ borrowings: items, meta });
});

// Get one borrowing (owner or librarian)
const getBorrowing = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const currentUser = req.user;

  const borrowing = await Borrowing.findById(id)
    .populate('book', 'title author isbn copies availableCopies')
    .populate('user', 'fullname email role');
  if (!borrowing) return res.status(404).json({ error: 'Borrowing not found' });

  const isLibrarian = ['admin', 'librarian'].includes(currentUser.role);
  const borrowedBy = borrowing.user && borrowing.user._id ? borrowing.user._id : borrowing.user;
  const isOwner = String(borrowedBy) === String(currentUser.id);
  if (!isOwner && !isLibrarian) return res.status(403).json({ error: 'Forbidden' });

  const obj = borrowing.toObject();
  obj.status = getBorrowingStatus(borrowing);
  res.json({ borrowing: obj });
});

module.exports = { borrowBook, returnBook, listBorrowings, getBorrowing };
