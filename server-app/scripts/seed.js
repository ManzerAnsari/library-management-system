/**
 * Seed script: creates admin, librarian(s), and 50+ books.
 * Run: npm run seed (from server-app directory)
 * Requires: MongoDB running, MONGO_URI in .env
 *
 * Default credentials (change after first login in production):
 *   Admin:    admin@library.local / Password123!
 *   Librarian: librarian@library.local / Password123!
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Book = require('../models/Book');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/library';
const DEFAULT_PASSWORD = 'Password123!';

const seedUsers = [
  {
    fullname: 'Library Admin',
    email: 'admin@library.local',
    password: DEFAULT_PASSWORD,
    role: 'admin',
    collegeUserId: 'ADMIN-001',
  },
  {
    fullname: 'Jane Librarian',
    email: 'librarian@library.local',
    password: DEFAULT_PASSWORD,
    role: 'librarian',
    collegeUserId: 'LIB-001',
  },
  {
    fullname: 'John Librarian',
    email: 'librarian2@library.local',
    password: DEFAULT_PASSWORD,
    role: 'librarian',
    collegeUserId: 'LIB-002',
  },
];

const seedBooks = [
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0-06-112008-4', tags: ['fiction', 'classic'] },
  { title: '1984', author: 'George Orwell', isbn: '978-0-452-28423-4', tags: ['fiction', 'dystopia'] },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0-7432-7356-5', tags: ['fiction', 'classic'] },
  { title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '978-0-14-143951-8', tags: ['fiction', 'romance'] },
  { title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '978-0-316-76948-0', tags: ['fiction', 'classic'] },
  { title: 'Harry Potter and the Philosopher\'s Stone', author: 'J.K. Rowling', isbn: '978-0-7475-3269-9', tags: ['fiction', 'fantasy'] },
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '978-0-547-92822-7', tags: ['fiction', 'fantasy'] },
  { title: 'Fahrenheit 451', author: 'Ray Bradbury', isbn: '978-0-7432-4722-1', tags: ['fiction', 'dystopia'] },
  { title: 'Jane Eyre', author: 'Charlotte Brontë', isbn: '978-0-14-144114-6', tags: ['fiction', 'classic'] },
  { title: 'Animal Farm', author: 'George Orwell', isbn: '978-0-452-28424-1', tags: ['fiction', 'allegory'] },
  { title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', isbn: '978-0-544-00014-9', tags: ['fiction', 'fantasy'] },
  { title: 'Wuthering Heights', author: 'Emily Brontë', isbn: '978-0-14-143955-6', tags: ['fiction', 'classic'] },
  { title: 'Brave New World', author: 'Aldous Huxley', isbn: '978-0-06-085052-4', tags: ['fiction', 'dystopia'] },
  { title: 'The Chronicles of Narnia', author: 'C.S. Lewis', isbn: '978-0-06-623850-0', tags: ['fiction', 'fantasy'] },
  { title: 'Murder on the Orient Express', author: 'Agatha Christie', isbn: '978-0-06-269366-2', tags: ['fiction', 'mystery'] },
  { title: 'The Alchemist', author: 'Paulo Coelho', isbn: '978-0-06-231500-7', tags: ['fiction', 'philosophy'] },
  { title: 'One Hundred Years of Solitude', author: 'Gabriel García Márquez', isbn: '978-0-06-088328-7', tags: ['fiction', 'magical realism'] },
  { title: 'The Da Vinci Code', author: 'Dan Brown', isbn: '978-0-385-50420-5', tags: ['fiction', 'thriller'] },
  { title: 'The Kite Runner', author: 'Khaled Hosseini', isbn: '978-1-59448-000-3', tags: ['fiction', 'drama'] },
  { title: 'Slaughterhouse-Five', author: 'Kurt Vonnegut', isbn: '978-0-385-33384-9', tags: ['fiction', 'satire'] },
  { title: 'The Book Thief', author: 'Markus Zusak', isbn: '978-0-375-83100-3', tags: ['fiction', 'historical'] },
  { title: 'Gone Girl', author: 'Gillian Flynn', isbn: '978-0-307-58836-4', tags: ['fiction', 'thriller'] },
  { title: 'The Hunger Games', author: 'Suzanne Collins', isbn: '978-0-439-02352-8', tags: ['fiction', 'dystopia'] },
  { title: 'The Fault in Our Stars', author: 'John Green', isbn: '978-0-525-47881-2', tags: ['fiction', 'romance'] },
  { title: 'Educated', author: 'Tara Westover', isbn: '978-0-399-59050-4', tags: ['non-fiction', 'memoir'] },
  { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '978-0-06-231609-7', tags: ['non-fiction', 'history'] },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '978-0-374-27563-1', tags: ['non-fiction', 'psychology'] },
  { title: 'The Lean Startup', author: 'Eric Ries', isbn: '978-0-307-88791-7', tags: ['non-fiction', 'business'] },
  { title: 'Atomic Habits', author: 'James Clear', isbn: '978-0-7352-1128-2', tags: ['non-fiction', 'self-help'] },
  { title: 'Deep Work', author: 'Cal Newport', isbn: '978-1-4555-6049-1', tags: ['non-fiction', 'productivity'] },
  { title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0-13-235088-4', tags: ['technology', 'programming'] },
  { title: 'The Pragmatic Programmer', author: 'David Thomas, Andrew Hunt', isbn: '978-0-13-595705-9', tags: ['technology', 'programming'] },
  { title: 'Design Patterns', author: 'Gang of Four', isbn: '978-0-201-63361-0', tags: ['technology', 'programming'] },
  { title: 'Introduction to Algorithms', author: 'CLRS', isbn: '978-0-262-03384-8', tags: ['technology', 'algorithms'] },
  { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', isbn: '978-0-596-51774-8', tags: ['technology', 'javascript'] },
  { title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', isbn: '978-1-59327-584-6', tags: ['technology', 'javascript'] },
  { title: 'You Don\'t Know JS', author: 'Kyle Simpson', isbn: '978-1-4919-0292-4', tags: ['technology', 'javascript'] },
  { title: 'React in Action', author: 'Mark Tielens Thomas', isbn: '978-1-61729-385-6', tags: ['technology', 'react'] },
  { title: 'Node.js Design Patterns', author: 'Mario Casciaro', isbn: '978-1-78588-558-7', tags: ['technology', 'nodejs'] },
  { title: 'MongoDB: The Definitive Guide', author: 'Kristina Chodorow', isbn: '978-1-4919-3242-6', tags: ['technology', 'database'] },
  { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '978-0-553-10953-5', tags: ['non-fiction', 'science'] },
  { title: 'Cosmos', author: 'Carl Sagan', isbn: '978-0-345-30343-1', tags: ['non-fiction', 'science'] },
  { title: 'The Selfish Gene', author: 'Richard Dawkins', isbn: '978-0-19-286092-7', tags: ['non-fiction', 'science'] },
  { title: 'Silent Spring', author: 'Rachel Carson', isbn: '978-0-618-24906-0', tags: ['non-fiction', 'environment'] },
  { title: 'The Art of War', author: 'Sun Tzu', isbn: '978-1-78404-562-2', tags: ['non-fiction', 'strategy'] },
  { title: 'Meditations', author: 'Marcus Aurelius', isbn: '978-0-14-044933-4', tags: ['philosophy', 'stoicism'] },
  { title: 'The Republic', author: 'Plato', isbn: '978-0-14-044914-3', tags: ['philosophy', 'classic'] },
  { title: 'Thus Spoke Zarathustra', author: 'Friedrich Nietzsche', isbn: '978-0-14-044118-5', tags: ['philosophy'] },
  { title: 'The Little Prince', author: 'Antoine de Saint-Exupéry', isbn: '978-0-15-601219-5', tags: ['fiction', 'children'] },
  { title: 'Charlotte\'s Web', author: 'E.B. White', isbn: '978-0-06-440055-8', tags: ['fiction', 'children'] },
  { title: 'The Giving Tree', author: 'Shel Silverstein', isbn: '978-0-06-025665-4', tags: ['fiction', 'children'] },
  { title: 'Where the Wild Things Are', author: 'Maurice Sendak', isbn: '978-0-06-025492-6', tags: ['fiction', 'children'] },
  { title: 'Goodnight Moon', author: 'Margaret Wise Brown', isbn: '978-0-06-443017-3', tags: ['fiction', 'children'] },
  { title: 'The Very Hungry Caterpillar', author: 'Eric Carle', isbn: '978-0-399-22690-8', tags: ['fiction', 'children'] },
  { title: 'Matilda', author: 'Roald Dahl', isbn: '978-0-14-136546-6', tags: ['fiction', 'children'] },
  { title: 'The Secret Garden', author: 'Frances Hodgson Burnett', isbn: '978-0-14-243704-9', tags: ['fiction', 'children'] },
  { title: 'Anne of Green Gables', author: 'L.M. Montgomery', isbn: '978-0-14-751400-4', tags: ['fiction', 'children'] },
];

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.');

  // Drop legacy username index if present (schema now uses fullname, not username)
  try {
    await User.collection.dropIndex('username_1');
    console.log('Dropped legacy username_1 index.');
  } catch (e) {
    if (e.code !== 27 && e.codeName !== 'IndexNotFound') console.warn('Index drop:', e.message);
  }

  const createdIds = { adminId: null, librarianId: null };

  for (const u of seedUsers) {
    const existing = await User.findOne({ email: u.email.toLowerCase() });
    if (existing) {
      console.log(`User already exists: ${u.email} (${u.role})`);
      if (u.role === 'admin') createdIds.adminId = existing._id;
      if (u.role === 'librarian' && !createdIds.librarianId) createdIds.librarianId = existing._id;
      continue;
    }
    const hash = await bcrypt.hash(u.password, 10);
    const user = await User.create({
      fullname: u.fullname,
      email: u.email.toLowerCase(),
      password: hash,
      role: u.role,
      collegeUserId: u.collegeUserId,
    });
    console.log(`Created ${u.role}: ${u.email}`);
    if (u.role === 'admin') createdIds.adminId = user._id;
    if (u.role === 'librarian' && !createdIds.librarianId) createdIds.librarianId = user._id;
  }

  const createdBy = createdIds.adminId || createdIds.librarianId;
  if (!createdBy) {
    const anyAdmin = await User.findOne({ role: 'admin' });
    const anyLib = await User.findOne({ role: 'librarian' });
    createdBy = anyAdmin?._id || anyLib?._id;
  }

  let inserted = 0;
  let skipped = 0;
  for (const b of seedBooks) {
    const exists = await Book.findOne({ isbn: b.isbn });
    if (exists) {
      skipped++;
      continue;
    }
    await Book.create({
      title: b.title,
      author: b.author,
      isbn: b.isbn,
      tags: b.tags || [],
      copies: 2,
      availableCopies: 2,
      createdBy,
    });
    inserted++;
  }

  console.log(`Books: ${inserted} inserted, ${skipped} already existed.`);
  console.log('\nSeed complete. Default passwords: ' + DEFAULT_PASSWORD);
  console.log('Admin: admin@library.local | Librarians: librarian@library.local, librarian2@library.local');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
