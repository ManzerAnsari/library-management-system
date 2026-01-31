import api from '../lib/axios';

/**
 * GET /users – list users (admin: all; librarian: use role=user for students)
 * @param {{ page?: number, limit?: number, q?: string, role?: 'user'|'librarian'|'admin' }} params
 */
export async function listUsers(params = {}) {
  const { data } = await api.get('/users', { params });
  return data;
}

/**
 * POST /users – create user (admin only). role: 'user' | 'librarian'
 */
export async function createUser(body) {
  const { data } = await api.post('/users', body);
  return data;
}

/**
 * DELETE /users/:id – remove user (admin only)
 */
export async function deleteUser(id) {
  const { data } = await api.delete(`/users/${id}`);
  return data;
}
