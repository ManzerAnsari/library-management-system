import { ROLES } from '../stores/authStore';

/**
 * Sidebar nav items per role.
 * path is relative to role base: /student, /librarian, /admin
 */
export const navConfig = {
  student: [
    { key: 'dashboard', path: '/student', label: 'Dashboard', icon: 'mdi:view-dashboard-outline' },
    { key: 'books', path: '/student/books', label: 'Books', icon: 'mdi:book-open-variant' },
    { key: 'borrowings', path: '/student/borrowings', label: 'My Borrowings', icon: 'mdi:book-account-outline' },
  ],
  librarian: [
    { key: 'dashboard', path: '/librarian', label: 'Dashboard', icon: 'mdi:view-dashboard-outline' },
    { key: 'books', path: '/librarian/books', label: 'Books', icon: 'mdi:book-open-variant' },
    { key: 'borrowings', path: '/librarian/borrowings', label: 'Issue / Return', icon: 'mdi:book-plus-outline' },
  ],
  admin: [
    { key: 'dashboard', path: '/admin', label: 'Dashboard', icon: 'mdi:view-dashboard-outline' },
    { key: 'books', path: '/admin/books', label: 'Books', icon: 'mdi:book-open-variant' },
    { key: 'borrowings', path: '/admin/borrowings', label: 'Borrowings', icon: 'mdi:book-account-outline' },
    { key: 'users', path: '/admin/users', label: 'Users', icon: 'mdi:account-group-outline' },
  ],
};

/** Base path per role (used to derive role from location) */
export const roleBasePath = {
  student: '/student',
  librarian: '/librarian',
  admin: '/admin',
};

/** Get role key from pathname (student | librarian | admin) */
export function getRoleKeyFromPath(pathname) {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/librarian')) return 'librarian';
  if (pathname.startsWith('/student')) return 'student';
  return null;
}

/** Server role to role key */
export function serverRoleToKey(serverRole) {
  if (serverRole === ROLES.STUDENT) return 'student';
  if (serverRole === ROLES.LIBRARIAN) return 'librarian';
  if (serverRole === ROLES.ADMIN) return 'admin';
  return null;
}
