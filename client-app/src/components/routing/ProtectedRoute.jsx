import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

/**
 * Renders children only when the user is authenticated.
 * Otherwise redirects to /login, preserving the attempted URL in state.
 */
export function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.accessToken && s.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
