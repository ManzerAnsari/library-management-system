import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Server roles: 'user' (student), 'librarian', 'admin'
 * Use hasRole('user') for student, hasRole('librarian'), hasRole('admin')
 */
export const ROLES = Object.freeze({
  STUDENT: 'user',
  LIBRARIAN: 'librarian',
  ADMIN: 'admin',
});

/** @param {string} role - Server role */
export function isAllowedRole(role) {
  return Object.values(ROLES).includes(role);
}

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null, // { id, fullname, email, role }
      accessToken: null,

      setAuth: (user, accessToken) => set({ user, accessToken }),

      logout: () => set({ user: null, accessToken: null }),

      isAuthenticated: () => {
        const state = useAuthStore.getState();
        return Boolean(state.accessToken && state.user);
      },

      /** @param {string} role - One of ROLES (e.g. ROLES.STUDENT) */
      hasRole: (role) => {
        const state = useAuthStore.getState();
        return state.user?.role === role;
      },

      /** @param {string[]} roles - Allowed roles */
      hasAnyRole: (roles) => {
        const state = useAuthStore.getState();
        const userRole = state.user?.role;
        return userRole && roles.includes(userRole);
      },
    }),
    { name: 'auth-storage' }
  )
);
