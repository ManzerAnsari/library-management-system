import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ProtectedRoute } from './ProtectedRoute';

/**
 * Requires auth + one of allowedRoles (server role values: 'user', 'librarian', 'admin').
 * - Not logged in -> redirect to /login
 * - Logged in but wrong role -> redirect to /unauthorized
 */
export function RoleRoute({ children, allowedRoles = [] }) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.accessToken && s.user);
  const hasAllowedRole = user && allowedRoles.length > 0 && allowedRoles.includes(user.role);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAllowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
