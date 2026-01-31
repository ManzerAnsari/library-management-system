const asyncHandler = require('../middleware/asyncHandler');
const Book = require('../models/Book');

// Create a book (librarian)
const createBook = asyncHandler(async (req, res) => {
  const {
    title,
    author,
    isbn,
    description,
    publisher,
    publishedDate,
    copies = 1,
    tags = []
  } = req.body;

  const existing = isbn ? await Book.findOne({ isbn }) : null;
  if (existing) return res.status(409).json({ error: 'Book with this ISBN already exists' });

  const book = new Book({
    title: String(title).trim(),
    author: author ? String(author).trim() : undefined,
    isbn: isbn ? String(isbn).trim() : undefined,
    description,
    publisher,
    publishedDate: publishedDate ? new Date(publishedDate) : undefined,
    copies,
    availableCopies: copies,
    tags,
    createdBy: req.user && req.user.id
  });

  await book.save();
  res.status(201).json({ book });
});

// List books with pagination and simple search
const listBooks = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const q = req.query.q ? String(req.query.q).trim() : null;
  const tags = req.query.tags ? String(req.query.tags).split(',').map(s => s.trim()).filter(Boolean) : [];
  const sort = req.query.sort ? String(req.query.sort).trim() : '-createdAt';

  const filter = {};
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { author: { $regex: q, $options: 'i' } },
      { isbn: { $regex: q, $options: 'i' } }
    ];
  }
  if (tags.length) filter.tags = { $in: tags };

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

  const [books, count] = await Promise.all([
    Book.find(filter).skip((page - 1) * limit).limit(limit).sort(sortSpec),
    Book.countDocuments(filter)
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
    // non-fatal: if building links fails, continue without Link header
    console.warn('Could not build pagination links', err);
  }

  res.json({ books, meta });
});

const getBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json({ book });
});

const updateBook = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const payload = { ...req.body };
  if (payload.publishedDate) payload.publishedDate = new Date(payload.publishedDate);

  const book = await Book.findById(id);
  if (!book) return res.status(404).json({ error: 'Book not found' });

  // Apply updates
  Object.keys(payload).forEach(k => { book[k] = payload[k]; });

  // If copies decreased below availableCopies, clamp availableCopies
  if (book.copies < book.availableCopies) book.availableCopies = Math.min(book.availableCopies, book.copies);

  await book.save();
  res.json({ book });
});

const deleteBook = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const book = await Book.findByIdAndDelete(id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json({ message: 'Book deleted' });
});

module.exports = { createBook, listBooks, getBook, updateBook, deleteBook };