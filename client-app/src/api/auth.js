import api from '../lib/axios';
import { useAuthStore } from '../stores/authStore';

/**
 * POST /auth/register – request OTP for registration
 * @param {{ fullname, email, password, mobileNumber?, collegeUserId? }} body
 * @returns {Promise<{ message: string }>}
 */
export async function registerRequest(body) {
  const { data } = await api.post('/auth/register', body);
  return data;
}

/**
 * POST /auth/register/resend – resend OTP to email (must have pending registration)
 * @param {{ email: string }} body
 * @returns {Promise<{ message: string }>}
 */
export async function registerResendOtp(body) {
  const { data } = await api.post('/auth/register/resend', body);
  return data;
}

/**
 * POST /auth/register/verify – verify OTP and complete registration (returns user + token)
 * @param {{ email: string, code: string }} body
 * @returns {Promise<{ accessToken: string, user: { id, fullname, email, role } }>}
 */
export async function registerVerify(body) {
  const { data } = await api.post('/auth/register/verify', body);
  return data;
}

/**
 * POST /auth/login
 * @param {{ email: string, password: string }} body
 * @returns {Promise<{ accessToken: string, user: { id, fullname, email, role } }>}
 */
export async function login(body) {
  const { data } = await api.post('/auth/login', body);
  return data;
}

/**
 * POST /auth/logout – clears refresh cookie; then clear client store
 */
export async function logout() {
  try {
    await api.post('/auth/logout');
  } finally {
    useAuthStore.getState().logout();
  }
}

/**
 * GET /auth/me – get current user (e.g. after refresh)
 * @returns {Promise<{ user: { id, fullname, email, role, ... } }>}
 */
export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data;
}

/**
 * PUT /auth/me – update own profile
 * @param {{ fullname?: string, email?: string, mobileNumber?: string, collegeUserId?: string }} body
 */
export async function updateProfile(body) {
  const { data } = await api.put('/auth/me', body);
  return data;
}
