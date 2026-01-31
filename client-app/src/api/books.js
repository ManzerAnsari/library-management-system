import api from '../lib/axios';

/**
 * GET /books – list books (paginated, search)
 * @param {{ page?: number, limit?: number, q?: string, sort?: string }} params
 */
export async function listBooks(params = {}) {
  const { data } = await api.get('/books', { params });
  return data;
}

/**
 * GET /books/:id – get one book
 */
export async function getBook(id) {
  const { data } = await api.get(`/books/${id}`);
  return data;
}

/**
 * POST /books – create book (librarian/admin)
 */
export async function createBook(body) {
  const { data } = await api.post('/books', body);
  return data;
}

/**
 * PUT /books/:id – update book (librarian/admin)
 */
export async function updateBook(id, body) {
  const { data } = await api.put(`/books/${id}`, body);
  return data;
}

/**
 * DELETE /books/:id – delete book (librarian/admin)
 */
export async function deleteBook(id) {
  const { data } = await api.delete(`/books/${id}`);
  return data;
}
