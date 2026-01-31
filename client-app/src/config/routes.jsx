import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { ROLES } from '../stores/authStore';
import { RoleRoute } from '../components/routing/RoleRoute';
import { getDefaultRedirect } from '../lib/redirectByRole';
import { useAuthStore } from '../stores/authStore';

// Root redirect: logged in -> dashboard by role, else -> login
function RootRedirect() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuth = Boolean(accessToken && user);
  const to = isAuth ? getDefaultRedirect(user?.role) : '/login';
  return <Navigate to={to} replace />;
}

// Common pages (no auth or all roles)
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Unauthorized = lazy(() => import('../pages/Unauthorized'));

// Layout
const AppLayout = lazy(() => import('../components/layout/AppLayout'));

// Role-specific: dashboards
const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard'));
const LibrarianDashboard = lazy(() => import('../pages/librarian/LibrarianDashboard'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));

// Shared pages (used inside layout per role)
const Books = lazy(() => import('../pages/Books'));
const Profile = lazy(() => import('../pages/Profile'));
const Borrowings = lazy(() => import('../pages/Borrowings'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));

/** Maps our config keys to server role values */
const roleKeyToServerRole = {
  student: ROLES.STUDENT,
  librarian: ROLES.LIBRARIAN,
  admin: ROLES.ADMIN,
};

/**
 * Build React Router route objects.
 * Common routes are unprotected; role routes use nested layout (Sidebar + Navbar) with RoleRoute.
 */
export function buildRoutes() {
  const routes = [
    // Root: redirect to dashboard (if logged in) or login
    { path: '/', element: <RootRedirect /> },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/unauthorized', element: <Unauthorized /> },

    // Student: layout + nested pages
    {
      path: '/student',
      element: (
        <RoleRoute allowedRoles={[roleKeyToServerRole.student]}>
          <AppLayout />
        </RoleRoute>
      ),
      children: [
        { index: true, element: <StudentDashboard /> },
        { path: 'books', element: <Books /> },
        { path: 'borrowings', element: <Borrowings /> },
        { path: 'profile', element: <Profile /> },
      ],
    },

    // Librarian: layout + nested pages
    {
      path: '/librarian',
      element: (
        <RoleRoute allowedRoles={[roleKeyToServerRole.librarian]}>
          <AppLayout />
        </RoleRoute>
      ),
      children: [
        { index: true, element: <LibrarianDashboard /> },
        { path: 'books', element: <Books /> },
        { path: 'borrowings', element: <Borrowings /> },
        { path: 'profile', element: <Profile /> },
      ],
    },

    // Admin: layout + nested pages
    {
      path: '/admin',
      element: (
        <RoleRoute allowedRoles={[roleKeyToServerRole.admin]}>
          <AppLayout />
        </RoleRoute>
      ),
      children: [
        { index: true, element: <AdminDashboard /> },
        { path: 'books', element: <Books /> },
        { path: 'borrowings', element: <Borrowings /> },
        { path: 'users', element: <AdminUsers /> },
        { path: 'profile', element: <Profile /> },
      ],
    },
  ];

  return routes;
}

/** Route config for nav (path + title) per role */
export const routeConfig = {
  common: [
    { path: '/login', title: 'Login' },
    { path: '/register', title: 'Register' },
    { path: '/unauthorized', title: 'Unauthorized' },
  ],
  student: [
    { path: '/student', title: 'Dashboard' },
    { path: '/student/books', title: 'Books' },
    { path: '/student/borrowings', title: 'My Borrowings' },
    { path: '/student/profile', title: 'Profile' },
  ],
  librarian: [
    { path: '/librarian', title: 'Dashboard' },
    { path: '/librarian/books', title: 'Books' },
    { path: '/librarian/borrowings', title: 'Issue / Return' },
    { path: '/librarian/profile', title: 'Profile' },
  ],
  admin: [
    { path: '/admin', title: 'Dashboard' },
    { path: '/admin/books', title: 'Books' },
    { path: '/admin/borrowings', title: 'Borrowings' },
    { path: '/admin/users', title: 'Users' },
    { path: '/admin/profile', title: 'Profile' },
  ],
};

/**
 * Flatten all paths for a given role (for nav links).
 * @param {'student'|'librarian'|'admin'} roleKey
 */
export function getPathsForRole(roleKey) {
  const common = routeConfig.common.map((r) => ({ ...r, role: null }));
  const roleRoutes = routeConfig[roleKey];
  if (!roleRoutes) return common;
  return [...common, ...roleRoutes.map((r) => ({ ...r, role: roleKey }))];
}
