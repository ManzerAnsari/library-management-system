import api from '../lib/axios';

/**
 * GET /borrowings – list borrowings (user: own; librarian/admin: all with filters)
 * @param {{ page?: number, limit?: number, status?: string, userId?: string, bookId?: string }} params
 */
export async function listBorrowings(params = {}) {
  const { data } = await api.get('/borrowings', { params });
  return data;
}

/**
 * GET /borrowings/:id – get one borrowing
 */
export async function getBorrowing(id) {
  const { data } = await api.get(`/borrowings/${id}`);
  return data;
}

/**
 * POST /borrowings – issue book to user (librarian/admin)
 * @param {{ bookId: string, userId: string }}
 */
export async function borrowBook(body) {
  const { data } = await api.post('/borrowings', body);
  return data;
}

/**
 * POST /borrowings/:id/return – mark as returned (librarian/admin)
 */
export async function returnBorrowing(id) {
  const { data } = await api.post(`/borrowings/${id}/return`);
  return data;
}
