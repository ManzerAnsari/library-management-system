import { ROLES } from '../stores/authStore';

/**
 * Default path after login for a given server role.
 * @param {string} role - 'user' | 'librarian' | 'admin'
 * @returns {string}
 */
export function getDefaultRedirect(role) {
  switch (role) {
    case ROLES.STUDENT:
      return '/student';
    case ROLES.LIBRARIAN:
      return '/librarian';
    case ROLES.ADMIN:
      return '/admin';
    default:
      return '/login';
  }
}
